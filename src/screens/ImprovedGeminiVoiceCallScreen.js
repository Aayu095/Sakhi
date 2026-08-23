import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  ActivityIndicator,
  Vibration,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AwsVoiceAssistant from '../services/awsVoiceAssistant';
import pollyTTS from '../services/awsPollyTTS';
import { startRecording as startAudioRecording, stopRecordingAndTranscribe, cancelRecording, isRealSTTAvailable, STT_PROVIDERS } from '../services/speechToText';
import { useAuth } from '../providers/AuthProvider';
import GradientBackground from '../components/GradientBackground';
import VoiceVisualizer from '../components/VoiceVisualizer';
import AnimatedDidiAvatar from '../components/AnimatedDidiAvatar';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';

// Call status constants
const CALL_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  ENDED: 'ended'
};

const TOPIC_DETAILS = {
  general: {
    title: 'सखी से बात करें',
    subtitle: 'जो समझ न आए, बस बोलकर पूछें।',
  },
  digital_literacy: {
    title: 'फोन चलाना सीखें',
    subtitle: 'फोन, WhatsApp और इंटरनेट के बारे में पूछें।',
  },
  financial_literacy: {
    title: 'पैसे और ऑनलाइन सुरक्षा',
    subtitle: 'UPI, OTP और fraud से बचाव के बारे में पूछें।',
  },
  general_health: {
    title: 'सेहत की जानकारी',
    subtitle: 'अपनी सेहत के बारे में सामान्य जानकारी पूछें।',
  },
  menstrual_health: {
    title: 'महावारी की जानकारी',
    subtitle: 'आराम से अपनी बात पूछें।',
  },
  pregnancy_care: {
    title: 'गर्भावस्था की देखभाल',
    subtitle: 'सामान्य जानकारी और सावधानियों के बारे में पूछें।',
  },
  legal_rights: {
    title: 'अपने हक़ जानें',
    subtitle: 'सुरक्षा और अधिकारों के बारे में पूछें।',
  },
};

