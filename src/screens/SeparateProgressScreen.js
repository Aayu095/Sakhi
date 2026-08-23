import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../providers/AuthProvider';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';
import GradientBackground from '../components/GradientBackground';
import ProgressRing from '../components/ProgressRing';
import { VIDEO_LEARNING_MODULES } from './VideoLearningScreen';
import { VOICE_TOPICS } from '../services/awsVoiceAssistant';

const { width } = Dimensions.get('window');

// Badge/Sticker system for achievements
const LEARNING_BADGES = {
  // Video Learning Badges
  video_first_complete: {
    id: 'video_first_complete',
    title: 'पहला वीडियो पूरा',
    icon: 'video-vintage',
    description: 'आपने अपना पहला वीडियो पूरा देखा!',
    color: ['#10B981', '#34D399'],
    category: 'video'
  },
  video_health_expert: {
    id: 'video_health_expert',
    title: 'स्वास्थ्य विशेषज्ञ',
    icon: 'hospital-box',
    description: 'स्वास्थ्य के सभी वीडियो पूरे किए!',
    color: ['#EC4899', '#F472B6'],
    category: 'video'
  },
  video_digital_guru: {
    id: 'video_digital_guru',
    title: 'डिजिटल गुरु',
    icon: 'cellphone-check',
    description: 'डिजिटल साक्षरता के सभी वीडियो पूरे!',
    color: ['#3B82F6', '#60A5FA'],
    category: 'video'
  },
  video_all_modules: {
    id: 'video_all_modules',
    title: 'वीडियो चैंपियन',
    icon: 'crown',
    description: 'सभी वीडियो मॉड्यूल पूरे किए!',
    color: ['#F59E0B', '#FBBF24'],
    category: 'video'
  },

  // Voice Call Badges
  voice_first_call: {
    id: 'voice_first_call',
    title: 'पहली बातचीत',
    icon: 'phone',
    description: 'सखी से पहली बार बात की!',
    color: ['#8B5CF6', '#A78BFA'],
    category: 'voice'
  },
  voice_health_advisor: {
    id: 'voice_health_advisor',
    title: 'स्वास्थ्य सलाहकार',
    icon: 'stethoscope',
    description: 'स्वास्थ्य पर 10 बार बात की!',
    color: ['#EF4444', '#F87171'],
    category: 'voice'
  },
  voice_digital_learner: {
    id: 'voice_digital_learner',
    title: 'डिजिटल शिक्षार्थी',
    icon: 'laptop',
    description: 'डिजिटल चीजों पर 5 बार बात की!',
    color: ['#06B6D4', '#67E8F9'],
    category: 'voice'
  },
  voice_conversation_master: {
    id: 'voice_conversation_master',
    title: 'बातचीत की मास्टर',
    icon: 'account-voice',
    description: '50 से ज्यादा बातचीत की!',
    color: ['#84CC16', '#A3E635'],
    category: 'voice'
  },
  voice_time_champion: {
    id: 'voice_time_champion',
    title: 'समय चैंपियन',
    icon: 'clock-outline',
    description: '2 घंटे से ज्यादा बात की!',
    color: ['#F97316', '#FB923C'],
    category: 'voice'
  }
};

