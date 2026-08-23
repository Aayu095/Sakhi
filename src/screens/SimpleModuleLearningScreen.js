import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Modal
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../providers/AuthProvider';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';
import GradientBackground from '../components/GradientBackground';

const { width } = Dimensions.get('window');

// Simple reading module
const SIMPLE_MODULE = {
  id: 'menstrual_health_reading',
  title: 'महावारी की जानकारी',
  subtitle: 'Menstrual Health Guide',
  description: 'महावारी के बारे में पढ़कर सीखें',
  icon: 'water-circle',
  color: ['#EC4899', '#F472B6'],
  content: {
    sections: [
      {
        title: 'महावारी क्या है?',
        content: `महावारी (मासिक धर्म) एक प्राकृतिक प्रक्रिया है जो हर महिला के साथ होती है।

मुख्य बातें:
• यह हर 28 दिन में एक बार आती है
• 3-7 दिन तक रहती है  
• यह बिल्कुल सामान्य और प्राकृतिक है
• इससे डरने या शर्म करने की कोई बात नहीं है`
      },
      {
        title: 'सफाई कैसे रखें?',
        content: `महावारी के दौरान सफाई बहुत जरूरी है:

सफाई के नियम:
• हर 4-6 घंटे में पैड बदलें
• साफ पानी से धोएं
• साबुन का इस्तेमाल करें
• सूखे और साफ कपड़े से पोंछें
• हाथ धोना न भूलें`
      }
    ]
  }
};

