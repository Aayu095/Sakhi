import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Modal, Alert, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { v4 as uuidv4 } from 'uuid';
import { LinearGradient } from 'expo-linear-gradient';

import { ENHANCED_CONTENT_PACKS } from '../services/offlineContent';
import { sendToLLM } from '../services/enhancedGeminiVoiceAssistant';
import { saveTurnToFirestore, updateStreakAndBadges } from '../services/firebase';
import { useAuth } from '../providers/AuthProvider';
import GradientBackground from '../components/GradientBackground';
import VoiceVisualizer from '../components/VoiceVisualizer';
import AnimatedDidiAvatar from '../components/AnimatedDidiAvatar';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, MOTIVATIONAL_MESSAGES } from '../config/theme';

const { width, height } = Dimensions.get('window');

// Enhanced conversation context for better AI responses
function getEnhancedPromptForPack(packId, userProfile) {
  const pack = ENHANCED_CONTENT_PACKS.find(p => p.id === packId);
  if (!pack) {
    return {
      opening: `नमस्ते ${userProfile?.name || 'बहन'}! मैं दीदी हूं। आज हम कुछ नया सीखेंगे। तैयार हो?`,
      system: 'You are Didi, a helpful mentor speaking in simple Hindi. Keep responses short, encouraging, and culturally appropriate for rural Indian women.'
    };
  }
  
  const personalizedOpening = pack.opening
    .replace('बहन', userProfile?.name || 'बहन')
    .replace('behen', userProfile?.name || 'बहन');
  
  return {
    opening: personalizedOpening,
    system: `${pack.system} The user's name is ${userProfile?.name || 'बहन'}. Remember their progress and be encouraging. Use simple Hindi mixed with basic English words they might know.`
  };
}

