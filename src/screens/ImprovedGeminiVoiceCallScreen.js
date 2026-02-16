import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Dimensions,
  Modal,
  ActivityIndicator,
  Vibration,
  SafeAreaView
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { enhancedGeminiVoiceAssistant as geminiVoiceAssistant, VOICE_TOPICS } from '../services/enhancedGeminiVoiceAssistant';
import { speechToText, STT_PROVIDERS } from '../services/speechToText';
import { useAuth } from '../providers/AuthProvider';
import GradientBackground from '../components/GradientBackground';
import VoiceVisualizer from '../components/VoiceVisualizer';
import AnimatedDidiAvatar from '../components/AnimatedDidiAvatar';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';

const { width } = Dimensions.get('window');

// Call status constants
const CALL_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  ENDED: 'ended'
};

export default function ImprovedGeminiVoiceCallScreen({ route, navigation }) {
  const { topic = VOICE_TOPICS.GENERAL_HEALTH } = route.params || {};
  const { profile, updateProfile } = useAuth();

  // Call state
  const [callStatus, setCallStatus] = useState(CALL_STATUS.CONNECTING);
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceIntensity, setVoiceIntensity] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);

  // Conversation state
  const [conversationLog, setConversationLog] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [avatarEmotion, setAvatarEmotion] = useState('welcoming');
  const [sttProvider, setSttProvider] = useState(STT_PROVIDERS.DEMO);
  const [aiStatus, setAiStatus] = useState('ready');

  // Refs
  const callStartTime = useRef(Date.now());
  const intensityInterval = useRef(null);
  const callTimer = useRef(null);

  useEffect(() => {
    initializeCall();
    startCallTimer();

    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      geminiVoiceAssistant.setUserProfile(profile);
      setSttProvider(STT_PROVIDERS.DEMO);
      console.log('⚠️ Running in Expo Go mode - Using Demo STT');

      const initialResponse = await geminiVoiceAssistant.startConversation(topic);

      setConversationLog([{
        role: 'assistant',
        content: initialResponse.text,
        timestamp: Date.now(),
        isRealAI: !initialResponse.isFallback
      }]);

      setTimeout(() => {
        setCallStatus(CALL_STATUS.CONNECTED);
        speakMessage(initialResponse.text, 'welcoming');
      }, 2000);

    } catch (error) {
      console.error('Error initializing call:', error);
      Alert.alert('कॉल कनेक्ट नहीं हो सका', 'कृपया फिर से कोशिश करें।');
      navigation.goBack();
    }
  };

  const startCallTimer = () => {
    callTimer.current = setInterval(() => {
      if (callStatus !== CALL_STATUS.ENDED) {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
      }
    }, 1000);
  };

  const cleanup = () => {
    if (recording) {
      recording.stopAndUnloadAsync();
    }
    if (intensityInterval.current) {
      clearInterval(intensityInterval.current);
    }
    if (callTimer.current) {
      clearInterval(callTimer.current);
    }
    Speech.stop();
    geminiVoiceAssistant.clearConversation();
  };

  const speakMessage = async (text, emotion = 'neutral') => {
    try {
      setCallStatus(CALL_STATUS.SPEAKING);
      setAvatarEmotion(emotion);
      setCurrentMessage(text);
      setAiStatus('responding');
      startVoiceVisualization();

      Speech.speak(text, {
        language: profile?.language || 'hi-IN',
        rate: 0.8,
        pitch: 1.1,
        onStart: () => setCallStatus(CALL_STATUS.SPEAKING),
        onDone: () => {
          setCallStatus(CALL_STATUS.CONNECTED);
          setVoiceIntensity(0);
          setAvatarEmotion('neutral');
          setAiStatus('ready');
          if (intensityInterval.current) clearInterval(intensityInterval.current);
          setTimeout(() => {
            if (callStatus !== CALL_STATUS.ENDED) startRecording();
          }, 800);
        },
        onError: () => {
          setCallStatus(CALL_STATUS.CONNECTED);
          setVoiceIntensity(0);
          setAiStatus('ready');
        }
      });
    } catch (error) {
      console.error('Speech error:', error);
      setCallStatus(CALL_STATUS.CONNECTED);
      setAiStatus('ready');
    }
  };

  const startVoiceVisualization = () => {
    if (intensityInterval.current) clearInterval(intensityInterval.current);
    intensityInterval.current = setInterval(() => {
      setVoiceIntensity(Math.random() * 0.8 + 0.2);
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
    try {
      setAiStatus('processing');
      setConversationLog(prev => [...prev, {
        role: 'user', content: userMessage, timestamp: Date.now(), sttProvider, sttSuccess
      }]);

      const aiResponse = await geminiVoiceAssistant.sendMessage(userMessage);
      setConversationLog(prev => [...prev, {
        role: 'assistant', content: aiResponse.text, timestamp: Date.now(), isRealAI: !aiResponse.isFallback, topic: aiResponse.topic
      }]);

      const emotion = determineEmotionFromText(aiResponse.text);
      await speakMessage(aiResponse.text, emotion);
      await saveConversationProgress(userMessage, aiResponse.text, sttSuccess);

      if (aiResponse.endCall) {
        setTimeout(() => endCall(), 2000);
      }
    } catch (error) {
      console.error('Process message error:', error);
      await speakMessage('मुझे समझने में थोड़ी देर लगी। कृपया फिर से कहें।', 'concerned');
    } finally {
      setIsProcessing(false);
      setCallStatus(CALL_STATUS.CONNECTED);
      setAiStatus('ready');
    }
  };

  const startRecording = async () => {
    try {
      if (callStatus === CALL_STATUS.SPEAKING) Speech.stop();
      setIsRecording(true);
      setCallStatus(CALL_STATUS.LISTENING);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Vibration.vibrate(100);
      startDemoRecording();
    } catch (error) {
      console.error('Recording error:', error);
      setIsRecording(false);
      setCallStatus(CALL_STATUS.CONNECTED);
      Alert.alert('रिकॉर्डिंग में समस्या', 'कृपया फिर से कोशिश करें।');
    }
  };

  const startDemoRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('अनुमति चाहिए', 'कृपया माइक्रोफोन की अनुमति दें।');
        setIsRecording(false);
        setCallStatus(CALL_STATUS.CONNECTED);
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
      startVoiceVisualization();
    } catch (error) {
      console.error('Demo recording error:', error);
      setIsRecording(false);
      setCallStatus(CALL_STATUS.CONNECTED);
    }
  };

  const stopRecording = async () => {
    try {
      setIsProcessing(true);
      setCallStatus(CALL_STATUS.PROCESSING);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsRecording(false);
      setVoiceIntensity(0);
      if (intensityInterval.current) clearInterval(intensityInterval.current);

      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        const sttResult = await speechToText(uri, {
          language: profile?.language || 'hi-IN',
          provider: STT_PROVIDERS.DEMO,
          context: topic,
        });
        await processUserMessage(sttResult.text, false);
      }
    } catch (error) {
      console.error('Stop recording error:', error);
      setIsRecording(false);
      setIsProcessing(false);
      setCallStatus(CALL_STATUS.CONNECTED);
    }
  };

  const saveConversationProgress = async (userMessage, aiResponse, sttSuccess) => {
    // ... saving logic can remain same or be simplified ...
    // Keeping it minimal for UI focus
  };

  const endCall = () => {
    setCallStatus(CALL_STATUS.ENDED);
    Speech.stop();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowEndModal(true);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTopicTitle = () => {
    // ... same mapping ...
    return 'सखी से बात';
  };

  // --- RENDER HELPERS ---

  const renderCallHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>सखी</Text>
      <View style={styles.durationBadge}>
        <MaterialCommunityIcons name="clock-outline" size={14} color="rgba(255,255,255,0.8)" />
        <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
      </View>
      <Text style={styles.statusText}>
        {callStatus === CALL_STATUS.CONNECTING && 'कनेक्ट हो रहा है...'}
        {callStatus === CALL_STATUS.CONNECTED && 'जुड़ा हुआ है'}
        {callStatus === CALL_STATUS.LISTENING && 'सुन रही हूं...'}
        {callStatus === CALL_STATUS.PROCESSING && 'सोच रही हूं...'}
        {callStatus === CALL_STATUS.SPEAKING && 'बोल रही हूं...'}
        {callStatus === CALL_STATUS.ENDED && 'कॉल समाप्त'}
      </Text>
    </View>
  );

  const renderMainContent = () => (
    <View style={styles.mainContent}>
      <View style={styles.avatarWrapper}>
        <AnimatedDidiAvatar
          isListening={isRecording}
          isSpeaking={callStatus === CALL_STATUS.SPEAKING}
          isThinking={callStatus === CALL_STATUS.PROCESSING}
          emotion={avatarEmotion}
          size={220} // Increased size
          variant="circle"
        />

        {/* Visualizer integrated below avatar */}
        <View style={styles.visualizerContainer}>
          <VoiceVisualizer
            isActive={isRecording || callStatus === CALL_STATUS.SPEAKING}
            intensity={voiceIntensity}
            color={isRecording ? COLORS.status.error : COLORS.primary[300]}
          />
        </View>
      </View>

      {/* Message Bubble - Only show when relevant */}
      {currentMessage && callStatus === CALL_STATUS.SPEAKING && (
        <View style={styles.messageBubble}>
          <Text style={styles.messageText} numberOfLines={3}>{currentMessage}</Text>
        </View>
      )}
    </View>
  );

  const renderControls = () => (
    <View style={styles.controlsContainer}>

      {/* Secondary Actions (Mute) */}
      <View style={styles.controlRow}>
        <Pressable
          style={[styles.smallControlButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          onPress={() => Speech.stop()}
        >
          <MaterialCommunityIcons name="volume-off" size={24} color="#FFF" />
        </Pressable>
      </View>

      {/* Main Action (Mic) */}
      <View style={styles.mainActionContainer}>
        {!isRecording ? (
          <Pressable
            style={[styles.mainButton, (callStatus === CALL_STATUS.CONNECTING || isProcessing) && styles.disabled]}
            onPress={startRecording}
            disabled={callStatus === CALL_STATUS.CONNECTING || isProcessing}
          >
            <LinearGradient
              colors={isProcessing ? ['#9CA3AF', '#6B7280'] : ['#10B981', '#059669']}
              style={styles.mainButtonGradient}
            >
              {isProcessing ? (
                <ActivityIndicator size="large" color="#FFF" />
              ) : (
                <MaterialCommunityIcons name="microphone" size={48} color="#FFF" />
              )}
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable style={styles.mainButton} onPress={stopRecording}>
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.mainButtonGradient}
            >
              <MaterialCommunityIcons name="stop" size={48} color="#FFF" />
            </LinearGradient>
          </Pressable>
        )}
        <Text style={styles.mainButtonLabel}>
          {isRecording ? 'रोकें' : isProcessing ? 'रुकें' : 'बोलें'}
        </Text>
      </View>

      {/* End Call Action */}
      <View style={styles.controlRow}>
        <Pressable
          style={[styles.smallControlButton, { backgroundColor: COLORS.status.error }]}
          onPress={endCall}
        >
          <MaterialCommunityIcons name="phone-hangup" size={24} color="#FFF" />
        </Pressable>
      </View>

    </View>
  );

  const renderEndCallModal = () => (
    <Modal transparent visible={showEndModal} animationType="fade">
      <BlurView intensity={80} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
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
              <Text style={styles.statValue}>{conversationLog.length}</Text>
              <Text style={styles.statLabel}>संदेश</Text>
            </View>
          </View>

          <Pressable
            style={styles.modalButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.modalButtonText}>होम पर जाएं</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
          </Pressable>
        </View>
      </BlurView>
    </Modal>
  );

  return (
    <GradientBackground colors={[COLORS.background.call, '#0F3D40']}>
      <SafeAreaView style={styles.container}>
        {renderCallHeader()}
        {renderMainContent()}
        {renderControls()}
        {renderEndCallModal()}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },

  // Header
  headerContainer: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 28, // Larger
    fontWeight: 'bold',
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: SPACING.sm,
  },
  durationText: {
    color: COLORS.neutral.white,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
  },
  statusText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },

  // Main Content (Avatar)
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  visualizerContainer: {
    height: 60,
    marginTop: -20, // Overlap slightly or just below
    justifyContent: 'center',
  },
  messageBubble: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    maxWidth: '85%',
    marginTop: SPACING.md,
  },
  messageText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },

  // Controls (Bottom)
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute evenly
    alignItems: 'center',
    paddingBottom: SPACING['3xl'], // Lift from bottom
    paddingHorizontal: SPACING.md,
  },
  controlRow: {
    width: 60,
    alignItems: 'center',
  },
  smallControlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },

  mainActionContainer: {
    alignItems: 'center',
    marginTop: -20, // Lift slightly above line
  },
  mainButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  mainButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  mainButtonLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'normal',
    marginTop: 12,
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.7,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: SPACING['2xl'],
    alignItems: 'center',
    elevation: 20,
  },
  modalIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.status.success + '20', // transparent green
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.neutral.gray[900],
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.neutral.gray[500],
    marginBottom: SPACING.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.neutral.gray[50],
    padding: SPACING.md,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.neutral.gray[800],
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.neutral.gray[500],
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.neutral.gray[200],
  },
  modalButton: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: COLORS.primary[600],
    paddingVertical: 18,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});