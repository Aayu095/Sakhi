import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { CONFIG } from '../config/config';

// STT Providers
export const STT_PROVIDERS = {
  REAL: 'cloud',      // Optional Gemini audio transcription
  DEMO: 'manual',     // Clearly labelled typed-response fallback
};

// Language codes for Indian languages
export const SUPPORTED_LANGUAGES = {
  'hi-IN': { name: 'हिंदी', code: 'hi-IN' },
  'en-IN': { name: 'English (India)', code: 'en-IN' },
};

// Audio recording instance
let recording = null;

/**
 * Start recording audio
 */
export async function startRecording() {
  try {
    // FORCE CLEANUP ORPHANED RECORDING
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {
        // ignore cleanup errors
      }
      recording = null;
    }

    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      console.warn('Audio recording permission not granted');
      return false;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const options = {
      isMeteringEnabled: true,
      android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    };

    const { recording: rec } = await Audio.Recording.createAsync(options);

    recording = rec;
    console.log('🎤 Recording started');
    return rec;
  } catch (error) {
    console.error('Failed to start recording:', error);
    recording = null;
    return null;
  }
}

/**
 * Stop recording and send audio to the optional cloud transcription service.
 */
export async function stopRecordingAndTranscribe(language = 'hi-IN') {
  try {
    if (!recording) {
      return { success: false, text: '', error: 'No active recording' };
    }

    await recording.stopAndUnloadAsync();
    let uri = recording.getURI();
    recording = null;

    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

    if (!uri) {
      return { success: false, text: '', error: 'No audio URI' };
    }

    // CRITICAL FIX FOR BARE ANDROID APK
    // Expo Go handles URIs differently than compiled Android.
    // If the URI doesn't start with file://, FileSystem will silently crash in production.
    if (Platform.OS === 'android' && !uri.startsWith('file://')) {
      uri = `file://${uri}`;
    }

    console.log('🎤 Recording stopped, reading audio file from:', uri);

    // Read audio as base64
    const audioBase64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Check size — API Gateway limit is ~6MB for Lambda payload
    const sizeInBytes = (audioBase64.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    console.log(`🎤 Audio size: ${sizeInMB.toFixed(2)} MB`);

    if (sizeInMB > 5) {
      console.warn('Audio too large, using demo fallback');
      return { success: false, text: '', error: 'Audio file too large' };
    }

    console.log('🎤 Sending to Gemini for STT fallback...');

    const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error("Missing Gemini API key for STT fallback");
      return { success: false, text: '', error: 'Missing API Key' };
    }

    const payload = {
      contents: [{
        parts: [
          {
            text: `You are an accurate Hindi Speech-to-Text engine. Focus solely on transcribing the speech exactly as spoken into Hindi script (Devanagari). If the audio contains English words, simply transliterate them natively into Hindi or use the English word. Ignore background noise. Do not output anything except the transcription of the speech. If the audio is silent or unintelligible, return "[SILENT]". Language context: ${language}`
          },
          {
            inline_data: {
              mime_type: 'audio/m4a',
              data: audioBase64
            }
          }
        ]
      }]
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await response.json();

    console.log('🎤 Gemini STT raw response length:', JSON.stringify(data).length);

    if (!response.ok) {
      const apiError = data.error?.message || JSON.stringify(data);
      console.error('🎤 Gemini API Error:', response.status, apiError);
      return {
        success: false,
        text: '',
        error: `STT API ${response.status}: ${apiError}`
      };
    }

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const text = data.candidates[0].content.parts[0].text.trim();

      if (text === '[SILENT]') {
        return { success: false, text: '', error: 'No speech detected' };
      }

      console.log('🎤 Gemini STT Output:', text);
      return {
        success: true,
        text,
        confidence: 0.95,
        language,
        provider: 'gemini-stt',
      };
    }

    console.warn('🎤 Gemini STT returned empty or failed:', JSON.stringify(data).substring(0, 200));
    return {
      success: false,
      text: '',
      error: 'Transcription API failed',
      provider: 'gemini-stt',
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('🎤 Transcribe timeout (>20s)');
      return { success: false, text: '', error: 'Transcription timed out' };
    }
    console.error('🎤 Transcription error:', error.message);
    return { success: false, text: '', error: error.message };
  }
}

/**
 * Cancel an active recording
 */
export async function cancelRecording() {
  try {
    if (recording) {
      await recording.stopAndUnloadAsync();
      recording = null;
    }
  } catch (error) {
    recording = null;
  }
}

/**
 * Cloud transcription is opt-in. Without a configured public client key, the
 * call screen must use its labelled typed fallback and never upload audio.
 */
export function isRealSTTAvailable() {
  return Boolean(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
}

/**
 * Utility exports
 */
export async function requestSTTPermissions() {
  const { granted } = await Audio.requestPermissionsAsync();
  return { granted };
}

export function stopRealSTT() { cancelRecording(); }
export function getAvailableLanguages() { return Object.values(SUPPORTED_LANGUAGES); }
