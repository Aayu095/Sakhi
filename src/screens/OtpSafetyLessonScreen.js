import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../providers/AuthProvider';
import { cancelRecording, startRecording, stopRecordingAndTranscribe } from '../services/speechToText';
import GradientBackground from '../components/GradientBackground';
import AnimatedDidiAvatar from '../components/AnimatedDidiAvatar';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../config/theme';

const LESSONS = {
  otp: {
    id: 'otp_safety_v1',
    label: 'OTP सुरक्षा',
    completionTitle: 'आपने OTP सुरक्षा सीख ली',
    completionText: 'अब आपको याद है: OTP और UPI PIN कभी साझा नहीं करने हैं।',
    colors: { end: '#FFF0DD', accent: '#6C3483', soft: '#F3E8FF', border: '#DCC7F4' },
    steps: [
      {
        id: 'what-is-otp', kind: 'info', icon: 'lock-outline', title: 'OTP आपका गुप्त कोड है',
        narration: 'OTP एक बार इस्तेमाल होने वाला गुप्त कोड है। बैंक, UPI और दूसरी सेवाओं में यह आपकी पहचान सुरक्षित रखने के लिए होता है। इसे पासवर्ड की तरह सिर्फ़ अपने पास रखें।',
        helper: 'याद रखें: OTP और UPI PIN किसी को भी नहीं बताने हैं।',
      },
      {
        id: 'caller-asks-otp', kind: 'question', icon: 'phone-alert-outline', title: 'अब आपका जवाब',
        narration: 'मान लीजिए, कोई फोन करके खुद को बैंक का कर्मचारी कहता है और आपसे OTP मांगता है। क्या आप उसे OTP बताएंगी?',
        helper: 'पहले बोलकर जवाब दें, या नीचे सही जवाब दबाएं।', expected: 'never_share',
        choices: [
          { id: 'never_share', label: 'नहीं, कभी नहीं बताऊंगी', icon: 'shield-check-outline' },
          { id: 'share', label: 'हाँ, क्योंकि वह बैंक से है', icon: 'account-question-outline' },
        ],
      },
      {
        id: 'safe-next-step', kind: 'question', icon: 'shield-lock-outline', title: 'सुरक्षित कदम चुनें',
        narration: 'अगर किसी अनजान कॉल या मैसेज में OTP, UPI PIN या लिंक मांगा जाए, तो सबसे सुरक्षित कदम क्या है?',
        helper: 'सखी को अपना जवाब बोलकर भी बता सकती हैं।', expected: 'official_channel',
        choices: [
          { id: 'official_channel', label: 'कॉल बंद कर बैंक के official नंबर पर बात करूंगी', icon: 'phone-check-outline' },
          { id: 'open_link', label: 'लिंक खोलकर जानकारी भर दूंगी', icon: 'link-variant' },
        ],
      },
      {
        id: 'recap', kind: 'complete', icon: 'shield-star-outline', title: 'आपने जरूरी नियम सीख लिया',
        narration: 'बहुत बढ़िया। OTP और UPI PIN कभी शेयर नहीं करना है। शक हो तो कॉल या लिंक से नहीं, बैंक के official नंबर या ऐप से मदद लेनी है।',
        helper: 'इस पाठ को पूरा करने के बाद आपकी प्रगति में यह सुरक्षित हो जाएगा।',
      },
    ],
  },
  fakeLink: {
    id: 'fake_link_safety_v1',
    label: 'नकली लिंक सुरक्षा',
    completionTitle: 'आपने नकली लिंक पहचानना सीख लिया',
    completionText: 'किसी डराने वाले या लालच देने वाले लिंक को खोलने से पहले रुकना और जांचना सबसे सुरक्षित कदम है।',
    colors: { end: '#E2F8F3', accent: '#0F766E', soft: '#DDF7F1', border: '#9EDFD3' },
    steps: [
      {
        id: 'spot-the-trick', kind: 'info', icon: 'link-variant-off', title: 'हर लिंक भरोसेमंद नहीं होता',
        narration: 'कभी-कभी WhatsApp या SMS में लिखा आता है: आपका KYC बंद हो जाएगा, अभी लिंक खोलें। डराने या जल्दी करने वाला मैसेज अक्सर धोखा हो सकता है।',
        helper: 'पहले रुकें, फिर सोचें। जल्दी करने को कहने वाला मैसेज suspicious हो सकता है।',
      },
      {
        id: 'first-response', kind: 'question', icon: 'message-alert-outline', title: 'पहला सुरक्षित कदम',
        narration: 'आपको एक SMS आता है: अभी लिंक खोलें नहीं तो आपका बैंक अकाउंट बंद हो जाएगा। क्या आप उस लिंक पर तुरंत क्लिक करेंगी?',
        helper: 'अपना जवाब बोलें या नीचे सही जवाब चुनें।', expected: 'dont_open',
        choices: [
          { id: 'dont_open', label: 'नहीं, पहले उस लिंक को नहीं खोलूंगी', icon: 'shield-check-outline' },
          { id: 'open', label: 'हाँ, अकाउंट बचाने के लिए तुरंत खोलूंगी', icon: 'cursor-default-click-outline' },
        ],
      },
      {
        id: 'verify-safely', kind: 'question', icon: 'shield-search-outline', title: 'पहले जांचें, फिर करें',
        narration: 'अगर मैसेज सच जैसा भी लगे, तो जानकारी जांचने का सबसे सुरक्षित तरीका क्या है?',
        helper: 'सिर्फ official app या official customer-care नंबर से जांचें।', expected: 'verify_official',
        choices: [
          { id: 'verify_official', label: 'बैंक के official app या नंबर से जांच करूंगी', icon: 'cellphone-check' },
          { id: 'forward_link', label: 'लिंक परिवार के WhatsApp group में भेज दूंगी', icon: 'share-variant-outline' },
        ],
      },
      {
        id: 'recap', kind: 'complete', icon: 'shield-star-outline', title: 'अब आप लिंक को लेकर सतर्क हैं',
        narration: 'शाबाश। डराने वाला SMS हो, इनाम देने वाला link हो या अनजान WhatsApp message, तुरंत क्लिक नहीं करना है। पहले official app या नंबर से जांचना है।',
        helper: 'इस पाठ को पूरा करने के बाद आपकी प्रगति में यह सुरक्षित हो जाएगा।',
      },
    ],
  },
};

