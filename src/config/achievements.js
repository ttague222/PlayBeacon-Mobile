// Achievement categories
export const ACHIEVEMENT_CATEGORIES = {
  DISCOVERY: 'discovery',
  COLLECTIONS: 'collections',
  AI: 'ai',
  ENGAGEMENT: 'engagement',
};

// Achievement definitions
export const ACHIEVEMENTS = {
  // Discovery Achievements
  GAMES_VIEWED_10: {
    id: 'games_viewed_10',
    category: ACHIEVEMENT_CATEGORIES.DISCOVERY,
    title: 'Explorer',
    description: 'View 10 games',
    emoji: '🔍',
    threshold: 10,
    xpReward: 50,
    statKey: 'totalGamesViewed',
  },
  GAMES_VIEWED_50: {
    id: 'games_viewed_50',
    category: ACHIEVEMENT_CATEGORIES.DISCOVERY,
    title: 'Adventurer',
    description: 'View 50 games',
    emoji: '🗺️',
    threshold: 50,
    xpReward: 100,
    statKey: 'totalGamesViewed',
  },
  GAMES_VIEWED_100: {
    id: 'games_viewed_100',
    category: ACHIEVEMENT_CATEGORIES.DISCOVERY,
    title: 'Master Explorer',
    description: 'View 100 games',
    emoji: '🌟',
    threshold: 100,
    xpReward: 200,
    statKey: 'totalGamesViewed',
  },

  // Collections Achievements
  GAMES_SAVED_1: {
    id: 'games_saved_1',
    category: ACHIEVEMENT_CATEGORIES.COLLECTIONS,
    title: 'First Save',
    description: 'Save your first game',
    emoji: '⭐',
    threshold: 1,
    xpReward: 25,
    statKey: 'totalGamesSaved',
  },
  GAMES_SAVED_10: {
    id: 'games_saved_10',
    category: ACHIEVEMENT_CATEGORIES.COLLECTIONS,
    title: 'Collector',
    description: 'Save 10 games',
    emoji: '📚',
    threshold: 10,
    xpReward: 75,
    statKey: 'totalGamesSaved',
  },
  GAMES_SAVED_50: {
    id: 'games_saved_50',
    category: ACHIEVEMENT_CATEGORIES.COLLECTIONS,
    title: 'Curator',
    description: 'Save 50 games',
    emoji: '💎',
    threshold: 50,
    xpReward: 150,
    statKey: 'totalGamesSaved',
  },
  FIRST_COLLECTION: {
    id: 'first_collection',
    category: ACHIEVEMENT_CATEGORIES.COLLECTIONS,
    title: 'Organizer',
    description: 'Create your first collection',
    emoji: '📁',
    threshold: 1,
    xpReward: 50,
    statKey: 'collectionsCreated',
  },

  // Engagement Achievements
  DAILY_LOGIN: {
    id: 'daily_login',
    category: ACHIEVEMENT_CATEGORIES.ENGAGEMENT,
    title: 'Daily Player',
    description: 'Log in today',
    emoji: '📅',
    threshold: 1,
    xpReward: 20,
    statKey: 'dailyLogin',
    isRepeatable: true,
  },
  STREAK_3_DAYS: {
    id: 'streak_3_days',
    category: ACHIEVEMENT_CATEGORIES.ENGAGEMENT,
    title: 'On Fire',
    description: 'Log in for 3 days in a row',
    emoji: '🔥',
    threshold: 3,
    xpReward: 75,
    statKey: 'dailyLoginStreak',
  },
  STREAK_7_DAYS: {
    id: 'streak_7_days',
    category: ACHIEVEMENT_CATEGORIES.ENGAGEMENT,
    title: 'Dedicated',
    description: 'Log in for 7 days in a row',
    emoji: '🏆',
    threshold: 7,
    xpReward: 200,
    statKey: 'dailyLoginStreak',
  },
};

// Get all achievements as an array
export const getAllAchievements = () => Object.values(ACHIEVEMENTS);

// Get achievements by category
export const getAchievementsByCategory = (category) => {
  return getAllAchievements().filter(achievement => achievement.category === category);
};

// Category metadata for UI
export const CATEGORY_INFO = {
  [ACHIEVEMENT_CATEGORIES.DISCOVERY]: {
    title: 'Discovery',
    emoji: '🔍',
    color: '#3B82F6',
  },
  [ACHIEVEMENT_CATEGORIES.COLLECTIONS]: {
    title: 'Collections',
    emoji: '📚',
    color: '#10B981',
  },
  [ACHIEVEMENT_CATEGORIES.AI]: {
    title: 'AI Powered',
    emoji: '🤖',
    color: '#8B5CF6',
  },
  [ACHIEVEMENT_CATEGORIES.ENGAGEMENT]: {
    title: 'Engagement',
    emoji: '🔥',
    color: '#F59E0B',
  },
};
