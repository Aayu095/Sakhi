import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  ActivityIndicator
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../providers/AuthProvider';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';
import GradientBackground from '../components/GradientBackground';
import AnimatedDidiAvatar from '../components/AnimatedDidiAvatar';
import ProgressRing from '../components/ProgressRing';

const { width } = Dimensions.get('window');

export default function EnhancedStructuredLearningScreen({ route, navigation }) {
  const { moduleData, lessonIndex = 0 } = route.params;
  const { profile } = useAuth();

  const [currentLessonIndex, setCurrentLessonIndex] = useState(lessonIndex);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [lessonStartTime, setLessonStartTime] = useState(Date.now());
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [avatarEmotion, setAvatarEmotion] = useState('encouraging');

  const currentLesson = moduleData.lessons[currentLessonIndex];
  const totalLessons = moduleData.lessons.length;
  const totalSteps = currentLesson.content.keyPoints.length;
  const overallProgress = ((currentLessonIndex + (currentStepIndex / totalSteps)) / totalLessons) * 100;

  useEffect(() => {
    startLesson();
    setLessonStartTime(Date.now());
  }, [currentLessonIndex]);

  const startLesson = () => {
    setCurrentStepIndex(0);
    setLessonProgress(0);
    setCompletedSteps([]);
    setAvatarEmotion('encouraging');

    // Enhanced welcome message with personalization
    setTimeout(() => {
      const welcomeMessage = `नमस्ते ${profile?.name || 'बहन'}! आज हम "${currentLesson.title}" सीखेंगे। यह ${currentLesson.duration} का पाठ है। तैयार हैं?`;
      speakText(welcomeMessage);
    }, 1000);
  };

  const speakText = (text, onComplete = null) => {
    setIsPlaying(true);
    Speech.speak(text, {
      language: 'hi-IN',
      rate: 0.75, // Slower for better comprehension
      pitch: 1.1,
      onDone: () => {
        setIsPlaying(false);
        if (onComplete) onComplete();
      },
      onError: () => {
        setIsPlaying(false);
      }
    });
  };

  const handleStepComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!completedSteps.includes(currentStepIndex)) {
      const newCompleted = [...completedSteps, currentStepIndex];
      setCompletedSteps(newCompleted);

      // Update progress
      const newProgress = (newCompleted.length / totalSteps) * 100;
      setLessonProgress(newProgress);

      // Speak current step content
      const currentStep = currentLesson.content.keyPoints[currentStepIndex];
      speakText(`${currentStepIndex + 1}. ${currentStep}`, () => {
        // Auto-advance to next step after 2 seconds
        setTimeout(() => {
          if (currentStepIndex < totalSteps - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
            setAvatarEmotion('happy');
          } else {
            // All steps completed, show quiz
            setAvatarEmotion('proud');
            speakText('बहुत बढ़िया! अब हम एक छोटा सा अभ्यास करेंगे।', () => {
              setTimeout(() => setShowQuiz(true), 1000);
            });
          }
        }, 2000);
      });
    }
  };

  const handleQuizComplete = () => {
    const score = calculateQuizScore();

    if (score >= 70) {
      setAvatarEmotion('celebrating');
      speakText('शाबाश! आपने यह पाठ बहुत अच्छे से सीखा है।', () => {
        if (currentLessonIndex < totalLessons - 1) {
          // Show next lesson option
          Alert.alert(
            'पाठ पूरा!',
            `आपका स्कोर: ${score}%\n\nक्या आप अगला पाठ शुरू करना चाहती हैं?`,
            [
              { text: 'बाद में', onPress: () => navigation.goBack() },
              { text: 'अगला पाठ', onPress: () => moveToNextLesson() }
            ]
          );
        } else {
          // Module completed - show certificate
          setShowCertificate(true);
        }
      });
    } else {
      setAvatarEmotion('encouraging');
      speakText('कोई बात नहीं। एक बार ��िर से कोशिश करते हैं।', () => {
        setShowQuiz(false);
        setCurrentStepIndex(Math.max(0, currentStepIndex - 2)); // Go back 2 steps
        setLessonProgress(50);
      });
    }
  };

  const calculateQuizScore = () => {
    const totalQuestions = currentLesson.content.practiceExercises.length;
    const answeredQuestions = Object.keys(quizAnswers).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const moveToNextLesson = () => {
    setCurrentLessonIndex(currentLessonIndex + 1);
    setShowQuiz(false);
    setQuizAnswers({});
  };

  const completeModule = () => {
    setAvatarEmotion('celebrating');
    speakText(`बधाई हो ${profile?.name || 'बहन'}! आपने "${moduleData.title}" मॉड्यूल पूरा कर लिया है।`, () => {
      Alert.alert(
        'मॉड्यूल पूरा!',
        'आपको एक नया बैज मिला है!',
        [
          { text: 'प्रगति देखें', onPress: () => navigation.replace('Progress') },
          { text: 'होम जाएं', onPress: () => navigation.replace('Home') }
        ]
      );
    });
  };

  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <ProgressRing
          progress={overallProgress}
          size={60}
          color={COLORS.primary[500]}
        >
          <Text style={styles.progressText}>
            {Math.round(overallProgress)}%
          </Text>
        </ProgressRing>
        <View style={styles.progressInfo}>
          <Text style={styles.progressTitle}>
            पाठ {currentLessonIndex + 1} / {totalLessons}
          </Text>
          <Text style={styles.progressSubtitle}>
            चरण {currentStepIndex + 1} / {totalSteps}
          </Text>
          <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
        </View>
      </View>

      {/* Step Progress Dots */}
      <View style={styles.stepIndicators}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View key={index}
            style={[
              styles.stepDot,
              index <= currentStepIndex && styles.activeStepDot,
              completedSteps.includes(index) && styles.completedStepDot
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    const currentStep = currentLesson.content.keyPoints[currentStepIndex];
    const isCompleted = completedSteps.includes(currentStepIndex);

    return (
      <View key={currentStepIndex}
        style={styles.stepContainer}
      >
        <View style={styles.stepHeader}>
          <Text style={styles.stepNumber}>चरण {currentStepIndex + 1}</Text>
          <Text style={styles.stepTitle}>{currentStep}</Text>
        </View>

        <View style={styles.stepContent}>
          <Text style={styles.stepDescription}>
            {currentLesson.content.introduction}
          </Text>
        </View>

        <View style={styles.stepActions}>
          <Pressable
            style={styles.listenButton}
            onPress={() => speakText(currentStep)}
            disabled={isPlaying}
          >
            <Text style={styles.listenButtonText}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="volume-high" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.voiceButtonText}>{isPlaying ? 'सुन रहे हैं...' : 'फिर से सुनें'}</Text>
              </View>
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.completeButton,
              isCompleted && styles.completedButton
            ]}
            onPress={handleStepComplete}
            disabled={isCompleted}
          >
            <Text style={[
              styles.completeButtonText,
              isCompleted && styles.completedButtonText
            ]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name={isCompleted ? 'check-circle' : 'check'} size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.completeButtonText}>{isCompleted ? 'पूरा हुआ' : 'समझ गया'}</Text>
              </View>
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderQuizModal = () => (
    <Modal
      visible={showQuiz}
      animationType="slide"
      onRequestClose={() => setShowQuiz(false)}
    >
      <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
        <ScrollView style={styles.quizContainer}>
          <View style={styles.quizHeader}>
            <AnimatedDidiAvatar
              emotion="encouraging"
              size={80}
              isSpeaking={false}
            />
            <Text style={styles.quizTitle}>अभ्यास का समय!</Text>
            <Text style={styles.quizSubtitle}>
              जो कुछ सीखा है, उसे याद करके जवाब दें
            </Text>
          </View>

          {currentLesson.content.practiceExercises.map((exercise, index) => (
            <View key={index} style={styles.quizQuestion}>
              <Text style={styles.questionText}>
                प्रश्न {index + 1}: {exercise}
              </Text>
              <View style={styles.answerOptions}>
                {['समझ गया', 'थोड़ा और सीखना है', 'पूरी तरह सीख गया'].map((option, optIndex) => (
                  <Pressable
                    key={optIndex}
                    style={[
                      styles.answerOption,
                      quizAnswers[index] === optIndex && styles.selectedAnswer
                    ]}
                    onPress={() => setQuizAnswers(prev => ({ ...prev, [index]: optIndex }))}
                  >
                    <Text style={[
                      styles.answerText,
                      quizAnswers[index] === optIndex && styles.selectedAnswerText
                    ]}>
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.quizActions}>
            <Pressable
              style={styles.skipQuizButton}
              onPress={() => setShowQuiz(false)}
            >
              <Text style={styles.skipQuizText}>बाद में करूंगी</Text>
            </Pressable>
            <Pressable
              style={styles.submitQuizButton}
              onPress={handleQuizComplete}
            >
              <Text style={styles.submitQuizText}>जमा करें</Text>
            </Pressable>
          </View>
        </ScrollView>
      </GradientBackground>
    </Modal>
  );

  const renderCertificateModal = () => (
    <Modal
      visible={showCertificate}
      animationType="fade"
      onRequestClose={() => setShowCertificate(false)}
    >
      <GradientBackground colors={['#FFD700', '#FFA500']}>
        <View style={styles.certificateContainer}>
          <View style={styles.certificateCard}>
            <MaterialCommunityIcons name="trophy" size={64} color={COLORS.primary[500]} />
            <Text style={styles.certificateTitle}>बधाई हो!</Text>
            <Text style={styles.certificateName}>{profile?.name || 'आप'}</Text>
            <Text style={styles.certificateText}>
              ने सफलतापूर्वक पूरा किया है
            </Text>
            <Text style={styles.certificateModule}>"{moduleData.title}"</Text>
            <Text style={styles.certificateDate}>
              {new Date().toLocaleDateString('hi-IN')}
            </Text>

            <Pressable
              style={styles.certificateButton}
              onPress={completeModule}
            >
              <Text style={styles.certificateButtonText}>आगे बढ़ें</Text>
            </Pressable>
          </View>
        </View>
      </GradientBackground>
    </Modal>
  );

  return (
    <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Progress Header */}
        <View>
          {renderProgressIndicator()}
        </View>

        {/* Didi Avatar Section */}
        <View style={styles.avatarSection}>
          <AnimatedDidiAvatar
            isSpeaking={isPlaying}
            emotion={avatarEmotion}
            size={120}
          />
          <Text style={styles.didiMessage}>
            {isPlaying ? 'दीदी समझा रही हैं...' : 'दीदी आपकी मदद कर रही हैं'}
          </Text>
        </View>

        {/* Current Step Content */}
        <View>
          {renderCurrentStep()}
        </View>

        {/* Navigation Controls */}
        <View style={styles.navigationSection}>
          <Pressable
            style={[styles.navButton, currentStepIndex === 0 && styles.disabledButton]}
            onPress={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
          >
            <Text style={styles.navButtonText}>← पिछला</Text>
          </Pressable>

          <Pressable
            style={styles.homeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.homeButtonText}>होम</Text>
          </Pressable>

          <Pressable
            style={[
              styles.navButton,
              (currentStepIndex >= totalSteps - 1 || !completedSteps.includes(currentStepIndex)) && styles.disabledButton
            ]}
            onPress={() => setCurrentStepIndex(Math.min(totalSteps - 1, currentStepIndex + 1))}
            disabled={currentStepIndex >= totalSteps - 1 || !completedSteps.includes(currentStepIndex)}
          >
            <Text style={styles.navButtonText}>अगला →</Text>
          </Pressable>
        </View>
      </ScrollView>

      {renderQuizModal()}
      {renderCertificateModal()}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  progressContainer: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[500],
  },
  progressInfo: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  progressTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  progressSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  lessonTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.neutral.gray[300],
  },
  activeStepDot: {
    backgroundColor: COLORS.primary[400],
  },
  completedStepDot: {
    backgroundColor: COLORS.status.success,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  didiMessage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  stepContainer: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary[200],
  },
  stepHeader: {
    marginBottom: SPACING.md,
  },
  stepNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.xs,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  stepContent: {
    marginBottom: SPACING.lg,
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  stepActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  listenButton: {
    flex: 1,
    backgroundColor: COLORS.secondary[500],
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  listenButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  completeButton: {
    flex: 1,
    backgroundColor: COLORS.primary[500],
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: COLORS.status.success,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  completedButtonText: {
    color: '#fff',
  },
  navigationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  navButton: {
    backgroundColor: COLORS.primary[100],
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.neutral.gray[200],
    opacity: 0.5,
  },
  navButtonText: {
    color: COLORS.primary[700],
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  homeButton: {
    backgroundColor: COLORS.neutral.gray[200],
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  homeButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  // Quiz Modal Styles
  quizContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  quizHeader: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  quizTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  quizSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  quizQuestion: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  questionText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  answerOptions: {
    gap: SPACING.sm,
  },
  answerOption: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedAnswer: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  answerText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  selectedAnswerText: {
    color: COLORS.primary[700],
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  quizActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  skipQuizButton: {
    flex: 1,
    backgroundColor: COLORS.neutral.gray[300],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  skipQuizText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  submitQuizButton: {
    flex: 1,
    backgroundColor: COLORS.primary[500],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  submitQuizText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  // Certificate Modal Styles
  certificateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  certificateCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING['2xl'],
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  certificateIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  certificateTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[600],
    marginBottom: SPACING.md,
  },
  certificateName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  certificateText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  certificateModule: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[500],
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  certificateDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
  },
  certificateButton: {
    backgroundColor: COLORS.primary[500],
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
  },
  certificateButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});