function classifySpokenAnswer(expected, speech) {
  const value = String(speech || '').toLowerCase().replace(/[.,!?।]/g, ' ').trim();

  if (expected === 'never_share') {
    if (/(नहीं|नही|कभी नहीं|मत बत|न बताऊ|नहीं बताऊ|नहीं दूं|नहीं दूंगी|nahi|nahin|never|mat|not share)/.test(value)) return 'never_share';
    if (/(हाँ|हां|हा |बता दूं|बताऊंगी|share|शेयर|दे दूं|दे दूंगी)/.test(value)) return 'share';
  }
  if (expected === 'official_channel' || expected === 'verify_official') {
    if (/(official|ऑफिशियल|bank|बैंक|ऐप|app|customer care|कस्टमर|helpline|हेल्पलाइन|नंबर पर|नम्बर पर|कॉल बंद|जांच)/.test(value)) return expected;
    if (/(लिंक|link|खोल|भर दूं|जानकारी दूं|otp|ओटीपी|forward|फॉरवर्ड|भेज दूं)/.test(value)) return expected === 'official_channel' ? 'open_link' : 'forward_link';
  }
  if (expected === 'dont_open') {
    if (/(नहीं|नही|मत|न खोल|क्लिक नहीं|नहीं क्लिक|रुक|nahi|nahin|dont|don't|not open)/.test(value)) return 'dont_open';
    if (/(खोल|क्लिक|click|open|हाँ|हां)/.test(value)) return 'open';
  }
  return null;
}

function getFeedback(expected, isCorrect) {
  if (isCorrect) return 'बिल्कुल सही। आपने सुरक्षित जवाब चुना है।';
  if (expected === 'never_share') return 'यह सुरक्षित नहीं है। बैंक या कोई भरोसेमंद व्यक्ति भी OTP नहीं मांगता। OTP कभी साझा न करें।';
  if (expected === 'dont_open') return 'यह सुरक्षित नहीं है। डराने वाले SMS के लिंक पर तुरंत क्लिक नहीं करना है। पहले जांच करें।';
  return 'यह सुरक्षित नहीं है। लिंक या मैसेज से नहीं, official app या official नंबर से ही जानकारी जांचें।';
}

export default function OtpSafetyLessonScreen({ navigation, route }) {
  const { profile, updateUserProfile } = useAuth();
  const lesson = route?.params?.lessonKey === 'fakeLink' ? LESSONS.fakeLink : LESSONS.otp;
  const isRestarting = route?.params?.restart === true;
  const hydrationRef = useRef(false);
  const progressRef = useRef({ attempts: 0, correctAnswers: 0, startedAt: Date.now() });

  const [isReady, setIsReady] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [transcript, setTranscript] = useState('');

  const step = lesson.steps[stepIndex];
  const answeredCorrectly = feedback?.correct === true;

  useEffect(() => {
    if (!profile || hydrationRef.current) return;
    const stored = profile.guidedLessonProgress?.[lesson.id];
    const shouldShowCompletion = stored?.status === 'completed' && !isRestarting;
    const nextStepIndex = !isRestarting && stored?.status === 'in_progress'
      ? Math.min(stored.stepIndex || 0, lesson.steps.length - 1)
      : 0;

    progressRef.current = {
      attempts: isRestarting ? 0 : (stored?.attempts || 0),
      correctAnswers: isRestarting ? 0 : (stored?.correctAnswers || 0),
      startedAt: isRestarting ? Date.now() : (stored?.startedAt || Date.now()),
    };
    setStepIndex(nextStepIndex);
    setCompleted(shouldShowCompletion);
    hydrationRef.current = true;
    setIsReady(true);
  }, [profile, lesson.id, lesson.steps.length, isRestarting]);

  useEffect(() => {
    if (!isReady || !isRestarting) return;
    progressRef.current = { attempts: 0, correctAnswers: 0, startedAt: Date.now() };
    setCompleted(false);
    setFeedback(null);
    setTranscript('');
    setStepIndex(0);
  }, [isReady, isRestarting]);

  useEffect(() => {
    const unsubscribeBlur = navigation.addListener('blur', () => {
      Speech.stop();
      cancelRecording();
      setIsSpeaking(false);
      setIsRecording(false);
    });
    return () => {
      unsubscribeBlur();
      Speech.stop();
      cancelRecording();
    };
  }, [navigation]);

  const saveProgress = async (updates) => {
    const nextRecord = {
      status: 'in_progress', lessonId: lesson.id, stepIndex,
      attempts: progressRef.current.attempts, correctAnswers: progressRef.current.correctAnswers,
      startedAt: progressRef.current.startedAt, updatedAt: Date.now(), ...updates,
    };
    try {
      await updateUserProfile({
        guidedLessonProgress: { ...(profile?.guidedLessonProgress || {}), [lesson.id]: nextRecord },
      });
    } catch (error) {
      console.warn(`Could not save ${lesson.id} progress:`, error);
    }
  };

  const speak = (text) => {
    cancelRecording();
    Speech.stop();
    setIsRecording(false);
    setIsSpeaking(true);
    Speech.speak(text, {
      language: profile?.language || 'hi-IN', rate: 0.78, pitch: 1,
      onDone: () => setIsSpeaking(false), onError: () => setIsSpeaking(false),
    });
  };

  useEffect(() => {
    if (!isReady || completed || !step) return;
    setFeedback(null);
    setTranscript('');
    saveProgress({ stepIndex, lastStepId: step.id });
    const timer = setTimeout(() => speak(step.narration), 250);
    return () => clearTimeout(timer);
  }, [isReady, stepIndex, completed]);

  const handleAnswer = (answerId, source = 'tap') => {
    if (!step?.expected || answeredCorrectly) return;
    progressRef.current.attempts += 1;
    const isCorrect = answerId === step.expected;
    if (isCorrect) {
      progressRef.current.correctAnswers += 1;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    const message = getFeedback(step.expected, isCorrect);
    setFeedback({ correct: isCorrect, message, source, answerId });
    saveProgress({ stepIndex, lastStepId: step.id, lastAnswer: answerId, status: 'in_progress' });
    speak(message);
  };

  const startVoiceAnswer = async () => {
    if (!step?.expected || isRecording || isProcessing) return;
    Speech.stop();
    setIsSpeaking(false);
    const recording = await startRecording();
    if (!recording) {
      Alert.alert('माइक्रोफोन की अनुमति चाहिए', 'आप नीचे दिए गए बड़े जवाब बटन दबाकर भी आगे बढ़ सकती हैं।');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTranscript('');
    setFeedback(null);
    setIsRecording(true);
  };

  const stopVoiceAnswer = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    setIsProcessing(true);
    try {
      const result = await stopRecordingAndTranscribe(profile?.language || 'hi-IN');
      if (!result.success || !result.text) {
        setFeedback({ correct: false, neutral: true, message: 'आवाज़ साफ़ नहीं समझ आई। कोई बात नहीं—नीचे जवाब का बटन दबाकर सीखना जारी रखें।' });
        return;
      }
      setTranscript(result.text);
      const answerId = classifySpokenAnswer(step.expected, result.text);
      if (!answerId) {
        setFeedback({ correct: false, neutral: true, message: 'मैं जवाब को पक्का नहीं समझ पाई। कृपया नीचे दिए गए जवाब में से एक चुनें।' });
        return;
      }
      handleAnswer(answerId, 'voice');
    } catch (error) {
      console.warn('Voice lesson answer failed:', error);
      setFeedback({ correct: false, neutral: true, message: 'आवाज़ सुनने में समस्या आई। नीचे दिए गए जवाब बटन से आगे बढ़ें।' });
    } finally {
      setIsProcessing(false);
    }
  };

  const continueLesson = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (stepIndex === lesson.steps.length - 1) {
      Speech.stop();
      await saveProgress({ status: 'completed', stepIndex, lastStepId: step.id, completedAt: Date.now() });
      setCompleted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speak(`शाबाश! आपने ${lesson.label} का पाठ पूरा कर लिया है।`);
      return;
    }
    setStepIndex((current) => current + 1);
  };

  const restartLesson = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    progressRef.current = { attempts: 0, correctAnswers: 0, startedAt: Date.now() };
    setCompleted(false);
    setFeedback(null);
    setTranscript('');
    setStepIndex(0);
  };

  if (!isReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <GradientBackground colors={[COLORS.background.primary, lesson.colors.end]}>
          <View style={styles.loading}><Text style={styles.loadingText}>पाठ तैयार हो रहा है…</Text></View>
        </GradientBackground>
      </SafeAreaView>
    );
  }

  if (completed) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <GradientBackground colors={[COLORS.background.primary, '#E9F8F1']}>
          <View style={styles.completePage}>
            <View style={[styles.completeIcon, { backgroundColor: lesson.colors.soft }]}><MaterialCommunityIcons name="shield-check" size={64} color={lesson.colors.accent} /></View>
            <Text style={styles.completeTitle}>{lesson.completionTitle}</Text>
            <Text style={styles.completeText}>{lesson.completionText}</Text>
            <Pressable style={[styles.primaryButton, { backgroundColor: lesson.colors.accent }]} onPress={() => navigation.navigate('SeparateProgress', { initialTab: 'voice' })}>
              <MaterialCommunityIcons name="chart-line" size={22} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>मेरी प्रगति देखें</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={restartLesson}>
              <MaterialCommunityIcons name="refresh" size={21} color={lesson.colors.accent} />
              <Text style={[styles.secondaryButtonText, { color: lesson.colors.accent }]}>पाठ दोहराएं</Text>
            </Pressable>
          </View>
        </GradientBackground>
      </SafeAreaView>
    );
  }

  const isQuestion = step.kind === 'question';
  const canContinue = !isQuestion || answeredCorrectly;

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientBackground colors={[COLORS.background.primary, lesson.colors.end]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.progressRow}>
            {lesson.steps.map((lessonStep, index) => {
              const isCompletedStep = index < stepIndex;
              const isCurrentStep = index === stepIndex;
              return (
                <View
                  key={lessonStep.id}
                  style={[
                    styles.progressDot,
                    { borderColor: lesson.colors.accent },
                    isCompletedStep && { backgroundColor: lesson.colors.accent },
                    isCurrentStep && [styles.progressDotCurrent, { backgroundColor: '#FFFFFF', borderColor: lesson.colors.accent }],
                    !isCompletedStep && !isCurrentStep && { backgroundColor: lesson.colors.soft, borderColor: lesson.colors.border },
                  ]}
                >
                  {isCompletedStep && <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />}
                </View>
              );
            })}
          </View>
          <Text style={[styles.progressLabel, { color: lesson.colors.accent }]}>{lesson.label} · पाठ {stepIndex + 1} / {lesson.steps.length}</Text>

          <View style={styles.hero}>
            <View style={[styles.heroIcon, { backgroundColor: lesson.colors.soft }]}><MaterialCommunityIcons name={step.icon} size={37} color={lesson.colors.accent} /></View>
            <View style={styles.avatarWrap}><AnimatedDidiAvatar isSpeaking={isSpeaking} isListening={isRecording} emotion={feedback?.correct ? 'proud' : 'encouraging'} size={116} /></View>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.narration}>{step.narration}</Text>
          </View>

          <Pressable accessibilityRole="button" onPress={() => speak(step.narration)} style={[styles.listenButton, { backgroundColor: lesson.colors.soft, borderColor: lesson.colors.border }]}>
            <MaterialCommunityIcons name={isSpeaking ? 'volume-high' : 'volume-medium'} size={22} color={lesson.colors.accent} />
            <Text style={[styles.listenText, { color: lesson.colors.accent }]}>{isSpeaking ? 'सखी बोल रही है…' : 'फिर से सुनें'}</Text>
          </Pressable>

          <View style={styles.helperCard}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={22} color={COLORS.primary[700]} />
            <Text style={styles.helperText}>{step.helper}</Text>
          </View>

          {isQuestion && <>
            <View style={[styles.voiceAnswerCard, { borderColor: lesson.colors.border }]}>
              <Text style={styles.voiceAnswerTitle}>अपना जवाब बोलें</Text>
              <Text style={styles.voiceAnswerText}>बोलना आसान लगे तो बोलें, नहीं तो नीचे बड़ा जवाब बटन दबाएं।</Text>
              <Pressable accessibilityRole="button" onPress={isRecording ? stopVoiceAnswer : startVoiceAnswer} disabled={isProcessing || answeredCorrectly} style={[styles.micButton, { backgroundColor: lesson.colors.accent }, isRecording && styles.micButtonRecording, (isProcessing || answeredCorrectly) && styles.disabledButton]}>
                <MaterialCommunityIcons name={isRecording ? 'stop' : 'microphone'} size={25} color="#FFFFFF" />
                <Text style={styles.micButtonText}>{isProcessing ? 'जवाब जांच रही हूं…' : isRecording ? 'बोलना पूरा हुआ' : 'बोलकर जवाब दें'}</Text>
              </Pressable>
              {!!transcript && <Text style={styles.transcript}>आपने कहा: “{transcript}”</Text>}
            </View>

            <Text style={styles.choiceHeading}>या सही जवाब चुनें</Text>
            <View style={styles.choiceList}>
              {step.choices.map((choice) => {
                const wasSelected = feedback?.answerId === choice.id;
                const isCorrectChoice = choice.id === step.expected;
                const showCorrect = Boolean(feedback?.answerId) && isCorrectChoice;
                return (
                  <Pressable
                    key={choice.id}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: answeredCorrectly, selected: wasSelected || showCorrect }}
                    onPress={() => handleAnswer(choice.id)}
                    disabled={answeredCorrectly}
                    style={({ pressed }) => [
                      styles.choiceButton,
                      { borderColor: lesson.colors.border },
                      wasSelected && !feedback?.correct && styles.choiceWrong,
                      showCorrect && styles.choiceCorrect,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={[styles.choiceIcon, { backgroundColor: lesson.colors.soft }]}>
                      <MaterialCommunityIcons name={choice.icon} size={24} color={lesson.colors.accent} />
                    </View>
                    <Text style={styles.choiceText}>{choice.label}</Text>
                    {showCorrect && <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.status.success} />}
                    {wasSelected && !feedback?.correct && <MaterialCommunityIcons name="close-circle" size={24} color={COLORS.status.error} />}
                  </Pressable>
                );
              })}
            </View>
          </>}

          {feedback && <View style={[styles.feedbackCard, feedback.correct ? styles.feedbackSuccess : feedback.neutral ? styles.feedbackNeutral : styles.feedbackWarning]}>
            <MaterialCommunityIcons name={feedback.correct ? 'check-circle-outline' : feedback.neutral ? 'information-outline' : 'alert-circle-outline'} size={25} color={feedback.correct ? COLORS.status.success : feedback.neutral ? lesson.colors.accent : COLORS.status.warning} />
            <Text style={styles.feedbackText}>{feedback.message}</Text>
          </View>}

          <Pressable accessibilityRole="button" onPress={continueLesson} disabled={!canContinue} style={[styles.primaryButton, { backgroundColor: lesson.colors.accent }, !canContinue && styles.disabledButton]}>
            <Text style={styles.primaryButtonText}>{stepIndex === lesson.steps.length - 1 ? 'पाठ पूरा करें' : canContinue ? 'आगे बढ़ें' : 'पहले सही जवाब चुनें'}</Text>
            <MaterialCommunityIcons name={stepIndex === lesson.steps.length - 1 ? 'check' : 'arrow-right'} size={23} color="#FFFFFF" />
          </Pressable>
        </ScrollView>
      </GradientBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background.primary },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: TYPOGRAPHY.fontSize.base },
  content: { padding: SPACING.md, paddingBottom: SPACING['2xl'] },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: SPACING.xs },
  progressDot: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  progressDotCurrent: { width: 24, height: 24, borderRadius: 12, borderWidth: 4 },
  progressLabel: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.xs, textAlign: 'center', marginTop: SPACING.xs },
  hero: { alignItems: 'center', marginTop: SPACING.md },
  heroIcon: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
  avatarWrap: { marginTop: -4 },
  title: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.xl, textAlign: 'center', marginTop: 2 },
  narration: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.fontSize.base, lineHeight: 31, textAlign: 'center', marginTop: SPACING.sm, maxWidth: 390 },
  listenButton: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: BORDER_RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, marginTop: SPACING.md },
  listenText: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.sm },
  helperCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FFF6DA', borderWidth: 1, borderColor: '#F2D795', borderRadius: BORDER_RADIUS.lg, padding: SPACING.sm, marginTop: SPACING.md },
  helperText: { flex: 1, color: '#735313', fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: TYPOGRAPHY.fontSize.sm, lineHeight: 25 },
  voiceAnswerCard: { backgroundColor: COLORS.background.card, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, padding: SPACING.md, marginTop: SPACING.md, alignItems: 'center' },
  voiceAnswerTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.lg },
  voiceAnswerText: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.fontSize.xs, textAlign: 'center', marginTop: 3 },
  micButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, marginTop: SPACING.sm, minWidth: 220 },
  micButtonRecording: { backgroundColor: COLORS.status.error },
  micButtonText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.sm },
  transcript: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.fontSize.xs, fontStyle: 'italic', textAlign: 'center', marginTop: SPACING.sm },
  choiceHeading: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.sm, textAlign: 'center', marginTop: SPACING.md, marginBottom: SPACING.xs },
  choiceList: { gap: SPACING.sm },
  choiceButton: { minHeight: 64, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background.card, borderWidth: 1.5, borderRadius: BORDER_RADIUS.lg, padding: SPACING.sm },
  choiceCorrect: { backgroundColor: COLORS.ui.successSurface, borderColor: COLORS.status.success },
  choiceWrong: { backgroundColor: COLORS.ui.warningSurface, borderColor: COLORS.status.error },
  choiceIcon: { height: 44, width: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  choiceText: { flex: 1, color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: TYPOGRAPHY.fontSize.sm, lineHeight: 25 },
  feedbackCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: BORDER_RADIUS.lg, padding: SPACING.sm, marginTop: SPACING.md },
  feedbackSuccess: { backgroundColor: '#EAF8EE', borderWidth: 1, borderColor: '#BDE5C8' },
  feedbackWarning: { backgroundColor: '#FFF0DF', borderWidth: 1, borderColor: '#F0C79A' },
  feedbackNeutral: { backgroundColor: COLORS.secondary[50], borderWidth: 1, borderColor: COLORS.secondary[200] },
  feedbackText: { flex: 1, color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: TYPOGRAPHY.fontSize.sm, lineHeight: 25 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginTop: SPACING.md },
  primaryButtonText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.base },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: SPACING.sm, marginTop: SPACING.sm },
  secondaryButtonText: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.sm },
  disabledButton: { opacity: 0.48 },
  disabledChoice: { opacity: 0.62 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  completePage: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  completeIcon: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  completeTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.xl, textAlign: 'center', marginTop: SPACING.lg },
  completeText: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.fontSize.base, lineHeight: 31, textAlign: 'center', marginTop: SPACING.sm, maxWidth: 330 },
});
