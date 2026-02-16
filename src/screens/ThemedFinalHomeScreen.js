import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Animated,
  SafeAreaView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../providers/AuthProvider';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';
import GradientBackground from '../components/GradientBackground';
import AnimatedDidiAvatar from '../components/AnimatedDidiAvatar';

const { width } = Dimensions.get('window');
const CARD_GAP = SPACING.md;
const SIDE_CARD_WIDTH = (width - SPACING.lg * 2 - CARD_GAP) / 2;

export default function ThemedFinalHomeScreen({ navigation }) {
  const { profile } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const callButtonScale = useRef(new Animated.Value(1)).current;
  const callButtonGlow = useRef(new Animated.Value(0.3)).current;
  const videoCardScale = useRef(new Animated.Value(1)).current;
  const readCardScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Welcome message
    setTimeout(() => {
      const welcomeMessage = `नमस्ते ${profile?.name || 'बहन'}! आज क्या सीखना चाहेंगी?`;
      speakText(welcomeMessage);
    }, 1500);

    // Subtle pulsing animation on call button
    Animated.loop(
      Animated.sequence([
        Animated.timing(callButtonGlow, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(callButtonGlow, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const speakText = (text) => {
    setIsPlaying(true);
    Speech.speak(text, {
      language: profile?.language || 'hi-IN',
      rate: 0.8,
      pitch: 1.1,
      onDone: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const getGreeting = () => {
    const name = profile?.name || 'बहन';
    const hour = new Date().getHours();
    let greeting = 'नमस्ते';
    if (hour < 12) greeting = 'सुप्रभात';
    else if (hour < 17) greeting = 'नमस्ते';
    else greeting = 'शुभ संध्या';
    return `${greeting}, ${name}!`;
  };

  const animatePress = (scaleRef, callback) => {
    Animated.sequence([
      Animated.timing(scaleRef, {
        toValue: 0.93,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleRef, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  const handleCallPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    animatePress(callButtonScale, () => {
      navigation.navigate('GeminiVoiceCall', {
        topic: 'general_health',
      });
    });
  };

  const handleVideoPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animatePress(videoCardScale, () => {
      navigation.navigate('VideoLearningCategories');
    });
  };

  const handleReadPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animatePress(readCardScale, () => {
      navigation.navigate('ModuleLearningCategories');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* -- Greeting -- */}
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
          </View>

          {/* -- Didi Avatar -- */}
          <View style={styles.avatarSection}>
            <AnimatedDidiAvatar
              isSpeaking={isPlaying}
              emotion="welcoming"
              size={130}
            />
          </View>

          {/* -- Conversational Prompt -- */}
          <Text style={styles.prompt}>आज क्या सीखना चाहेंगी?</Text>

          {/* ============================================ */}
          {/* === HERO CARD: Call Sakhi (Primary CTA) ===  */}
          {/* ============================================ */}
          <Animated.View style={[styles.heroCardWrapper, { transform: [{ scale: callButtonScale }] }]}>
            <Pressable onPress={handleCallPress} style={styles.heroCard}>
              <LinearGradient
                colors={['#10B981', '#059669', '#047857']}
                style={styles.heroCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.heroContent}>
                  <View style={styles.heroIconContainer}>
                    <MaterialCommunityIcons name="phone" size={40} color="#FFFFFF" />
                  </View>
                  <Text style={styles.heroTitle}>सखी से बात करें</Text>
                  <Text style={styles.heroSubtitle}>किसी भी विषय पर बोलकर सीखें</Text>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* ============================================ */}
          {/* === TWO SIDE-BY-SIDE LEARNING MODE CARDS === */}
          {/* ============================================ */}
          <View style={styles.learningRow}>
            {/* Video Learning Card */}
            <Animated.View style={[styles.sideCardWrapper, { transform: [{ scale: videoCardScale }] }]}>
              <Pressable onPress={handleVideoPress} style={styles.sideCard}>
                <LinearGradient
                  colors={['#EF4444', '#DC2626', '#B91C1C']}
                  style={styles.sideCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                >
                  <View style={styles.sideCardIconWrap}>
                    <MaterialCommunityIcons name="play-circle" size={40} color="#FFFFFF" />
                  </View>
                  <Text style={styles.sideCardTitle}>वीडियो</Text>
                  <Text style={styles.sideCardSubtitle}>देखकर सीखें</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Reading/Module Learning Card */}
            <Animated.View style={[styles.sideCardWrapper, { transform: [{ scale: readCardScale }] }]}>
              <Pressable onPress={handleReadPress} style={styles.sideCard}>
                <LinearGradient
                  colors={['#3B82F6', '#2563EB', '#1D4ED8']}
                  style={styles.sideCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                >
                  <View style={styles.sideCardIconWrap}>
                    <MaterialCommunityIcons name="book-open-page-variant" size={40} color="#FFFFFF" />
                  </View>
                  <Text style={styles.sideCardTitle}>पढ़ाई</Text>
                  <Text style={styles.sideCardSubtitle}>पढ़कर सीखें</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>

          {/* ======================== */}
          {/* === Progress Button ===  */}
          {/* ======================== */}
          <Pressable
            style={({ pressed }) => [
              styles.progressButton,
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('SeparateProgress');
            }}
          >
            <MaterialCommunityIcons name="chart-line" size={24} color={COLORS.primary[600]} />
            <Text style={styles.progressText}>मेरी प्रगति देखें</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.text.tertiary} />
          </Pressable>
        </ScrollView>
      </GradientBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },

  // -- Greeting --
  greetingSection: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
  },

  // -- Avatar --
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  // -- Prompt --
  prompt: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },

  // ============================
  // HERO CARD (Call Sakhi)
  // ============================
  heroCardWrapper: {
    marginBottom: SPACING.md,
  },
  heroCard: {
    borderRadius: BORDER_RADIUS['2xl'],
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  heroCardGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    overflow: 'hidden',
  },

  heroContent: {
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    marginTop: 4,
  },

  // ============================
  // SIDE-BY-SIDE LEARNING CARDS
  // ============================
  learningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: CARD_GAP,
    marginBottom: SPACING.lg,
  },
  sideCardWrapper: {
    flex: 1,
  },
  sideCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  sideCardGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    overflow: 'hidden',
  },

  sideCardIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  sideCardTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sideCardSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },

  // ============================
  // PROGRESS BUTTON
  // ============================
  progressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.card,
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.primary[200],
    gap: SPACING.sm,
  },
  progressText: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});