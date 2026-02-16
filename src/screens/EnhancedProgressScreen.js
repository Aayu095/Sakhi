import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../providers/AuthProvider';
import { EDUCATIONAL_MODULES, EDUCATIONAL_ACHIEVEMENTS, calculateLearningProgress } from '../services/educationalContent';
import GradientBackground from '../components/GradientBackground';
import ProgressRing from '../components/ProgressRing';
import AchievementBadge from '../components/AchievementBadge';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';

const { width } = Dimensions.get('window');

export default function EnhancedProgressScreen({ navigation }) {
  const { profile } = useAuth();
  const [userProgress, setUserProgress] = useState({
    modulesCompleted: [],
    lessonsCompleted: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    achievements: [],
    lessonProgress: {}
  });
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    // In real implementation, load from Firebase
    const mockProgress = {
      modulesCompleted: profile?.modulesCompleted || ['digital_basics'],
      lessonsCompleted: profile?.lessonsCompleted || 8,
      totalTimeSpent: profile?.totalTimeSpent || 3600000, // 1 hour in ms
      currentStreak: profile?.streak?.current || 5,
      achievements: profile?.achievements || ['first_lesson_complete', 'digital_literacy_master'],
      lessonProgress: profile?.lessonProgress || {}
    };
    setUserProgress(mockProgress);
  };

  const learningProgress = calculateLearningProgress(userProgress);
  const unlockedAchievements = EDUCATIONAL_ACHIEVEMENTS.filter(achievement =>
    userProgress.achievements.includes(achievement.id)
  );
  const availableAchievements = EDUCATIONAL_ACHIEVEMENTS.filter(achievement =>
    !userProgress.achievements.includes(achievement.id) && achievement.condition(userProgress)
  );

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    return `${hours}घ ${minutes}मि`;
  };

  const getModuleProgress = (moduleId) => {
    const module = EDUCATIONAL_MODULES.find(m => m.id === moduleId);
    if (!module) return 0;

    const completedLessons = Object.keys(userProgress.lessonProgress[moduleId] || {}).length;
    return (completedLessons / module.lessons.length) * 100;
  };

  const renderOverviewTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Overall Progress */}
      <View style={styles.overviewCard}>
        <Text style={styles.cardTitle}>समग्र प्रगति</Text>
        <View style={styles.progressOverview}>
          <ProgressRing
            progress={learningProgress.overallProgress}
            size={120}
            color={COLORS.primary[500]}
          >
            <Text style={styles.progressPercentage}>
              {Math.round(learningProgress.overallProgress)}%
            </Text>
            <Text style={styles.progressLabel}>पूरा</Text>
          </ProgressRing>

          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProgress.modulesCompleted.length}</Text>
              <Text style={styles.statLabel}>मॉड्यूल पूरे</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProgress.lessonsCompleted}</Text>
              <Text style={styles.statLabel}>पा��� पूरे</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProgress.currentStreak}</Text>
              <Text style={styles.statLabel}>दिन स्ट्रीक</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Learning Time */}
      <View style={styles.timeCard}>
        <Text style={styles.cardTitle}>सीखने का समय</Text>
        <View style={styles.timeStats}>
          <View style={styles.timeItem}>
            <Text style={styles.timeNumber}>{formatTime(userProgress.totalTimeSpent)}</Text>
            <Text style={styles.timeLabel}>कुल समय</Text>
          </View>
          <View style={styles.timeItem}>
            <Text style={styles.timeNumber}>
              {Math.round(userProgress.totalTimeSpent / userProgress.lessonsCompleted / 60000)}मि
            </Text>
            <Text style={styles.timeLabel}>औसत प्रति पाठ</Text>
          </View>
        </View>
      </View>

      {/* Recent Achievements */}
      {availableAchievements.length > 0 && (
        <View style={styles.achievementsCard}>
          <Text style={styles.cardTitle}>नए बैज अनलॉक हुए!</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {availableAchievements.map((achievement, index) => (
              <AchievementBadge
                key={achievement.id}
                title={achievement.title}
                icon={achievement.icon}
                description={achievement.description}
                rarity="rare"
                isUnlocked={true}
                delay={index * 100}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Next Recommendation */}
      {learningProgress.nextRecommendation && (
        <View style={styles.recommendationCard}>
          <Text style={styles.cardTitle}>अगला सुझाव</Text>
          <View style={styles.recommendationContent}>
            <MaterialCommunityIcons
              name={learningProgress.nextRecommendation.icon}
              size={48}
              color={COLORS.primary[500]}
            />
            <View style={styles.recommendationInfo}>
              <Text style={styles.recommendationTitle}>
                {learningProgress.nextRecommendation.title}
              </Text>
              <Text style={styles.recommendationDesc}>
                {learningProgress.nextRecommendation.description}
              </Text>
            </View>
            <Pressable
              style={styles.startButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.startButtonText}>शुरू करें</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderModulesTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {EDUCATIONAL_MODULES.map((module, index) => {
        const isCompleted = userProgress.modulesCompleted.includes(module.id);
        const progress = getModuleProgress(module.id);
        const isLocked = module.prerequisites.some(prereq =>
          !userProgress.modulesCompleted.includes(prereq)
        );

        return (
          <View key={module.id}
            delay={index * 100}
            style={styles.moduleCard}
          >
            <View style={styles.moduleHeader}>
              <MaterialCommunityIcons
                name={isLocked ? 'lock' : module.icon}
                size={32}
                color={isLocked ? COLORS.text.disabled : COLORS.primary[500]}
              />
              <View style={styles.moduleInfo}>
                <Text style={[styles.moduleTitle, isLocked && styles.lockedText]}>
                  {module.title}
                </Text>
                <Text style={[styles.moduleSubtitle, isLocked && styles.lockedText]}>
                  {module.subtitle}
                </Text>
              </View>
              <View style={styles.moduleStatus}>
                {isCompleted && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.status.success} style={{ marginRight: 4 }} />
                    <Text style={styles.completedBadge}>पूरा</Text>
                  </View>
                )}
                {isLocked && <Text style={styles.lockedBadge}>🔒 बंद</Text>}
              </View>
            </View>

            <View style={styles.moduleProgress}>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>

            <View style={styles.moduleDetails}>
              <Text style={styles.moduleDetail}>
                <MaterialCommunityIcons name="book-open-variant" size={14} color={COLORS.text.secondary} /> {module.lessons.length} पाठ
              </Text>
              <Text style={styles.moduleDetail}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.text.secondary} style={{ marginRight: 4 }} />
                  <Text>{module.estimatedTime}</Text>
                </View>
              </Text>
              <Text style={styles.moduleDetail}>
                📊 {module.difficulty === 'beginner' ? 'आसान' :
                  module.difficulty === 'intermediate' ? 'मध्यम' : 'कठिन'}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  const renderAchievementsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Unlocked Achievements */}
      <View style={styles.achievementSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <MaterialCommunityIcons name="trophy" size={24} color={COLORS.primary[500]} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>अर्जित बैज ({unlockedAchievements.length})</Text>
        </View>
        <View style={styles.achievementGrid}>
          {unlockedAchievements.map((achievement, index) => (
            <AchievementBadge
              key={achievement.id}
              title={achievement.title}
              icon={achievement.icon}
              description={achievement.description}
              rarity="rare"
              isUnlocked={true}
              delay={index * 50}
            />
          ))}
        </View>
      </View>

      {/* Locked Achievements */}
      <View style={styles.achievementSection}>
        <Text style={styles.sectionTitle}>🔒 आने वाले बैज</Text>
        <View style={styles.achievementGrid}>
          {EDUCATIONAL_ACHIEVEMENTS
            .filter(achievement => !userProgress.achievements.includes(achievement.id))
            .map((achievement, index) => (
              <AchievementBadge
                key={achievement.id}
                title={achievement.title}
                icon="🔒"
                description={achievement.description}
                rarity="common"
                isUnlocked={false}
                delay={index * 50}
              />
            ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>आपकी प्रगति</Text>
          <Text style={styles.headerSubtitle}>Your Learning Progress</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
            onPress={() => setSelectedTab('overview')}
          >
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
              समग्र
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, selectedTab === 'modules' && styles.activeTab]}
            onPress={() => setSelectedTab('modules')}
          >
            <Text style={[styles.tabText, selectedTab === 'modules' && styles.activeTabText]}>
              मॉड्यूल
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, selectedTab === 'achievements' && styles.activeTab]}
            onPress={() => setSelectedTab('achievements')}
          >
            <Text style={[styles.tabText, selectedTab === 'achievements' && styles.activeTabText]}>
              बैज
            </Text>
          </Pressable>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {selectedTab === 'overview' && renderOverviewTab()}
          {selectedTab === 'modules' && renderModulesTab()}
          {selectedTab === 'achievements' && renderAchievementsTab()}
        </View>
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
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  activeTab: {
    backgroundColor: COLORS.primary[500],
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
  },
  // Overview Tab Styles
  overviewCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  progressOverview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[500],
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  progressStats: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  timeCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeItem: {
    alignItems: 'center',
  },
  timeNumber: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[500],
    marginBottom: SPACING.xs,
  },
  timeLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  achievementsCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recommendationCard: {
    backgroundColor: COLORS.primary[50],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary[200],
  },
  recommendationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  recommendationDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  startButton: {
    backgroundColor: COLORS.primary[500],
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  startButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  // Modules Tab Styles
  moduleCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  moduleIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
    width: 40,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  moduleSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  lockedText: {
    color: COLORS.neutral.gray[500],
  },
  moduleStatus: {
    alignItems: 'flex-end',
  },
  completedBadge: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.status.success,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  lockedBadge: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray[500],
  },
  moduleProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.neutral.gray[200],
    borderRadius: 4,
    marginRight: SPACING.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary[500],
    borderRadius: 4,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    minWidth: 40,
  },
  moduleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moduleDetail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  // Achievements Tab Styles
  achievementSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});