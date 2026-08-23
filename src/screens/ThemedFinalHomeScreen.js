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
import { useAccessibility } from '../hooks/useAccessibility';
import { useAuth } from '../providers/AuthProvider';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';
import GradientBackground from '../components/GradientBackground';
import AnimatedDidiAvatar from '../components/AnimatedDidiAvatar';

const { width } = Dimensions.get('window');
const CARD_GAP = SPACING.md;
const SIDE_CARD_WIDTH = (width - SPACING.lg * 2 - CARD_GAP) / 2;
let hasPlayedGreeting = false;

export default function ThemedFinalHomeScreen({ navigation }) {
  const { profile } = useAuth();
  const { scaleText } = useAccessibility();
  const [isPlaying, setIsPlaying] = useState(false);
  const callButtonScale = useRef(new Animated.Value(1)).current;
  const callButtonGlow = useRef(new Animated.Value(0.3)).current;
  const videoCardScale = useRef(new Animated.Value(1)).current;
  const readCardScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      if (!hasPlayedGreeting) {
        const timer = setTimeout(() => {
          speakText(`नमस्ते ${profile?.name || 'बहन'}! आज क्या सीखना चाहेंगी?`);
          hasPlayedGreeting = true;
        }, 500);
        return () => clearTimeout(timer);
      }
    });

    const unsubscribeBlur = navigation.addListener('blur', () => {
      Speech.stop();
      setIsPlaying(false);
    });

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(callButtonGlow, { toValue: 0.6, duration: 1500, useNativeDriver: true }),
        Animated.timing(callButtonGlow, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
      ]),
    );
    glowAnimation.start();

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
      glowAnimation.stop();
      Speech.stop();
    };
  }, [navigation, profile, callButtonGlow]);

  const speakText = (text) => {
    Speech.stop();
    setIsPlaying(true);
    Speech.speak(text, {
      language: profile?.language || 'hi-IN',
      rate: 0.85,
      pitch: 1.1,
      onDone: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const getGreeting = () => {
    const name = profile?.name || 'बहन';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'सुप्रभात' : hour < 17 ? 'नमस्ते' : 'शुभ संध्या';
    return `${greeting}, ${name}!`;
  };

  const animatePress = (scaleRef, callback) => {
    Animated.sequence([
      Animated.timing(scaleRef, { toValue: 0.93, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleRef, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(callback);
  };

  const handleCallPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    animatePress(callButtonScale, () => navigation.navigate('GeminiVoiceCall', { topic: 'general' }));
  };

  const handleVideoPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animatePress(videoCardScale, () => navigation.navigate('VideoLearningCategories'));
  };

  const handleReadPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animatePress(readCardScale, () => navigation.navigate('ModuleLearningCategories'));
  };

  const handleCommunityPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Community');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.greetingSection}>
            <Text style={[styles.greeting, { fontSize: scaleText(TYPOGRAPHY.fontSize['3xl']) }]}>{getGreeting()}</Text>
          </View>

          <View style={styles.avatarSection}>
            <AnimatedDidiAvatar isSpeaking={isPlaying} emotion="welcoming" size={130} />
          </View>

          <Text style={[styles.prompt, { fontSize: scaleText(TYPOGRAPHY.fontSize.xl) }]}>आज क्या सीखना चाहेंगी?</Text>

          <Animated.View style={[styles.heroCardWrapper, { transform: [{ scale: callButtonScale }] }]}>
            <Pressable accessibilityRole="button" accessibilityLabel="सखी से बात करें" onPress={handleCallPress} style={styles.heroCard}>
              <LinearGradient colors={['#10B981', '#059669', '#047857']} style={styles.heroCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.heroContent}>
                  <View style={styles.heroIconContainer}>
                    <MaterialCommunityIcons name="phone" size={40} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.heroTitle, { fontSize: scaleText(TYPOGRAPHY.fontSize['2xl']) }]}>सखी से बात करें</Text>
                  <Text style={[styles.heroSubtitle, { fontSize: scaleText(TYPOGRAPHY.fontSize.base) }]}>किसी भी विषय पर बोलकर सीखें</Text>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <View style={styles.learningRow}>
            <Animated.View style={[styles.sideCardWrapper, { transform: [{ scale: videoCardScale }] }]}>
              <Pressable accessibilityRole="button" accessibilityLabel="वीडियो देखकर सीखें" onPress={handleVideoPress} style={styles.sideCard}>
                <LinearGradient colors={['#EF4444', '#DC2626', '#B91C1C']} style={styles.sideCardGradient} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }}>
                  <View style={styles.sideCardIconWrap}>
                    <MaterialCommunityIcons name="play-circle" size={40} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.sideCardTitle, { fontSize: scaleText(TYPOGRAPHY.fontSize['2xl']) }]}>वीडियो</Text>
                  <Text style={[styles.sideCardSubtitle, { fontSize: scaleText(TYPOGRAPHY.fontSize.sm) }]}>देखकर सीखें</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            <Animated.View style={[styles.sideCardWrapper, { transform: [{ scale: readCardScale }] }]}>
              <Pressable accessibilityRole="button" accessibilityLabel="पढ़कर सीखें" onPress={handleReadPress} style={styles.sideCard}>
                <LinearGradient colors={['#3B82F6', '#2563EB', '#1D4ED8']} style={styles.sideCardGradient} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }}>
                  <View style={styles.sideCardIconWrap}>
                    <MaterialCommunityIcons name="book-open-page-variant" size={40} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.sideCardTitle, { fontSize: scaleText(TYPOGRAPHY.fontSize['2xl']) }]}>पढ़ाई</Text>
                  <Text style={[styles.sideCardSubtitle, { fontSize: scaleText(TYPOGRAPHY.fontSize.sm) }]}>पढ़कर सीखें</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>

          <Pressable accessibilityRole="button" accessibilityLabel="मेरी प्रगति देखें" style={({ pressed }) => [styles.progressButton, pressed && styles.pressed]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('SeparateProgress'); }}>
            <MaterialCommunityIcons name="chart-line" size={24} color={COLORS.primary[700]} />
            <Text style={[styles.progressText, { fontSize: scaleText(TYPOGRAPHY.fontSize.lg) }]}>मेरी प्रगति देखें</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.text.tertiary} />
          </Pressable>

          <Pressable accessibilityRole="button" accessibilityLabel="समुदाय से जुड़ें" accessibilityHint="सहेलियों के अनुभव और समुदाय की जानकारी देखें" style={({ pressed }) => [styles.progressButton, styles.communityButton, pressed && styles.pressed]} onPress={handleCommunityPress}>
            <MaterialCommunityIcons name="account-group-outline" size={24} color={COLORS.secondary[800]} />
            <Text style={[styles.progressText, styles.communityText, { fontSize: scaleText(TYPOGRAPHY.fontSize.lg) }]}>समुदाय से जुड़ें</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.secondary[800]} />
          </Pressable>
        </ScrollView>
      </GradientBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background.primary },
  container: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING['2xl'] },
  greetingSection: { alignItems: 'center', marginBottom: SPACING.sm, paddingTop: SPACING.sm },
  greeting: { fontFamily: TYPOGRAPHY.fontFamily.bold, color: COLORS.text.primary, textAlign: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: SPACING.md },
  prompt: { fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.text.secondary, textAlign: 'center', marginBottom: SPACING.lg },
  heroCardWrapper: { marginBottom: SPACING.md },
  heroCard: { borderRadius: BORDER_RADIUS['2xl'], overflow: 'hidden', elevation: 8, shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12 },
  heroCardGradient: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl, alignItems: 'center', justifyContent: 'center', minHeight: 140 },
  heroContent: { alignItems: 'center' },
  heroIconContainer: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.3)' },
  heroTitle: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamily.bold, textAlign: 'center' },
  heroSubtitle: { color: 'rgba(255, 255, 255, 0.85)', fontFamily: TYPOGRAPHY.fontFamily.regular, textAlign: 'center', marginTop: 4 },
  learningRow: { flexDirection: 'row', justifyContent: 'space-between', gap: CARD_GAP, marginBottom: SPACING.lg },
  sideCardWrapper: { flex: 1, maxWidth: SIDE_CARD_WIDTH },
  sideCard: { borderRadius: BORDER_RADIUS.xl, overflow: 'hidden', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 8 },
  sideCardGradient: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.md, alignItems: 'center', justifyContent: 'center', minHeight: 150 },
  sideCardIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255, 255, 255, 0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.25)' },
  sideCardTitle: { fontFamily: TYPOGRAPHY.fontFamily.bold, color: '#FFFFFF', textAlign: 'center' },
  sideCardSubtitle: { fontFamily: TYPOGRAPHY.fontFamily.regular, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', marginTop: 4 },
  progressButton: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background.card, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.xl, borderWidth: 2, borderColor: COLORS.primary[200], gap: SPACING.sm },
  progressText: { flex: 1, color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold },
  communityButton: { marginTop: SPACING.sm, backgroundColor: COLORS.secondary[50], borderColor: COLORS.secondary[200] },
  communityText: { color: COLORS.text.primary },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});