export default function EnhancedConversationalScreen({ navigation, route }) {
  const { packId, shouldDownload } = route.params || {};
  const { profile } = useAuth();
  const [sessionId] = useState(uuidv4());
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [conversationLog, setConversationLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceIntensity, setVoiceIntensity] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [avatarEmotion, setAvatarEmotion] = useState('neutral');
  const [conversationContext, setConversationContext] = useState([]);
  const [encouragementCount, setEncouragementCount] = useState(0);
  const [userEngagementLevel, setUserEngagementLevel] = useState('medium');
  
  const conversationRef = useRef([]);
  const callStartTime = useRef(Date.now());
  const lastInteractionTime = useRef(Date.now());

  // Enhanced pack data with personalization
  const selectedPack = useMemo(() => 
    ENHANCED_CONTENT_PACKS.find(p => p.id === packId) || ENHANCED_CONTENT_PACKS[0], 
    [packId]
  );

  useEffect(() => {
    startEnhancedCall();
    
    // Enhanced call duration timer with engagement tracking
    const timer = setInterval(() => {
      const duration = Math.floor((Date.now() - callStartTime.current) / 1000);
      setCallDuration(duration);
      
      // Check for user engagement
      const timeSinceLastInteraction = Date.now() - lastInteractionTime.current;
      if (timeSinceLastInteraction > 30000) { // 30 seconds of inactivity
        provideEncouragement();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [packId, profile]);

  const startEnhancedCall = async () => {
    try {
      const intro = getEnhancedPromptForPack(packId, profile);
      conversationRef.current.push({ role: 'system', content: intro.system });
      
      // Enhanced personalized opening
      const hour = new Date().getHours();
      let greeting = 'नमस्ते';
      if (hour < 12) greeting = 'सुप्रभात';
      else if (hour < 17) greeting = 'नमस्ते';
      else greeting = 'शुभ संध्या';

      const personalizedOpening = `${greeting} ${profile?.name || 'बहन'}! मैं दीदी हूं। ${intro.opening}`;
      
      await enhancedSpeak(personalizedOpening, 'welcoming');
      setConversationLog([{ 
        role: 'assistant', 
        content: personalizedOpening, 
        timestamp: Date.now(),
        emotion: 'welcoming'
      }]);
      
      // Set initial context
      setConversationContext([
        `User's name: ${profile?.name || 'Unknown'}`,
        `Pack topic: ${selectedPack.title}`,
        `User's experience level: ${profile?.experienceLevel || 'beginner'}`,
        `Preferred language: ${profile?.language || 'Hindi'}`
      ]);
      
    } catch (error) {
      console.error('Error starting enhanced call:', error);
      Alert.alert('त्रुटि', 'कॉल शुरू करने में समस्या हुई। कृपया फिर से कोशिश करें।');
    }
  };

  const enhancedSpeak = async (text, emotion = 'neutral') => {
    try {
      await Speech.stop();
      setIsListening(true);
      setAvatarEmotion(emotion);
      
      // Enhanced speech with emotion-based parameters
      const speechConfig = {
        language: profile?.language || 'hi-IN',
        pitch: emotion === 'encouraging' ? 1.2 : emotion === 'concerned' ? 0.9 : 1.1,
        rate: emotion === 'excited' ? 0.9 : 0.8,
        voice: undefined,
        onStart: () => {
          setIsListening(true);
          startVoiceVisualization();
        },
        onDone: () => {
          setIsListening(false);
          setVoiceIntensity(0);
          setTimeout(() => setAvatarEmotion('neutral'), 2000);
        },
        onStopped: () => {
          setIsListening(false);
          setVoiceIntensity(0);
        },
      };

      Speech.speak(text, speechConfig);
    } catch (error) {
      console.error('Enhanced speech error:', error);
      setIsListening(false);
    }
  };

  const startVoiceVisualization = () => {
    const intensityInterval = setInterval(() => {
      if (isListening) {
        setVoiceIntensity(Math.random() * 0.8 + 0.2);
      } else {
        clearInterval(intensityInterval);
        setVoiceIntensity(0);
      }
    }, 150);
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastInteractionTime.current = Date.now();
      
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'माइक्रोफोन की अनुमति चाहिए',
          'दीदी से बात करने के लिए माइक्रोफोन की अनुमति दें।',
          [{ text: 'ठीक है', onPress: () => setIsRecording(false) }]
        );
        return;
      }

      await Audio.setAudioModeAsync({ 
        allowsRecordingIOS: true, 
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      await rec.startAsync();
      setRecording(rec);
    } catch (e) {
      console.error('startRecording error', e);
      setIsRecording(false);
      Alert.alert('त्रुटि', 'रिकॉर्डिंग शुरू करने में समस्या हुई।');
    }
  };

  const stopRecording = async () => {
    try {
      setBusy(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        setIsRecording(false);
        await handleEnhancedUserAudio(uri);
      }
    } catch (e) {
      console.error('stopRecording error', e);
      setIsRecording(false);
      setBusy(false);
      Alert.alert('त्रुटि', 'रिकॉर्डिंग रोकने में समस्या हुई।');
    }
  };

  const handleEnhancedUserAudio = async (uri) => {
    try {
      // Enhanced STT simulation with context-aware responses
      const contextualResponses = getContextualResponses();
      const fakeTranscript = contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
      
      const userMessage = { 
        role: 'user', 
        content: fakeTranscript, 
        timestamp: Date.now(),
        audioUri: uri 
      };
      
      setConversationLog(prev => [...prev, userMessage]);
      conversationRef.current.push({ role: 'user', content: fakeTranscript });

      // Enhanced AI response with context and emotion
      const enhancedContext = [
        ...conversationRef.current,
        { role: 'system', content: `Context: ${conversationContext.join(', ')}. Call duration: ${callDuration}s. User engagement: ${userEngagementLevel}` }
      ];

      const llmResponse = await sendToLLM(enhancedContext, packId);
      
      // Determine emotion based on response content
      const responseEmotion = determineResponseEmotion(llmResponse.text);
      
      const assistantMessage = {
        role: 'assistant',
        content: llmResponse.text,
        timestamp: Date.now(),
        emotion: responseEmotion
      };
      
      setConversationLog(prev => [...prev, assistantMessage]);
      conversationRef.current.push({ role: 'assistant', content: llmResponse.text });

      await enhancedSpeak(llmResponse.text, responseEmotion);

      // Enhanced progress tracking
      await saveTurnToFirestore({ 
        sessionId, 
        packId, 
        user: fakeTranscript, 
        assistant: llmResponse.text,
        timestamp: Date.now(),
        callDuration,
        packTitle: selectedPack.title,
        emotion: responseEmotion,
        userEngagement: userEngagementLevel
      });

      // Update user progress with enhanced metrics
      if (profile?.uid) {
        try { 
          await updateStreakAndBadges(profile.uid);
          updateEngagementLevel(fakeTranscript);
          
          // Show motivational message occasionally
          if (Math.random() < 0.25 && encouragementCount < 3) {
            setTimeout(() => {
              showEncouragementMessage();
            }, 3000);
          }
        } catch (error) {
          console.warn('Error updating enhanced progress:', error);
        }
      }

      if (llmResponse?.endCall) {
        setTimeout(() => setShowEndModal(true), 1500);
      }
    } catch (e) {
      console.error('handleEnhancedUserAudio', e);
      Alert.alert('त्रुटि', 'आपकी आवाज़ समझने में समस्या हुई। कृपया फिर से कोशिश करें।');
    } finally {
      setBusy(false);
    }
  };

  const getContextualResponses = () => {
    const baseResponses = [
      'हां दीदी, मुझे समझ आया',
      'जी हां, बताइए',
      'ठीक है दीदी',
      'और क्या करना चाहिए?',
      'यह बहुत अच्छी जानकारी है',
      'मैं यह करूंगी',
      'धन्यवाद दीदी',
    ];

    // Add pack-specific responses
    if (selectedPack.id === 'health_hygiene') {
      baseResponses.push(
        'स्वास्थ्य के बारे में और बताइए',
        'यह जानकारी बहुत जरूरी है',
        'मैं इसका ध्यान रखूंगी'
      );
    } else if (selectedPack.id === 'digital_literacy') {
      baseResponses.push(
        'फोन के बारे में और सिखाइए',
        'डिजि���ल चीजें समझना मुश्किल है',
        'धीरे-धीरे सीख जाऊंगी'
      );
    }

    return baseResponses;
  };

  const determineResponseEmotion = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('बधाई') || lowerText.includes('शाबाश') || lowerText.includes('बहुत अच्छा')) {
      return 'proud';
    } else if (lowerText.includes('चिंता') || lowerText.includes('समस्या') || lowerText.includes('परेशान')) {
      return 'concerned';
    } else if (lowerText.includes('खुश') || lowerText.includes('प्रसन्न') || lowerText.includes('मज़ा')) {
      return 'happy';
    } else if (lowerText.includes('प्रोत्साह') || lowerText.includes('हिम्मत') || lowerText.includes('कोशिश')) {
      return 'encouraging';
    } else if (lowerText.includes('सोच') || lowerText.includes('विचार')) {
      return 'thinking';
    }
    return 'neutral';
  };

  const updateEngagementLevel = (userResponse) => {
    const responseLength = userResponse.length;
    const timeSinceStart = Date.now() - callStartTime.current;
    
    if (responseLength > 20 && timeSinceStart > 60000) {
      setUserEngagementLevel('high');
    } else if (responseLength > 10 || timeSinceStart > 30000) {
      setUserEngagementLevel('medium');
    } else {
      setUserEngagementLevel('low');
    }
  };

  const provideEncouragement = () => {
    if (encouragementCount < 2 && !isListening && !busy) {
      const encouragements = [
        'कोई बात नहीं, अपना समय लीजिए। मैं यहाँ हूँ।',
        'क्या कोई सवाल है? मैं आपकी मदद करूंगी।',
        'आप बहुत अच्छा कर रही हैं। आगे बढ़ते रहिए।'
      ];
      
      const encouragement = encouragements[encouragementCount];
      enhancedSpeak(encouragement, 'encouraging');
      setEncouragementCount(prev => prev + 1);
      lastInteractionTime.current = Date.now();
    }
  };

  const showEncouragementMessage = () => {
    const message = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
    Alert.alert('🌟 प्रेरणा', message, [{ text: 'धन्यवाद!' }]);
    setEncouragementCount(prev => prev + 1);
  };

  const endCall = () => {
    Speech.stop();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const duration = Math.floor(callDuration / 60);
    const summary = `आपने ${duration} मिनट तक दीदी से बात की। ${conversationLog.length} संदेश भेजे। बहुत बढ़िया!`;
    
    Alert.alert(
      'कॉल समाप्त',
      summary,
      [
        { text: 'प्रगति देखें', onPress: () => navigation.replace('Progress') },
        { text: 'होम जाएं', onPress: () => navigation.replace('Home') }
      ]
    );
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderEnhancedHeader = () => (
    <View style={styles.header}>
      <View style={styles.callInfo}>
        <Text style={styles.packTitle}>{selectedPack.title}</Text>
        <Text style={styles.callStatus}>
          {isListening ? '🎙️ दीदी बोल रही हैं...' : isRecording ? '🎤 आ�� बोल रहे हैं...' : '💬 बातचीत चालू'}
        </Text>
        <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
        <Text style={styles.engagementLevel}>
          सहभागिता: {userEngagementLevel === 'high' ? '🔥 उत्कृष्ट' : userEngagementLevel === 'medium' ? '👍 अच्छी' : '💪 शुरुआत'}
        </Text>
      </View>
    </View>
  );

  const renderEnhancedAvatar = () => (
    <View style={styles.avatarSection}>
      <View style={styles.avatarContainer}>
        <AnimatedDidiAvatar
          isListening={isRecording}
          isSpeaking={isListening}
          emotion={avatarEmotion}
          size={160}
        />
        {(isListening || isRecording) && (
          <View style={styles.voiceVisualizerContainer}>
            <VoiceVisualizer 
              isActive={isListening || isRecording} 
              intensity={voiceIntensity}
              color={isRecording ? COLORS.status.error : COLORS.primary[400]}
            />
          </View>
        )}
      </View>
      <Text style={styles.didiName}>दीदी</Text>
      <Text style={styles.didiStatus}>
        {isListening ? 'बोल रही हैं...' : isRecording ? 'सुन र��ी हैं...' : 'आपका इंतज़ार कर रही हैं'}
      </Text>
    </View>
  );

  const renderEnhancedControls = () => (
    <View style={styles.controls}>
      <View style={styles.mainControls}>
        {!isRecording ? (
          <Pressable 
            style={[styles.micButton, busy && styles.disabledBtn]} 
            onPress={startRecording} 
            disabled={busy || isListening}
          >
            <LinearGradient
              colors={busy ? ['#ccc', '#999'] : ['#FF6B6B', '#FF8E53']}
              style={styles.micButtonGradient}
            >
              <Text style={styles.micIcon}>🎤</Text>
              <Text style={styles.micText}>
                {busy ? 'प्रतीक्षा...' : isListening ? 'सुनिए...' : 'बोलें'}
              </Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable style={styles.stopButton} onPress={stopRecording}>
            <LinearGradient
              colors={['#FF4757', '#FF3838']}
              style={styles.stopButtonGradient}
            >
              <Text style={styles.stopIcon}>⏹️</Text>
              <Text style={styles.stopText}>रोकें</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>
      
      <View style={styles.secondaryControls}>
        <Pressable 
          style={styles.helpButton}
          onPress={() => enhancedSpeak('मैं आपकी मदद के लिए यहाँ हूँ। कोई भी सवाल पूछ सकती हैं।', 'encouraging')}
        >
          <Text style={styles.helpIcon}>❓</Text>
          <Text style={styles.helpText}>मदद</Text>
        </Pressable>
        
        <Pressable style={styles.endButton} onPress={endCall}>
          <Text style={styles.endIcon}>📞</Text>
          <Text style={styles.endText}>समाप्त</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderEndModal = () => (
    <Modal transparent visible={showEndModal} animationType="fade">
      <BlurView intensity={80} style={styles.modalWrap}>
        <View style={styles.modalCard}>
          <Text style={styles.modalIcon}>🎉</Text>
          <Text style={styles.modalTitle}>
            बहुत बढ़िया {profile?.name || 'बहन'}!
          </Text>
          <Text style={styles.modalSubtitle}>
            आपने आज बहुत कुछ सीखा। दीदी को आप पर गर्व है! 
          </Text>
          
          <View style={styles.modalStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatDuration(callDuration)}</Text>
              <Text style={styles.statLabel}>बा���चीत का समय</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{conversationLog.length}</Text>
              <Text style={styles.statLabel}>संदेश</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userEngagementLevel === 'high' ? '⭐⭐⭐' : userEngagementLevel === 'medium' ? '⭐⭐' : '⭐'}
              </Text>
              <Text style={styles.statLabel}>सहभागिता</Text>
            </View>
          </View>
          
          <View style={styles.modalButtons}>
            <Pressable onPress={() => navigation.replace('Progress')} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>प्रगति देखें</Text>
            </Pressable>
            <Pressable onPress={endCall} style={[styles.modalBtn, styles.primaryModalBtn]}>
              <Text style={[styles.modalBtnText, styles.primaryModalBtnText]}>होम जाएं</Text>
            </Pressable>
          </View>
        </View>
      </BlurView>
    </Modal>
  );

  return (
    <GradientBackground colors={selectedPack.color || [COLORS.background.primary, COLORS.background.surface]}>
      <View style={styles.container}>
        {renderEnhancedHeader()}
        {renderEnhancedAvatar()}
        {renderEnhancedControls()}
        {renderEndModal()}

        {/* Loading Overlay */}
        {busy && (
          <View style={styles.busyOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary[400]} />
            <Text style={styles.busyText}>दीदी सोच रही हैं...</Text>
          </View>
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  callInfo: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    minWidth: width * 0.8,
  },
  packTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  callStatus: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.xs,
  },
  callDuration: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.primary[300],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.xs,
  },
  engagementLevel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  avatarSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  voiceVisualizerContainer: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
  },
  didiName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.sm,
  },
  didiStatus: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  controls: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  mainControls: {
    marginBottom: SPACING.lg,
  },
  micButton: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  micButtonGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    minWidth: 200,
  },
  micIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  micText: {
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  stopButton: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    elevation: 8,
  },
  stopButtonGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    minWidth: 200,
  },
  stopIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  stopText: {
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  secondaryControls: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  helpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  helpIcon: {
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  helpText: {
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  endButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  endIcon: {
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  endText: {
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  modalWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING['2xl'],
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
  },
  modalIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[600],
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral.gray[200],
    alignItems: 'center',
  },
  primaryModalBtn: {
    backgroundColor: COLORS.primary[500],
  },
  modalBtnText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
  },
  primaryModalBtnText: {
    color: COLORS.neutral.white,
  },
  busyOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  busyText: {
    color: COLORS.neutral.white,
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
  },
});