export default function SimpleModuleLearningScreen({ route, navigation }) {
  const { moduleData = SIMPLE_MODULE } = route.params || {};
  const { profile } = useAuth();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [readingSections, setReadingSections] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const currentSection = moduleData.content.sections[currentSectionIndex];
  const totalSections = moduleData.content.sections.length;

  // Cleanup audio immediately on exit
  useEffect(() => {
    const unsubscribeBlur = navigation.addListener('blur', () => {
      Speech.stop();
      setIsPlaying(false);
    });

    return () => {
      unsubscribeBlur();
      Speech.stop();
    };
  }, [navigation]);

  const speakText = (text) => {
    Speech.stop(); // Stop any overlapping previous text
    setIsPlaying(true);
    Speech.speak(text, {
      language: 'hi-IN',
      rate: 0.8,
      pitch: 1.0,
      onDone: () => setIsPlaying(false),
      onError: () => setIsPlaying(false)
    });
  };

  const markSectionAsRead = () => {
    if (!readingSections.includes(currentSectionIndex)) {
      setReadingSections([...readingSections, currentSectionIndex]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const nextSection = () => {
    Speech.stop();
    setIsPlaying(false);
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const previousSection = () => {
    Speech.stop();
    setIsPlaying(false);
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const finishModule = () => {
    Speech.stop();
    setIsPlaying(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowCompletionModal(true);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={moduleData.color}
        style={styles.headerGradient}
      >
        <MaterialCommunityIcons name={moduleData.icon} size={48} color="#FFFFFF" style={{ marginBottom: SPACING.sm }} />
        <Text style={styles.moduleTitle}>{moduleData.title}</Text>
        <Text style={styles.moduleSubtitle}>{moduleData.subtitle}</Text>
      </LinearGradient>
    </View>
  );

  const renderSectionContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>{currentSection.title}</Text>
          <Text style={styles.sectionProgress}>
            भाग {currentSectionIndex + 1} / {totalSections}
          </Text>
        </View>

        {/* Visual Progress Bar */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${((currentSectionIndex + 1) / totalSections) * 100}%` },
              { backgroundColor: moduleData.color[0] }
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.contentText}>{currentSection.content}</Text>
      </ScrollView>

      <View style={styles.sectionActions}>
        <Pressable
          style={styles.listenButton}
          onPress={() => speakText(currentSection.content)}
          disabled={isPlaying}
        >
          <MaterialCommunityIcons
            name={isPlaying ? "volume-high" : "volume-high"}
            size={20}
            color={COLORS.text.primary}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.listenButtonText}>
            {isPlaying ? 'सुन रहे हैं...' : 'सुनें'}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.readButton,
            readingSections.includes(currentSectionIndex) && styles.readCompleteButton
          ]}
          onPress={markSectionAsRead}
          disabled={readingSections.includes(currentSectionIndex)}
        >
          <MaterialCommunityIcons
            name={readingSections.includes(currentSectionIndex) ? "check-circle" : "check"}
            size={20}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={[
            styles.readButtonText,
            readingSections.includes(currentSectionIndex) && styles.readCompleteText
          ]}>
            {readingSections.includes(currentSectionIndex) ? 'पढ़ लिया' : 'पढ़ लिया'}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderNavigation = () => {
    const isLastSection = currentSectionIndex >= totalSections - 1;
    const isCurrentRead = readingSections.includes(currentSectionIndex);

    return (
      <View style={styles.navigationSection}>
        <Pressable
          style={[styles.navButton, currentSectionIndex === 0 && styles.disabledButton]}
          onPress={previousSection}
          disabled={currentSectionIndex === 0}
        >
          <Text style={styles.navButtonText}>← पिछला</Text>
        </Pressable>

        <Pressable
          style={styles.homeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.homeButtonText}>होम पर जाएं</Text>
        </Pressable>

        {isLastSection ? (
          <Pressable
            style={[
              styles.navButton,
              { backgroundColor: COLORS.status.success },
              !isCurrentRead && styles.disabledButton
            ]}
            onPress={finishModule}
            disabled={!isCurrentRead}
          >
            <Text style={[styles.navButtonText, { color: '#FFF' }]}>पूरा करें ✓</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[
              styles.navButton,
              !isCurrentRead && styles.disabledButton
            ]}
            onPress={nextSection}
            disabled={!isCurrentRead}
          >
            <Text style={styles.navButtonText}>अगला →</Text>
          </Pressable>
        )}
      </View>
    );
  };

  const renderCompletionModal = () => (
    <Modal transparent visible={showCompletionModal} animationType="fade">
      <BlurView intensity={80} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalIconBadge}>
            <MaterialCommunityIcons name="star-circle" size={50} color={COLORS.secondary[500]} />
          </View>
          <Text style={styles.modalTitle}>बधाई हो!</Text>
          <Text style={styles.modalSubtitle}>आपने " {moduleData.title} " का कोर्स सफलतापूर्वक पूरा कर लिया है।</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalSections}</Text>
              <Text style={styles.statLabel}>पढ़े गए भाग</Text>
            </View>
          </View>

          <Pressable
            style={styles.modalButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.modalButtonText}>होम पर लौटें</Text>
            <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
          </Pressable>
        </View>
      </BlurView>
    </Modal>
  );

  return (
    <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View>
          {renderHeader()}
        </View>

        <View>
          {renderSectionContent()}
        </View>

        {renderNavigation()}
      </ScrollView>
      {renderCompletionModal()}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  moduleIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  moduleTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  moduleSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  contentContainer: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 300,
  },
  sectionHeader: {
    marginBottom: SPACING.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    flex: 1,
  },
  sectionProgress: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.neutral.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  contentScroll: {
    flex: 1,
    marginBottom: SPACING.lg,
  },
  contentText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  sectionActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  listenButton: {
    flex: 1,
    backgroundColor: COLORS.secondary[500],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  listenButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  readButton: {
    flex: 1,
    backgroundColor: COLORS.primary[500],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  readCompleteButton: {
    backgroundColor: COLORS.status.success,
  },
  readButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  readCompleteText: {
    color: '#fff',
  },
  navigationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
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
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  homeButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  // Modal Styles
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.neutral.gray[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.neutral.gray[500],
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.neutral.gray[50],
    padding: SPACING.md,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.neutral.gray[800],
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.neutral.gray[500],
    marginTop: 2,
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