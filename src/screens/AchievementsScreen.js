import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../styles/colors';
import { radii, typography } from '../styles/kidTheme';
import {
  getAllAchievements,
  getAchievementsByCategory,
  ACHIEVEMENT_CATEGORIES,
  CATEGORY_INFO
} from '../config/achievements';
import { api } from '../services/api';
import XPProgressBar from '../components/XPProgressBar';
import ProfileButton from '../components/ProfileButton';
import { PlayBeaconBannerAd } from '../components/ads';
import logger from '../utils/logger';

const AchievementCard = ({ achievement, userAchievement, userStats }) => {
  const progress = userAchievement?.progress || 0;
  const completed = userAchievement?.completed || false;

  // Map statKey to actual userStats field (handling snake_case from backend)
  const getStatValue = (statKey) => {
    if (!userStats) return 0;

    // Map camelCase to snake_case for backend compatibility
    const statKeyMap = {
      'totalGamesViewed': 'total_games_viewed',
      'totalGamesSaved': 'total_games_saved',
      'collectionsCreated': 'collections_created',
      'recommendationsUsed': 'recommendations_used',
      'dailyLoginStreak': 'daily_login_streak',
      'dailyLogin': 'daily_login_streak', // Special case for daily login achievement
    };

    // Try both the original key and the mapped snake_case version
    return userStats[statKey] || userStats[statKeyMap[statKey]] || 0;
  };

  // Get current progress from userStats if achievement is not yet completed
  const currentProgress = completed ? progress : getStatValue(achievement.statKey);

  // Calculate progress percentage
  const progressPercentage = Math.min(100, (currentProgress / achievement.threshold) * 100);

  return (
    <View style={[styles.achievementCard, completed && styles.achievementCardCompleted]}>
      <View style={styles.achievementHeader}>
        <Text style={[styles.achievementEmoji, !completed && styles.lockedEmoji]}>
          {achievement.emoji}
        </Text>
        <View style={styles.achievementInfo}>
          <Text style={[styles.achievementTitle, completed && styles.completedText]}>
            {achievement.title}
          </Text>
          <Text style={styles.achievementDescription}>{achievement.description}</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>{achievement.xpReward} XP</Text>
        </View>
      </View>

      {!completed && (
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${progressPercentage}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentProgress} / {achievement.threshold}
          </Text>
        </View>
      )}

      {completed && userAchievement?.completedAt && (
        <UnlockedDate date={userAchievement.completedAt} />
      )}
    </View>
  );
};

const UnlockedDate = ({ date }) => {
  const { t } = useTranslation();
  return (
    <Text style={styles.completedDate}>
      {t('achievements.unlocked')} {new Date(date).toLocaleDateString()}
    </Text>
  );
};

const CategorySection = ({ category, achievements, userAchievements, userStats, t }) => {
  const categoryInfo = CATEGORY_INFO[category];
  const categoryAchievements = getAchievementsByCategory(category);

  // Map category to translation key
  const getCategoryTitle = (cat) => {
    const categoryTitleMap = {
      [ACHIEVEMENT_CATEGORIES.DISCOVERY]: t('achievements.categoryDiscovery'),
      [ACHIEVEMENT_CATEGORIES.COLLECTIONS]: t('achievements.categoryCollections'),
      [ACHIEVEMENT_CATEGORIES.TASKS]: t('achievements.categoryTasks'),
      [ACHIEVEMENT_CATEGORIES.AI]: t('achievements.categoryAI'),
      [ACHIEVEMENT_CATEGORIES.ENGAGEMENT]: t('achievements.categoryEngagement'),
    };
    return categoryTitleMap[cat] || categoryInfo.title;
  };

  return (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
        <Text style={styles.categoryTitle}>{getCategoryTitle(category)}</Text>
      </View>

      {categoryAchievements.map((achievement) => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          userAchievement={userAchievements[achievement.id]}
          userStats={userStats}
        />
      ))}
    </View>
  );
};

export default function AchievementsScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [userAchievements, setUserAchievements] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user stats and achievements from backend
      const stats = await api.getUserStats();
      setUserStats(stats);

      // Fetch user achievements
      const achievements = await api.getUserAchievements();

      // Convert array to object for easier lookup
      const achievementsMap = {};
      achievements.forEach(ach => {
        achievementsMap[ach.achievementId] = ach;
      });
      setUserAchievements(achievementsMap);
    } catch (error) {
      logger.error('Failed to fetch achievements:', error);
      setError(t('achievements.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const completedCount = Object.values(userAchievements).filter(a => a.completed).length;
  const totalCount = getAllAchievements().length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{t('achievements.title')}</Text>
        <ProfileButton />
      </View>

      {/* XP Progress */}
      {userStats && (
        <View style={styles.xpSection}>
          <XPProgressBar currentXP={userStats.xp} showDetails={true} />
        </View>
      )}

      {/* Achievement Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('achievements.unlockedLabel')}</Text>
          <Text style={styles.summaryValue}>
            {completedCount} / {totalCount}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${(completedCount / totalCount) * 100}%` }
            ]}
          />
        </View>
      </View>

      {/* Achievement Categories */}
      <CategorySection
        category={ACHIEVEMENT_CATEGORIES.DISCOVERY}
        achievements={getAllAchievements()}
        userAchievements={userAchievements}
        userStats={userStats}
        t={t}
      />

      <CategorySection
        category={ACHIEVEMENT_CATEGORIES.COLLECTIONS}
        achievements={getAllAchievements()}
        userAchievements={userAchievements}
        userStats={userStats}
        t={t}
      />

      <CategorySection
        category={ACHIEVEMENT_CATEGORIES.ENGAGEMENT}
        achievements={getAllAchievements()}
        userAchievements={userAchievements}
        userStats={userStats}
        t={t}
      />

      <View style={styles.bottomPadding} />

      {/* Banner Ad at bottom */}
      <View style={styles.adContainer}>
        <PlayBeaconBannerAd />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  xpSection: {
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: colors.background.secondary,
    padding: 20,
    borderRadius: radii.s,
    marginBottom: 30,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accent.primary,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  achievementCard: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: radii.s,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  achievementCardCompleted: {
    borderColor: colors.accent.primary,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  lockedEmoji: {
    opacity: 0.3,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  completedText: {
    color: colors.accent.primary,
  },
  achievementDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  xpBadge: {
    backgroundColor: colors.background.tertiary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.xs,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent.tertiary,
  },
  progressSection: {
    marginTop: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'right',
  },
  completedDate: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
  adContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
});
