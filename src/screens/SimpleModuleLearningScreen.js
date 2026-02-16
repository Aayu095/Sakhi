import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

  const currentSection = moduleData.content.sections[currentSectionIndex];
  const totalSections = moduleData.content.sections.length;

  const speakText = (text) => {
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
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const previousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
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
        <Text style={styles.sectionTitle}>{currentSection.title}</Text>
        <Text style={styles.sectionProgress}>
          भाग {currentSectionIndex + 1} / {totalSections}
        </Text>
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

  const renderNavigation = () => (
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
        <Text style={styles.homeButtonText}>होम</Text>
      </Pressable>

      <Pressable
        style={[
          styles.navButton,
          (currentSectionIndex >= totalSections - 1 || !readingSections.includes(currentSectionIndex)) && styles.disabledButton
        ]}
        onPress={nextSection}
        disabled={currentSectionIndex >= totalSections - 1 || !readingSections.includes(currentSectionIndex)}
      >
        <Text style={styles.navButtonText}>अगला →</Text>
      </Pressable>
    </View>
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
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  sectionProgress: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
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
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  homeButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});