export default function ImprovedGeminiVoiceCallScreen({ route, navigation }) {
  const { topic = 'general' } = route.params || {};
  const { profile } = useAuth();
  const { width, height } = useWindowDimensions();
  const isCompactLayout = height < 720;
  const callAvatarSize = Math.min(Math.round(width * 0.48), isCompactLayout ? 156 : 184);

  // Call state
  const [callStatus, setCallStatus] = useState(CALL_STATUS.CONNECTING);
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceIntensity, setVoiceIntensity] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);

  // Conversation state
  const [conversationLog, setConversationLog] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [avatarEmotion, setAvatarEmotion] = useState('welcoming');
  const [sttProvider, setSttProvider] = useState(STT_PROVIDERS.DEMO);
  const [aiStatus, setAiStatus] = useState('ready');
  const [sttFailed, setSttFailed] = useState(false);
  const [isVoiceInputAvailable, setIsVoiceInputAvailable] = useState(() => isRealSTTAvailable());
  const [textMessage, setTextMessage] = useState('');
  const [isTextComposerOpen, setIsTextComposerOpen] = useState(false);
  const assistantRef = useRef(new AwsVoiceAssistant());

  // Refs
  const callStartTime = useRef(Date.now());
  const intensityInterval = useRef(null);
  const callTimer = useRef(null);
  const greetingTimeout = useRef(null);
  const resumeListeningTimeout = useRef(null);
  const endCallTimeout = useRef(null);
  const endedRef = useRef(false);
  const voiceInputUnavailableRef = useRef(!isRealSTTAvailable());

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    endedRef.current = false;
    initializeCall();
    startCallTimer();

    // When the route loses focus, stop all media and prevent delayed callbacks
    // from restarting the microphone in the background.
    const unsubscribeBlur = navigation.addListener('blur', () => {
      endedRef.current = true;
      cleanup();
    });

    return () => {
      unsubscribeBlur();
      endedRef.current = true;
      cleanup();
    };
  }, [navigation]);

  const initializeCall = async () => {
    try {
      const assistant = assistantRef.current;
      assistant.setUserProfile(profile);

      // Voice uploads are only enabled when an explicit cloud STT key exists.
      // Otherwise the screen stays usable through the labelled typed fallback.
      const realSTT = isRealSTTAvailable();
      voiceInputUnavailableRef.current = !realSTT;
      setIsVoiceInputAvailable(realSTT);
      setSttProvider(realSTT ? STT_PROVIDERS.REAL : STT_PROVIDERS.DEMO);
      console.log(realSTT ? '🎤 Optional cloud transcription is available' : '⌨️ Using typed practice mode (STT not configured)');

      const initialResponse = await assistant.startConversation(topic);
      if (endedRef.current) return;

      setConversationLog([{
        role: 'assistant',
        content: initialResponse.text,
        timestamp: Date.now(),
        isRealAI: true,
      }]);

      greetingTimeout.current = setTimeout(() => {
        if (endedRef.current) return;
        setCallStatus(CALL_STATUS.CONNECTED);
        speakMessage(initialResponse.text, 'welcoming');
      }, 2000);
    } catch (error) {
      console.error('Error initializing call:', error);
      if (endedRef.current) return;
      Alert.alert('कॉल कनेक्ट नहीं हो सका', 'कृपया फिर से कोशिश करें।');
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  const startCallTimer = () => {
    callTimer.current = setInterval(() => {
      if (!endedRef.current) {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
      }
    }, 1000);
  };

  const cleanup = () => {
    cancelRecording();
    if (intensityInterval.current) clearInterval(intensityInterval.current);
    if (callTimer.current) clearInterval(callTimer.current);
    if (greetingTimeout.current) clearTimeout(greetingTimeout.current);
    if (resumeListeningTimeout.current) clearTimeout(resumeListeningTimeout.current);
    if (endCallTimeout.current) clearTimeout(endCallTimeout.current);
    intensityInterval.current = null;
    callTimer.current = null;
    greetingTimeout.current = null;
    resumeListeningTimeout.current = null;
    endCallTimeout.current = null;
    pollyTTS.stop();
    Speech.stop();
    assistantRef.current.clearConversation();
  };

  const speakMessage = async (text, emotion = 'neutral') => {
    if (endedRef.current) return;

    try {
      setCallStatus(CALL_STATUS.SPEAKING);
      setAvatarEmotion(emotion);
      setCurrentMessage(text);
      setAiStatus('responding');
      startVoiceVisualization();

      // Polly falls back to device speech when a cloud backend is unavailable.
      await pollyTTS.speak(text, {
        language: profile?.language || 'hi-IN',
        speed: 'medium',
        onStart: () => {
          if (!endedRef.current) setCallStatus(CALL_STATUS.SPEAKING);
        },
        onDone: () => {
          if (endedRef.current) return;
          setCallStatus(CALL_STATUS.CONNECTED);
          setVoiceIntensity(0);
          setAvatarEmotion('neutral');
          setAiStatus('ready');
          if (intensityInterval.current) clearInterval(intensityInterval.current);

          // Only resume the microphone when transcription remains available.
          if (!voiceInputUnavailableRef.current) {
            resumeListeningTimeout.current = setTimeout(() => {
              if (!endedRef.current && !voiceInputUnavailableRef.current) {
                handleStartRecording();
              }
            }, 300);
          }
        },
        onError: () => {
          if (endedRef.current) return;
          setCallStatus(CALL_STATUS.CONNECTED);
          setVoiceIntensity(0);
          setAiStatus('ready');
        },
      });
    } catch (error) {
      console.error('Speech error:', error);
      if (!endedRef.current) {
        setCallStatus(CALL_STATUS.CONNECTED);
        setAiStatus('ready');
      }
    }
  };

  const startVoiceVisualization = () => {
    if (endedRef.current) return;
    if (intensityInterval.current) clearInterval(intensityInterval.current);
    intensityInterval.current = setInterval(() => {
      if (!endedRef.current) {
        setVoiceIntensity(Math.random() * 0.8 + 0.2);
      }
    }, 150);
  };

  const determineEmotionFromText = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('शाबाश') || lowerText.includes('बहुत अच्छा') || lowerText.includes('बधाई')) return 'proud';
    if (lowerText.includes('चिंता') || lowerText.includes('समस्या') || lowerText.includes('डॉक्टर')) return 'concerned';
    if (lowerText.includes('खुश') || lowerText.includes('अच्छा लगा')) return 'happy';
    if (lowerText.includes('हिम्मत') || lowerText.includes('कोशिश') || lowerText.includes('सीखना')) return 'encouraging';
    return 'neutral';
  };

  const processUserMessage = async (userMessage, sttSuccess) => {
    if (endedRef.current || !userMessage?.trim()) return;

    try {
      setAiStatus('processing');
      setIsProcessing(true);
      setConversationLog(prev => [...prev, {
        role: 'user', content: userMessage, timestamp: Date.now(), sttProvider, sttSuccess,
      }]);

      // The assistant returns a helpful local response whenever the optional
      // AWS service is unavailable.
      const aiResponse = await assistantRef.current.sendMessage(userMessage);
      if (endedRef.current) return;

      setConversationLog(prev => [...prev, {
        role: 'assistant', content: aiResponse.text, timestamp: Date.now(), isRealAI: true, topic,
      }]);

      const emotion = aiResponse.emotion || determineEmotionFromText(aiResponse.text);
      await speakMessage(aiResponse.text, emotion);

      if (aiResponse.shouldEnd) {
        endCallTimeout.current = setTimeout(() => {
          if (!endedRef.current) endCall();
        }, 2000);
      }
    } catch (error) {
      console.error('Process message error:', error);
      if (!endedRef.current) {
        await speakMessage('मुझे समझने में थोड़ी देर लगी। कृपया अपना सवाल लिखकर फिर से भेजें।', 'concerned');
      }
    } finally {
      if (!endedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  // Adjusted for better background noise rejection (VAD) across varying Android hardware
  const silenceThreshold = -45; // dB (lowered from -32dB. Bare Android hardware often reports quiet environments as -50dB to -60dB)
  const silenceDurationMs = 3000; // Stop after 3 seconds of silence instead of exactly 1.2s to guarantee user can breathe/pause
  const silenceStartRef = useRef(null);
  const isStoppingRef = useRef(false); // Prevent multiple stop triggers

  const handleStartRecording = async () => {
    try {
      if (endedRef.current) return;

      if (voiceInputUnavailableRef.current) {
        setSttFailed(true);
        setCallStatus(CALL_STATUS.CONNECTED);
        return;
      }

      if (callStatus === CALL_STATUS.SPEAKING) {
        pollyTTS.stop();
        Speech.stop();
      }
      setIsRecording(true);
      isStoppingRef.current = false;
      setCallStatus(CALL_STATUS.LISTENING);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Vibration.vibrate(100);

      // We will now monitor audio levels to implement Auto-VAD
      const recordingObj = await startAudioRecording();
      if (recordingObj) {
        if (intensityInterval.current) clearInterval(intensityInterval.current);
        silenceStartRef.current = null;

        recordingObj.setOnRecordingStatusUpdate((status) => {
          if (endedRef.current || !status.isRecording || isStoppingRef.current) return;

          if (status.metering !== undefined) {
            const currentLevel = status.metering;
            const normalizedIntensity = Math.max(0.12, Math.min(1, (currentLevel + 60) / 42));
            setVoiceIntensity(normalizedIntensity);

            // If volume is lower than threshold (user stopped speaking)
            if (currentLevel < silenceThreshold) {
              if (silenceStartRef.current === null) {
                silenceStartRef.current = Date.now();
              } else if (Date.now() - silenceStartRef.current > silenceDurationMs) {
                // User has been silent for 1.2 seconds -> auto stop!
                isStoppingRef.current = true;
                recordingObj.setOnRecordingStatusUpdate(null);
                handleStopRecording();
              }
            } else {
              // User is speaking loudly again, reset silence timer
              silenceStartRef.current = null;
            }
          }
        });
      } else if (!endedRef.current) {
        Alert.alert('अनुमति चाहिए', 'कृपया माइक्रोफोन की अनुमति दें। आप चाहें तो नीचे लिखकर भी जवाब दे सकती हैं।');
        voiceInputUnavailableRef.current = true;
        setIsVoiceInputAvailable(false);
        setIsRecording(false);
        setSttFailed(true);
        setCallStatus(CALL_STATUS.CONNECTED);
      }
    } catch (error) {
      console.error('Recording error:', error);
      if (!endedRef.current) {
        voiceInputUnavailableRef.current = true;
        setIsVoiceInputAvailable(false);
        setIsRecording(false);
        setCallStatus(CALL_STATUS.CONNECTED);
        setSttFailed(true);
      }
    }
  };

  const handleStopRecording = async () => {
    if (endedRef.current) return;

    try {
      setIsProcessing(true);
      setCallStatus(CALL_STATUS.PROCESSING);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsRecording(false);
      setVoiceIntensity(0);
      if (intensityInterval.current) clearInterval(intensityInterval.current);

      const sttResult = await stopRecordingAndTranscribe(profile?.language || 'hi-IN');
      if (endedRef.current) return;

      if (sttResult.success && sttResult.text) {
        console.log('🎤 Cloud transcription succeeded');
        setSttFailed(false);
        await processUserMessage(sttResult.text, true);
      } else {
        console.warn('🎤 Transcription unavailable:', sttResult.error);
        voiceInputUnavailableRef.current = true;
        setIsVoiceInputAvailable(false);
        setSttFailed(true);
        setIsProcessing(false);
        setCallStatus(CALL_STATUS.CONNECTED);
        await speakMessage('आवाज़ से जवाब अभी उपलब्ध नहीं है। आप नीचे लिखकर अपना सवाल भेज सकती हैं।', 'concerned');
      }
    } catch (error) {
      console.error('Stop recording error:', error);
      if (!endedRef.current) {
        voiceInputUnavailableRef.current = true;
        setIsVoiceInputAvailable(false);
        setIsRecording(false);
        setIsProcessing(false);
        setCallStatus(CALL_STATUS.CONNECTED);
        setSttFailed(true);
        await speakMessage('आवाज़ से जवाब अभी उपलब्ध नहीं है। आप नीचे लिखकर अपना सवाल भेज सकती हैं।', 'concerned');
      }
    }
  };

  const handleSendTextMessage = async () => {
    const message = textMessage.trim();
    if (!message || isProcessing || endedRef.current) return;

    setTextMessage('');
    await processUserMessage(message, false);
  };

  const openTextComposer = () => {
    if (callStatus !== CALL_STATUS.ENDED) {
      setIsTextComposerOpen(true);
    }
  };

  const closeTextComposer = () => {
    setTextMessage('');
    setIsTextComposerOpen(false);
  };

  const endCall = () => {
    if (endedRef.current) return;

    endedRef.current = true;
    setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
    setIsRecording(false);
    setIsProcessing(false);
    setVoiceIntensity(0);
    setCallStatus(CALL_STATUS.ENDED);
    cleanup();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowEndModal(true);
  };

  const returnHome = () => {
    endedRef.current = true;
    cleanup();
    setShowEndModal(false);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const topicDetail = TOPIC_DETAILS[topic] || TOPIC_DETAILS.general;
  const usesTextFallback = !isVoiceInputAvailable || sttFailed;
  const userReplyCount = conversationLog.filter((entry) => entry.role === 'user').length;
  const latestUserTurn = [...conversationLog].reverse().find((entry) => entry.role === 'user');
  const latestAssistantTurn = [...conversationLog].reverse().find((entry) => entry.role === 'assistant');
  const stateInfo = {
    [CALL_STATUS.CONNECTING]: {
      icon: 'connection',
      title: 'सखी जुड़ रही हैं',
      detail: 'बस एक पल रुकिए।',
      tone: styles.stateConnecting,
    },
    [CALL_STATUS.CONNECTED]: usesTextFallback ? {
      icon: 'keyboard-outline',
      title: 'लिखकर जवाब दें',
      detail: 'लिखने का विकल्प खोलकर अपना सवाल भेजें।',
      tone: styles.stateFallback,
    } : {
      icon: 'microphone-outline',
      title: 'बोलने के लिए तैयार',
      detail: 'माइक दबाएं और आराम से बोलें।',
      tone: styles.stateReady,
    },
    [CALL_STATUS.LISTENING]: {
      icon: 'waveform',
      title: 'सखी सुन रही हैं',
      detail: 'बोलना पूरा होने पर जवाब अपने-आप भेजा जाएगा।',
      tone: styles.stateListening,
    },
    [CALL_STATUS.PROCESSING]: {
      icon: 'dots-horizontal-circle-outline',
      title: 'आपकी बात समझ रही हैं',
      detail: 'एक छोटा सा पल रुकिए।',
      tone: styles.stateProcessing,
    },
    [CALL_STATUS.SPEAKING]: {
      icon: 'volume-high',
      title: 'सखी जवाब दे रही हैं',
      detail: 'आराम से सुनें, फिर जवाब दे सकती हैं।',
      tone: styles.stateSpeaking,
    },
    [CALL_STATUS.ENDED]: {
      icon: 'check-circle-outline',
      title: 'बातचीत पूरी हुई',
      detail: 'आपने बहुत अच्छा किया।',
      tone: styles.stateReady,
    },
  }[callStatus];

  const stopAssistantSpeech = () => {
    pollyTTS.stop();
    Speech.stop();
    if (intensityInterval.current) clearInterval(intensityInterval.current);
    setVoiceIntensity(0);
    if (callStatus === CALL_STATUS.SPEAKING) {
      setCallStatus(CALL_STATUS.CONNECTED);
      setAiStatus('ready');
    }
  };

  // --- RENDER HELPERS ---

  const renderCallHeader = () => (
    <View style={styles.topBar}>
      <Pressable
        style={styles.topBarIconButton}
        onPress={returnHome}
        accessibilityRole="button"
        accessibilityLabel="कॉल बंद करके होम पर वापस जाएं"
      >
        <MaterialCommunityIcons name="arrow-left" size={23} color="#FFF" />
      </Pressable>
      <View style={styles.topBarTitleGroup}>
        <Text style={styles.topBarTitle} numberOfLines={1}>सखी से बोलकर सीखें</Text>
        <Text style={styles.topBarTopic} numberOfLines={1}>{topicDetail.title}</Text>
      </View>
      <View style={styles.timerPill} accessibilityLabel={`कॉल समय ${formatDuration(callDuration)}`}>
        <MaterialCommunityIcons name="clock-outline" size={15} color="#FFE8C4" />
        <Text style={styles.timerPillText}>{formatDuration(callDuration)}</Text>
      </View>
    </View>
  );

  const renderMainContent = () => (
    <View style={styles.mainContent}>
      <View style={[styles.stateCard, stateInfo.tone]}>
        <View style={styles.stateIconWrap}>
          {callStatus === CALL_STATUS.PROCESSING ? (
            <ActivityIndicator size="small" color="#FFF3D6" />
          ) : (
            <MaterialCommunityIcons name={stateInfo.icon} size={20} color="#FFF" />
          )}
        </View>
        <View style={styles.stateCopy}>
          <Text style={styles.stateTitle}>{stateInfo.title}</Text>
          <Text style={styles.stateDetail}>{stateInfo.detail}</Text>
        </View>
      </View>

      {!isTextComposerOpen && callStatus !== CALL_STATUS.ENDED && (
        <Pressable
          style={styles.openTextComposerButton}
          onPress={openTextComposer}
          accessibilityRole="button"
          accessibilityLabel="लिखकर जवाब देने का विकल्प खोलें"
        >
          <View style={styles.openTextComposerIcon}>
            <MaterialCommunityIcons name="keyboard-outline" size={19} color="#FFE5AD" />
          </View>
          <View style={styles.openTextComposerCopy}>
            <Text style={styles.openTextComposerTitle}>लिखकर जवाब देना है?</Text>
            <Text style={styles.openTextComposerSubtitle}>अपना सवाल टाइप करके भेजें</Text>
          </View>
          <MaterialCommunityIcons name="chevron-down" size={22} color="#FFE5AD" />
        </Pressable>
      )}

      <View style={[
        styles.avatarStage,
        isRecording && styles.avatarStageListening,
        callStatus === CALL_STATUS.SPEAKING && styles.avatarStageSpeaking,
      ]}>
        <AnimatedDidiAvatar
          isListening={isRecording}
          isSpeaking={callStatus === CALL_STATUS.SPEAKING}
          isThinking={callStatus === CALL_STATUS.PROCESSING}
          emotion={avatarEmotion}
          size={callAvatarSize}
          variant="circle"
        />
        <View style={styles.visualizerContainer}>
          <VoiceVisualizer
            isActive={isRecording || callStatus === CALL_STATUS.SPEAKING}
            intensity={voiceIntensity}
            color={isRecording ? COLORS.secondary[300] : COLORS.primary[300]}
          />
        </View>
      </View>

      {(latestUserTurn || latestAssistantTurn) && (
        <View style={styles.latestTurnCard}>
          <Text style={styles.latestTurnHeading}>अभी की बातचीत</Text>
          {latestUserTurn && (
            <View style={[styles.turnBubble, styles.userTurnBubble]}>
              <Text style={styles.turnLabel}>आपने कहा</Text>
              <Text style={styles.turnText}>{latestUserTurn.content}</Text>
            </View>
          )}
          {latestAssistantTurn && (
            <View style={[styles.turnBubble, styles.sakhiTurnBubble]}>
              <View style={styles.sakhiTurnHeader}>
                <MaterialCommunityIcons name="account-heart-outline" size={16} color={COLORS.primary[700]} />
                <Text style={styles.sakhiTurnLabel}>सखी ने कहा</Text>
              </View>
              <Text style={styles.turnText}>{latestAssistantTurn.content}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderControls = () => {
    const recordingDisabled = callStatus === CALL_STATUS.CONNECTING || isProcessing;

    return (
      <View style={styles.controlsDock}>
        <Pressable
          style={styles.dockSideButton}
          onPress={stopAssistantSpeech}
          accessibilityRole="button"
          accessibilityLabel="सखी की आवाज़ रोकें"
        >
          <MaterialCommunityIcons name="volume-off" size={22} color="#FFF6E9" />
          <Text style={styles.dockSideLabel}>आवाज़ रोकें</Text>
        </Pressable>

        {usesTextFallback ? (
          <Pressable
            style={styles.textModeDock}
            onPress={openTextComposer}
            accessibilityRole="button"
            accessibilityLabel="लिखकर जवाब देने का बॉक्स खोलें"
          >
            <MaterialCommunityIcons name="keyboard-outline" size={24} color="#FFE6B1" />
            <Text style={styles.textModeDockText}>लिखकर जवाब दें</Text>
          </Pressable>
        ) : (
          <View style={styles.mainActionContainer}>
            {!isRecording ? (
              <Pressable
                style={[styles.mainButton, recordingDisabled && styles.disabled]}
                onPress={handleStartRecording}
                disabled={recordingDisabled}
                accessibilityRole="button"
                accessibilityLabel="बोलकर जवाब दें"
              >
                <LinearGradient
                  colors={isProcessing ? ['#B0A99F', '#8A8078'] : ['#A7612E', '#64311C']}
                  style={styles.mainButtonGradient}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="large" color="#FFF" />
                  ) : (
                    <MaterialCommunityIcons name="microphone" size={42} color="#FFF" />
                  )}
                </LinearGradient>
              </Pressable>
            ) : (
              <Pressable
                style={styles.mainButton}
                onPress={handleStopRecording}
                accessibilityRole="button"
                accessibilityLabel="रिकॉर्डिंग रोकें और जवाब समझें"
              >
                <LinearGradient colors={['#E15C59', '#BF3838']} style={styles.mainButtonGradient}>
                  <MaterialCommunityIcons name="stop" size={42} color="#FFF" />
                </LinearGradient>
              </Pressable>
            )}
            <Text style={styles.mainButtonLabel}>
              {isRecording ? 'बोलना पूरा हुआ' : isProcessing ? 'समझ रही हूं' : 'बोलें'}
            </Text>
          </View>
        )}

        <Pressable
          style={[styles.dockSideButton, styles.endCallDockButton]}
          onPress={endCall}
          accessibilityRole="button"
          accessibilityLabel="कॉल बंद करें"
          accessibilityHint="कॉल समाप्त करके सारांश दिखाता है"
        >
          <MaterialCommunityIcons name="phone-hangup" size={22} color="#FFF" />
          <Text style={styles.dockSideLabel}>कॉल बंद</Text>
        </Pressable>
      </View>
    );
  };

  const renderEndCallModal = () => (
    <Modal transparent visible={showEndModal} animationType="fade" onRequestClose={returnHome}>
      <BlurView intensity={80} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <View style={styles.modalIconBadge}>
            <MaterialCommunityIcons name="check" size={40} color={COLORS.status.success} />
          </View>
          <Text style={styles.modalTitle}>बातचीत पूरी हुई!</Text>
          <Text style={styles.modalSubtitle}>आपने बहुत अच्छा किया।</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDuration(callDuration)}</Text>
              <Text style={styles.statLabel}>समय</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userReplyCount}</Text>
              <Text style={styles.statLabel}>आपके जवाब</Text>
            </View>
          </View>

          <Pressable
            style={styles.modalButton}
            onPress={returnHome}
            accessibilityRole="button"
            accessibilityLabel="कॉल बंद करके होम पर जाएं"
          >
            <Text style={styles.modalButtonText}>होम पर जाएं</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
          </Pressable>
        </View>
      </BlurView>
    </Modal>
  );

  const renderTextInput = () => {
    if (!isTextComposerOpen || callStatus === CALL_STATUS.ENDED) return null;

    return (
      <View style={styles.textFallbackContainer}>
        <View style={styles.textComposerHeader}>
          <View style={styles.textComposerTitleRow}>
            <MaterialCommunityIcons name="keyboard-outline" size={18} color="#FFE5AD" />
            <Text style={styles.textComposerTitle}>लिखकर जवाब दें</Text>
          </View>
          <Pressable
            style={styles.closeTextComposerButton}
            onPress={closeTextComposer}
            accessibilityRole="button"
            accessibilityLabel="लिखने का विकल्प हटाएं"
          >
            <MaterialCommunityIcons name="close" size={18} color="#FFF0D8" />
            <Text style={styles.closeTextComposerText}>हटाएं</Text>
          </Pressable>
        </View>
        <Text style={styles.textFallbackHint}>
          {usesTextFallback ? 'आवाज़ उपलब्ध नहीं है। अपना सवाल लिखकर भेजें।' : 'जब चाहें अपना सवाल लिखकर भेजें।'}
        </Text>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            value={textMessage}
            onChangeText={setTextMessage}
            placeholder="अपना सवाल लिखें"
            placeholderTextColor="rgba(255,255,255,0.62)"
            multiline
            maxLength={300}
            editable={!isProcessing}
            returnKeyType="send"
            blurOnSubmit
            onSubmitEditing={handleSendTextMessage}
            accessibilityLabel="अपना सवाल लिखें"
          />
          <Pressable
            style={[styles.sendButton, (!textMessage.trim() || isProcessing) && styles.disabled]}
            onPress={handleSendTextMessage}
            disabled={!textMessage.trim() || isProcessing}
            accessibilityRole="button"
            accessibilityLabel="लिखा हुआ सवाल भेजें"
          >
            <MaterialCommunityIcons name="send" size={20} color="#FFF" />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <GradientBackground colors={['#2B1B16', '#5A382A']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={[styles.container, styles.callSurface]}>
          {renderCallHeader()}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[styles.scrollContent, isCompactLayout && styles.scrollContentCompact]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderMainContent()}
          </ScrollView>
          {renderTextInput()}
          {renderControls()}
          {renderEndCallModal()}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  callSurface: {
    backgroundColor: '#3A241A',
  },

  // Header
  headerContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  headerTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  backButton: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  timerPill: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  timerPillText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
  },
  headerEyebrow: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    letterSpacing: 0.4,
  },
  headerTitle: {
    fontSize: 25,
    lineHeight: 34,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.neutral.white,
    marginTop: 2,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    marginTop: 2,
    maxWidth: 320,
  },
  callStatePill: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: 'rgba(128,75,43,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(240,202,154,0.18)',
  },
  callStateText: {
    color: '#E8FFFB',
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  fallbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(128,75,43,0.20)',
  },
  fallbackBadgeText: {
    color: '#E0F2F1',
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },

  // Main content
  mainContent: {
    width: '100%',
    alignItems: 'center',
  },
  avatarStage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS['2xl'],
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  avatarStageListening: {
    borderColor: 'rgba(218,164,94,0.68)',
    backgroundColor: 'rgba(128,75,43,0.12)',
  },
  avatarStageSpeaking: {
    borderColor: 'rgba(255,208,107,0.60)',
    backgroundColor: 'rgba(245,166,35,0.10)',
  },
  visualizerContainer: {
    height: 54,
    marginTop: 4,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  messageBubble: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.xl,
    marginTop: SPACING.md,
  },
  messageIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  messageText: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },

  // Controls
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS['2xl'],
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  controlRow: {
    width: 72,
    alignItems: 'center',
  },
  smallControlButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quietControlButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  endCallButton: {
    backgroundColor: COLORS.status.error,
  },
  secondaryControlLabel: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginTop: 7,
    textAlign: 'center',
  },

  mainActionContainer: {
    alignItems: 'center',
  },
  mainButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
  },
  mainButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  mainButtonLabel: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    marginTop: 8,
  },
  disabled: {
    opacity: 0.58,
  },

  // Completion sheet
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(3,18,20,0.66)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: '#FFFDF9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: SPACING.lg,
    paddingTop: 12,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
    elevation: 20,
  },
  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.neutral.gray[300],
    marginBottom: SPACING.md,
  },
  modalIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.status.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.neutral.gray[900],
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.neutral.gray[500],
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background.surface,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.neutral.gray[800],
  },
  statLabel: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.neutral.gray[500],
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.neutral.gray[200],
  },
  modalButton: {
    width: '100%',
    minHeight: 56,
    flexDirection: 'row',
    backgroundColor: COLORS.primary[600],
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },

  // Typed fallback
  textFallbackContainer: {
    width: '100%',
    padding: 12,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  textFallbackHint: {
    color: 'rgba(255,255,255,0.90)',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'left',
    marginBottom: 8,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 52,
    maxHeight: 88,
    backgroundColor: 'rgba(0,0,0,0.14)',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFF',
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },

  keyboardAvoidingView: {
    flex: 1,
  },
  topBar: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 6,
    paddingBottom: 8,
  },
  topBarIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  topBarTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  topBarTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  topBarTopic: {
    color: 'rgba(255,230,196,0.74)',
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: -1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  scrollContentCompact: {
    paddingVertical: 6,
  },
  stateCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
  },
  stateReady: {
    backgroundColor: 'rgba(128,75,43,0.14)',
    borderColor: 'rgba(240,202,154,0.22)',
  },
  stateFallback: {
    backgroundColor: 'rgba(245,166,35,0.14)',
    borderColor: 'rgba(255,224,153,0.24)',
  },
  stateListening: {
    backgroundColor: 'rgba(128,75,43,0.22)',
    borderColor: 'rgba(240,202,154,0.50)',
  },
  stateProcessing: {
    backgroundColor: 'rgba(245,166,35,0.17)',
    borderColor: 'rgba(255,224,153,0.36)',
  },
  stateSpeaking: {
    backgroundColor: 'rgba(245,166,35,0.16)',
    borderColor: 'rgba(255,208,107,0.36)',
  },
  stateConnecting: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.16)',
  },
  stateIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginRight: 12,
  },
  stateCopy: {
    flex: 1,
  },
  stateTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  stateDetail: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: 1,
  },
  latestTurnCard: {
    width: '100%',
    marginTop: SPACING.md,
  },
  latestTurnHeading: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginBottom: 8,
  },
  turnBubble: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: 8,
  },
  userTurnBubble: {
    alignSelf: 'flex-end',
    maxWidth: '90%',
    backgroundColor: 'rgba(128,75,43,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(240,202,154,0.20)',
  },
  sakhiTurnBubble: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  turnLabel: {
    color: '#F6D39E',
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginBottom: 3,
  },
  sakhiTurnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  sakhiTurnLabel: {
    color: '#FFE2A4',
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  turnText: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  controlsDock: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: BORDER_RADIUS['2xl'],
    backgroundColor: 'rgba(4,26,28,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  dockSideButton: {
    width: 72,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg,
  },
  endCallDockButton: {
    backgroundColor: 'rgba(239,68,68,0.16)',
  },
  dockSideLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
    marginTop: 5,
  },
  textModeDock: {
    flex: 1,
    minHeight: 64,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(245,166,35,0.14)',
  },
  textModeDockText: {
    color: '#FFF3D6',
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginTop: 2,
  },
  openTextComposerButton: {
    width: '100%',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 10,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(245,166,35,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,224,153,0.24)',
  },
  openTextComposerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245,166,35,0.18)',
    marginRight: 10,
  },
  openTextComposerCopy: {
    flex: 1,
  },
  openTextComposerTitle: {
    color: '#FFF8E7',
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
  },
  openTextComposerSubtitle: {
    color: 'rgba(255,248,231,0.76)',
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: 1,
  },
  textComposerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  textComposerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textComposerTitle: {
    color: '#FFF8E7',
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
  },
  closeTextComposerButton: {
    minHeight: 36,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  closeTextComposerText: {
    color: '#FFF0D8',
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
});