export default function SeparateProgressScreen({ navigation, route }) {
  const { profile } = useAuth();
  const [selectedTab, setSelectedTab] = useState(route?.params?.initialTab === 'voice' ? 'voice' : 'video');
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [videoProgress, setVideoProgress] = useState({});
  const [voiceProgress, setVoiceProgress] = useState({});
  const [earnedBadges, setEarnedBadges] = useState([]);
  const scrollViewRef = useRef(null);

  const switchTab = (tab) => {
    setSelectedTab(tab);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  useEffect(() => {
    const requestedTab = route?.params?.initialTab;
    if (requestedTab === 'video' || requestedTab === 'voice') {
      setSelectedTab(requestedTab);
    }
  }, [route?.params?.initialTab]);

  useEffect(() => {
    loadProgress();
  }, [profile]);

  const loadProgress = () => {
    // Load video learning progress
    const videoData = profile?.videoModuleProgress || {};
    setVideoProgress(videoData);

    // Load voice call progress
    const voiceData = profile?.voiceCallProgress || {};
    setVoiceProgress(voiceData);

    // Calculate earned badges
    calculateEarnedBadges(videoData, voiceData);
  };

  const calculateEarnedBadges = (videoData, voiceData) => {
    const badges = [];

    // Video badges
    const completedVideoModules = Object.values(videoData).filter(module => module.completed).length;
    const totalVideoWatched = Object.values(videoData).reduce((sum, module) => sum + (module.watchedVideos?.length || 0), 0);

    if (totalVideoWatched >= 1) badges.push('video_first_complete');
    if (videoData.menstrual_health?.completed && videoData.pregnancy_care?.completed) badges.push('video_health_expert');
    if (videoData.digital_payments?.completed) badges.push('video_digital_guru');
    if (completedVideoModules >= VIDEO_LEARNING_MODULES.length) badges.push('video_all_modules');

    // Voice badges
    const totalVoiceCalls = Object.values(voiceData).reduce((sum, topic) => sum + (topic.totalCalls || 0), 0);
    const totalVoiceTime = Object.values(voiceData).reduce((sum, topic) => sum + (topic.totalDuration || 0), 0);
    const healthCalls = (voiceData.menstrual_health?.totalCalls || 0) + (voiceData.pregnancy_care?.totalCalls || 0) + (voiceData.general_health?.totalCalls || 0);
    const digitalCalls = voiceData.digital_literacy?.totalCalls || 0;

    if (totalVoiceCalls >= 1) badges.push('voice_first_call');
    if (healthCalls >= 10) badges.push('voice_health_advisor');
    if (digitalCalls >= 5) badges.push('voice_digital_learner');
    if (totalVoiceCalls >= 50) badges.push('voice_conversation_master');
    if (totalVoiceTime >= 7200) badges.push('voice_time_champion'); // 2 hours

    setEarnedBadges(badges);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} घंटे ${minutes} मिनट`;
    }
    return `${minutes} मिनट`;
  };

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      <Pressable
        style={[styles.tab, selectedTab === 'video' && styles.activeTab]}
        onPress={() => switchTab('video')}
      >
        <MaterialCommunityIcons
          name="video-vintage"
          size={24}
          color={selectedTab === 'video' ? COLORS.neutral.white : COLORS.text.primary}
        />
        <Text style={[styles.tabText, selectedTab === 'video' && styles.activeTabText]}>
          वीडियो सीखना
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tab, selectedTab === 'voice' && styles.activeTab]}
        onPress={() => switchTab('voice')}
      >
        <MaterialCommunityIcons
          name="phone"
          size={24}
          color={selectedTab === 'voice' ? COLORS.neutral.white : COLORS.text.primary}
        />
        <Text style={[styles.tabText, selectedTab === 'voice' && styles.activeTabText]}>
          सखी से बात
        </Text>
      </Pressable>
    </View>
  );

  const renderVideoProgress = () => {
    const totalModules = VIDEO_LEARNING_MODULES.length;
    const completedModules = Object.values(videoProgress).filter(module => module.completed).length;
    const totalVideosWatched = Object.values(videoProgress).reduce((sum, module) => sum + (module.watchedVideos?.length || 0), 0);
    const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

    return (
      <View style={styles.progressContent}>
        {/* Overall Progress */}
        {totalVideosWatched === 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="पहला वीडियो पाठ चुनें"
            onPress={() => navigation.navigate('VideoLearningCategories')}
            style={[styles.emptyStateCard, { borderColor: COLORS.primary[200], backgroundColor: COLORS.primary[50] }]}
          >
            <View style={[styles.emptyStateIcon, { backgroundColor: COLORS.primary[100] }]}><MaterialCommunityIcons name="play-circle-outline" size={32} color={COLORS.primary[800]} /></View>
            <View style={styles.emptyStateCopy}>
              <Text style={styles.emptyStateTitle}>पहला छोटा वीडियो चुनें</Text>
              <Text style={styles.emptyStateText}>वीडियो देखकर भी धीरे-धीरे सीख सकती हैं।</Text>
            </View>
            <MaterialCommunityIcons name="arrow-right" size={22} color={COLORS.primary[800]} />
          </Pressable>
        )}
        <View style={styles.overallProgressCard}>
          <View style={styles.progressHeader}>
            <ProgressRing
              progress={overallProgress}
              size={70}
              color={COLORS.primary[500]}
            >
              <Text style={styles.progressNumber}>
                {Math.round(overallProgress)}%
              </Text>
            </ProgressRing>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>वीडियो सीखने की प्रगति</Text>
              <Text style={styles.progressDesc}>
                पूरे मॉड्यूल: {completedModules}/{totalModules}
              </Text>
              <Text style={styles.progressDesc}>
                वीडियो देखे: {totalVideosWatched}
              </Text>
            </View>
          </View>
        </View>

        {/* Module Progress */}
        <Text style={styles.sectionTitle}>मॉड्यूल की प्रगति</Text>
        {VIDEO_LEARNING_MODULES.map((module, index) => {
          const moduleProgress = videoProgress[module.id] || { watchedVideos: [], completed: false };
          const watchedCount = moduleProgress.watchedVideos.length;
          const totalVideos = module.videos.length;
          const modulePercentage = totalVideos > 0 ? (watchedCount / totalVideos) * 100 : 0;

          return (
            <View key={module.id}
              style={styles.moduleProgressCard}
            >
              <LinearGradient
                colors={module.color}
                style={styles.moduleGradient}
              >
                <View style={styles.moduleHeader}>
                  <MaterialCommunityIcons name={module.icon} size={32} color={COLORS.primary[500]} />
                  <View style={styles.moduleInfo}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={styles.moduleSubtitle}>
                      {watchedCount}/{totalVideos} वीडियो देखे
                    </Text>
                  </View>
                  <View style={styles.moduleStatus}>
                    {moduleProgress.completed && <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />}
                    <Text style={styles.modulePercentage}>{Math.round(modulePercentage)}%</Text>
                  </View>
                </View>
                <View style={styles.moduleProgressBar}>
                  <View style={[
                    styles.moduleProgressFill,
                    { width: `${modulePercentage}%` }
                  ]}
                  />
                </View>
              </LinearGradient>
            </View>
          );
        })}
      </View>
    );
  };

  const renderVoiceProgress = () => {
    const totalCalls = Object.values(voiceProgress).reduce((sum, topic) => sum + (topic.totalCalls || 0), 0);
    const totalDuration = Object.values(voiceProgress).reduce((sum, topic) => sum + (topic.totalDuration || 0), 0);
    const avgCallDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;

    const topicTitles = {
      [VOICE_TOPICS.MENSTRUAL_HEALTH]: 'महावारी की जानकारी',
      [VOICE_TOPICS.PREGNANCY_CARE]: 'गर्भावस्था की देखभाल',
      [VOICE_TOPICS.DIGITAL_LITERACY]: 'डिजिटल साक्षरता',
      [VOICE_TOPICS.FINANCIAL_LITERACY]: 'वित्तीय साक्षरता',
      [VOICE_TOPICS.GENERAL_HEALTH]: 'सामान्य स्वास्थ्य',
      [VOICE_TOPICS.LEGAL_RIGHTS]: 'महिला अधिकार'
    };

    const getTopicIcon = (topicId) => {
      switch (topicId) {
        case VOICE_TOPICS.MENSTRUAL_HEALTH: return 'water-circle';
        case VOICE_TOPICS.PREGNANCY_CARE: return 'human-pregnant';
        case VOICE_TOPICS.DIGITAL_LITERACY: return 'cellphone-check';
        case VOICE_TOPICS.FINANCIAL_LITERACY: return 'bank';
        case VOICE_TOPICS.LEGAL_RIGHTS: return 'scale-balance';
        case VOICE_TOPICS.GENERAL_HEALTH:
        default: return 'hospital-box';
      }
    };

    return (
      <View style={styles.progressContent}>
        {/* Overall Voice Stats */}
        <View style={styles.overallProgressCard}>
          {totalCalls === 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="होम पर जाकर सखी से बोलकर पूछें"
              onPress={() => navigation.navigate('Home')}
              style={styles.voiceEmptyAction}
            >
              <View style={[styles.emptyStateIcon, { backgroundColor: COLORS.accent[100] }]}><MaterialCommunityIcons name="microphone-outline" size={32} color={COLORS.accent[800]} /></View>
              <Text style={[styles.progressTitle, { marginTop: SPACING.sm, textAlign: 'center' }]}>सखी से पहली बार बात करें</Text>
              <Text style={[styles.progressDesc, { textAlign: 'center', marginTop: 2 }]}>जो समझ न आए, बस बोलकर पूछें।</Text>
              <View style={styles.voiceEmptyButton}><Text style={styles.voiceEmptyButtonText}>सखी से बोलकर पूछें</Text><MaterialCommunityIcons name="arrow-right" size={19} color="#FFFFFF" /></View>
            </Pressable>
          ) : (
            <View style={styles.voiceStatsContainer}>
              <View style={styles.voiceStat}>
                <Text style={styles.voiceStatNumber}>{totalCalls}</Text>
                <Text style={styles.voiceStatLabel}>कुल बातचीत</Text>
              </View>
              <View style={styles.voiceStat}>
                <Text style={styles.voiceStatNumber}>{formatDuration(totalDuration)}</Text>
                <Text style={styles.voiceStatLabel}>कुल समय</Text>
              </View>
              <View style={styles.voiceStat}>
                <Text style={styles.voiceStatNumber}>{formatDuration(avgCallDuration)}</Text>
                <Text style={styles.voiceStatLabel}>औसत समय</Text>
              </View>
            </View>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('OtpSafetyLesson', { restart: profile?.guidedLessonProgress?.otp_safety_v1?.status === 'completed' })}
          style={[styles.overallProgressCard, { marginTop: SPACING.md, borderWidth: 1, borderColor: '#D8C9F4', backgroundColor: '#FAF7FF' }]}
        >
          <View style={styles.progressHeader}>
            <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#EEE6FF', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons
                name={profile?.guidedLessonProgress?.otp_safety_v1?.status === 'completed' ? 'shield-check' : 'shield-lock-outline'}
                size={34}
                color={COLORS.accent[700]}
              />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>सुरक्षित OTP पाठ</Text>
              <Text style={styles.progressDesc}>
                {profile?.guidedLessonProgress?.otp_safety_v1?.status === 'completed'
                  ? 'पूरा हुआ — OTP और UPI PIN कभी साझा न करें'
                  : profile?.guidedLessonProgress?.otp_safety_v1?.status === 'in_progress'
                    ? 'अधूरा है — यहीं से फिर शुरू करें'
                    : '2 मिनट का बोलकर सीखने वाला सुरक्षा पाठ'}
              </Text>
              <Text style={[styles.progressDesc, { color: COLORS.accent[700], fontFamily: TYPOGRAPHY.fontFamily.bold, marginTop: 4 }]}>
                {profile?.guidedLessonProgress?.otp_safety_v1?.status === 'completed' ? 'दोहराएं' : profile?.guidedLessonProgress?.otp_safety_v1?.status === 'in_progress' ? 'जारी रखें' : 'पाठ शुरू करें'}
              </Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('FakeLinkSafetyLesson', { restart: profile?.guidedLessonProgress?.fake_link_safety_v1?.status === 'completed' })}
          style={[styles.overallProgressCard, { marginTop: SPACING.sm, borderWidth: 1, borderColor: '#9EDFD3', backgroundColor: '#F1FCF9' }]}
        >
          <View style={styles.progressHeader}>
            <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#DDF7F1', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons
                name={profile?.guidedLessonProgress?.fake_link_safety_v1?.status === 'completed' ? 'shield-check' : 'link-variant-off'}
                size={34}
                color="#0F766E"
              />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>नकली लिंक सुरक्षा पाठ</Text>
              <Text style={styles.progressDesc}>
                {profile?.guidedLessonProgress?.fake_link_safety_v1?.status === 'completed'
                  ? 'पूरा हुआ — suspicious लिंक खोलने से पहले रुकें'
                  : profile?.guidedLessonProgress?.fake_link_safety_v1?.status === 'in_progress'
                    ? 'अधूरा है — यहीं से फिर शुरू करें'
                    : 'WhatsApp और SMS fraud समझने का 2 मिनट पाठ'}
              </Text>
              <Text style={[styles.progressDesc, { color: '#0F766E', fontFamily: TYPOGRAPHY.fontFamily.bold, marginTop: 4 }]}>
                {profile?.guidedLessonProgress?.fake_link_safety_v1?.status === 'completed' ? 'दोहराएं' : profile?.guidedLessonProgress?.fake_link_safety_v1?.status === 'in_progress' ? 'जारी रखें' : 'पाठ शुरू करें'}
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Topic-wise Progress */}
        <Text style={styles.sectionTitle}>विषयवार प्रगति</Text>
        {Object.entries(VOICE_TOPICS).map(([key, topicId], index) => {
          const topicProgress = voiceProgress[topicId] || { totalCalls: 0, totalDuration: 0, conversations: [] };
          const recentCalls = topicProgress.conversations?.slice(-3) || [];

          return (
            <View key={topicId}
              style={styles.topicProgressCard}
            >
              <View style={styles.topicHeader}>
                <MaterialCommunityIcons
                  name={getTopicIcon(topicId)}
                  size={28}
                  color={COLORS.primary[500]}
                />
                <View style={styles.topicInfo}>
                  <Text style={styles.topicTitle}>{topicTitles[topicId]}</Text>
                  <Text style={styles.topicStats}>
                    {topicProgress.totalCalls} बातचीत • {formatDuration(topicProgress.totalDuration)}
                  </Text>
                </View>
              </View>

              {recentCalls.length > 0 && (
                <View style={styles.recentCallsContainer}>
                  <MaterialCommunityIcons name="history" size={18} color={COLORS.text.tertiary} />
                  <Text style={styles.recentCallsTitle}>
                    हाल की {recentCalls.length} बातचीत दर्ज है
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderBadges = () => {
    const categoryBadges = Object.values(LEARNING_BADGES).filter(badge =>
      selectedTab === 'video' ? badge.category === 'video' : badge.category === 'voice'
    );

    return (
      <View style={styles.badgesSection}>
        <Text style={styles.sectionTitle}>
          {selectedTab === 'video' ? 'वीडियो बैज' : 'बातचीत बैज'}
        </Text>
        <View style={styles.badgesGrid}>
          {categoryBadges.map((badge, index) => {
            const isEarned = earnedBadges.includes(badge.id);
            return (
              <View key={badge.id}
              >
                <Pressable
                  style={[styles.badgeCard, !isEarned && styles.lockedBadge]}
                  onPress={() => {
                    setSelectedBadge(badge);
                    setShowBadgeModal(true);
                  }}
                >
                  <LinearGradient
                    colors={isEarned ? badge.color : ['#E5E7EB', '#D1D5DB']}
                    style={styles.badgeGradient}
                  >
                    <MaterialCommunityIcons
                      name={isEarned ? badge.icon : 'lock'}
                      size={32}
                      color="#FFFFFF"
                    />
                    <Text style={[styles.badgeTitle, !isEarned && styles.lockedBadgeText]}>
                      {badge.title}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderBadgeModal = () => (
    <Modal
      visible={showBadgeModal}
      animationType="fade"
      transparent
      onRequestClose={() => setShowBadgeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.badgeModal}>
          {selectedBadge && (
            <>
              <LinearGradient
                colors={earnedBadges.includes(selectedBadge.id) ? selectedBadge.color : ['#E5E7EB', '#D1D5DB']}
                style={styles.modalBadgeContainer}
              >
                <MaterialCommunityIcons
                  name={earnedBadges.includes(selectedBadge.id) ? selectedBadge.icon : 'lock'}
                  size={40}
                  color="#FFFFFF"
                />
              </LinearGradient>
              <Text style={styles.modalBadgeTitle}>{selectedBadge.title}</Text>
              <Text style={styles.modalBadgeDescription}>{selectedBadge.description}</Text>
              <Text style={styles.modalBadgeStatus}>
                {earnedBadges.includes(selectedBadge.id) ? 'अर्जित किया गया!' : 'अभी तक नहीं मिला'}
              </Text>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowBadgeModal(false)}
              >
                <Text style={styles.modalCloseText}>बंद करें</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>मेरी सीखने की प्रगति</Text>
          <Text style={styles.headerSubtitle}>छोटी शुरुआत भी बड़ी बात है।</Text>
        </View>

        {/* Tab Selector */}
        {renderTabSelector()}

        {/* Progress Content - key forces full re-render on tab switch */}
        <View key={selectedTab}>
          {selectedTab === 'video' ? renderVideoProgress() : renderVoiceProgress()}

          {/* Badges Section */}
          {renderBadges()}
        </View>
      </ScrollView>

      {renderBadgeModal()}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary[500],
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  activeTabIcon: {
    // No additional styles needed
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
  },
  activeTabText: {
    color: COLORS.neutral.white,
  },
  progressContent: {
    marginBottom: SPACING.lg,
  },
  emptyStateCard: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  emptyStateIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  emptyStateCopy: { flex: 1 },
  emptyStateTitle: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.sm },
  emptyStateText: { color: COLORS.text.secondary, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.fontSize.xs, lineHeight: 21, marginTop: 2 },
  voiceEmptyAction: { alignItems: 'center', paddingVertical: SPACING.md },
  voiceEmptyButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.accent[700], borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, marginTop: SPACING.md },
  voiceEmptyButtonText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.fontSize.sm },
  overallProgressCard: {
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
  },
  progressNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[500],
  },
  progressInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  progressTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  progressDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  voiceStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  voiceStat: {
    alignItems: 'center',
  },
  voiceStatNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[500],
    marginBottom: SPACING.xs,
  },
  voiceStatLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  moduleProgressCard: {
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  moduleGradient: {
    padding: SPACING.md,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  moduleIcon: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
  },
  moduleSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  moduleStatus: {
    alignItems: 'center',
  },
  completedBadge: {
    fontSize: 18,
    marginBottom: SPACING.xs,
  },
  modulePercentage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
  },
  moduleProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  moduleProgressFill: {
    height: '100%',
    backgroundColor: COLORS.neutral.white,
    borderRadius: 2,
  },
  topicProgressCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  topicIcon: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  topicStats: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  recentCallsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  recentCallsTitle: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  recentCall: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  recentCallText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  recentCallDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  badgesSection: {
    marginBottom: SPACING.lg,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  badgeCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  lockedBadge: {
    opacity: 0.7,
  },
  badgeGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  lockedBadgeIcon: {
    opacity: 0.5,
  },
  badgeTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
    textAlign: 'center',
  },
  lockedBadgeText: {
    color: COLORS.neutral.gray[600],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  badgeModal: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  modalBadgeContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  modalBadgeIcon: {
    fontSize: 35,
  },
  modalBadgeTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalBadgeDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  modalBadgeStatus: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary[600],
    marginBottom: SPACING.lg,
  },
  modalCloseButton: {
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: COLORS.primary[800],
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
  },
  modalCloseText: {
    color: COLORS.neutral.white,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.base,
  },
});