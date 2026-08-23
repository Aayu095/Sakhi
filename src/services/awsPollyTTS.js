import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { CONFIG } from '../config/config';

/**
 * AWS Polly TTS Service — replaces expo-speech
 * Calls Lambda backend to generate speech using Amazon Polly (Kajal voice)
 * Saves audio to temp file and plays through expo-av
 */
class AwsPollyTTS {
    constructor() {
        this.currentSound = null;
        this.isPlaying = false;
        this.apiBaseUrl = CONFIG.AWS.apiGatewayUrl;
    }

    /**
     * Speak text using Amazon Polly
     * @param {string} text - Text to speak (Hindi/Hinglish)
     * @param {Object} options - { language, speed, onStart, onDone, onError }
     */
    async speak(text, options = {}) {
        const {
            language = 'hi-IN',
            speed = 'medium',
            onStart = () => { },
            onDone = () => { },
            onError = () => { },
        } = options;

        try {
            // Stop any current playback
            await this.stop();

            onStart();
            this.isPlaying = true;

            // Without an explicitly configured backend, use device speech
            // directly instead of logging a cloud-service failure first.
            if (!this.apiBaseUrl) {
                const Speech = require('expo-speech');
                onStart();
                Speech.speak(text, {
                    language,
                    pitch: 1.0,
                    rate: 0.9,
                    onDone,
                    onError,
                });
                return;
            }

            const response = await fetch(`${this.apiBaseUrl}/api/speak`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, language, speed }),
            });

            const data = await response.json();

            if (!data.success || !data.audioBase64) {
                throw new Error(data.error || 'Failed to generate speech');
            }

            // Write base64 audio to a temp file (expo-av doesn't support data URIs on native)
            const tempFileUri = `${FileSystem.cacheDirectory}sakhi_tts_${Date.now()}.mp3`;
            await FileSystem.writeAsStringAsync(tempFileUri, data.audioBase64, {
                encoding: 'base64',
            });

            // Configure audio mode for playback
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                allowsRecordingIOS: false,
            });

            // Create and play the sound from temp file
            const { sound } = await Audio.Sound.createAsync(
                { uri: tempFileUri },
                { shouldPlay: true, volume: 1.0 }
            );

            this.currentSound = sound;
            this._tempFileUri = tempFileUri;

            // Listen for playback completion
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    this.isPlaying = false;
                    this.cleanup();
                    onDone();
                }
                if (status.error) {
                    this.isPlaying = false;
                    this.cleanup();
                    onError(status.error);
                }
            });

        } catch (error) {
            console.error('Polly TTS error:', error);
            this.isPlaying = false;

            // Fallback to expo-speech if Polly fails
            try {
                const Speech = require('expo-speech');
                Speech.speak(text, {
                    language: language,
                    pitch: 1.0,
                    rate: 0.9,
                    onStart,
                    onDone,
                    onError: (e) => {
                        console.error('Fallback speech error:', e);
                        onError(e);
                    },
                });
            } catch (fallbackError) {
                console.error('Both Polly and fallback speech failed:', fallbackError);
                onError(error);
            }
        }
    }

    /**
     * Stop current playback
     */
    async stop() {
        try {
            if (this.currentSound) {
                await this.currentSound.stopAsync();
                await this.cleanup();
            }
            this.isPlaying = false;
        } catch (error) {
            console.log('Stop error (non-critical):', error.message);
            this.isPlaying = false;
        }
    }

    /**
     * Clean up sound resources and temp file
     */
    async cleanup() {
        try {
            if (this.currentSound) {
                await this.currentSound.unloadAsync();
                this.currentSound = null;
            }
            // Delete temp audio file
            if (this._tempFileUri) {
                try {
                    await FileSystem.deleteAsync(this._tempFileUri, { idempotent: true });
                } catch (e) {
                    // Non-critical — cache will clean up eventually
                }
                this._tempFileUri = null;
            }
        } catch (error) {
            console.log('Cleanup error (non-critical):', error.message);
        }
    }

    /**
     * Check if currently speaking
     */
    isSpeaking() {
        return this.isPlaying;
    }
}

// Singleton instance
const pollyTTS = new AwsPollyTTS();
export default pollyTTS;
