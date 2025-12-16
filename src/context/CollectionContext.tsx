/**
 * Collection Context Provider
 *
 * Manages badges, animal collectables, and progress tracking.
 * Provides event-based badge triggering system.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BadgeDefinition,
  AnimalDefinition,
  BadgeProgress,
  AnimalProgress,
  CollectionProgress,
  CollectionStats,
  BadgeEventType,
  UnlockEvent,
} from '../types/badges';
import badgesData from '../data/badges.json';
import animalsData from '../data/animals.json';
import SoundManager from '../services/SoundManager';
import logger from '../utils/logger';

// Storage key
const COLLECTION_STORAGE_KEY = '@playbeacon_collection_progress';

// Type the imported data
const BADGES: BadgeDefinition[] = badgesData.badges as BadgeDefinition[];
const ANIMALS: AnimalDefinition[] = animalsData.animals as AnimalDefinition[];

// Create lookup maps
const BADGES_BY_ID: Record<string, BadgeDefinition> = {};
const ANIMALS_BY_ID: Record<string, AnimalDefinition> = {};
const ANIMALS_BY_BADGE: Record<string, AnimalDefinition> = {};

BADGES.forEach(badge => {
  BADGES_BY_ID[badge.id] = badge;
});

ANIMALS.forEach(animal => {
  ANIMALS_BY_ID[animal.id] = animal;
  ANIMALS_BY_BADGE[animal.badgeId] = animal;
});

// Event to stat key mapping
const EVENT_TO_STAT: Record<BadgeEventType, keyof CollectionStats> = {
  VIEW_GAME: 'gamesViewed',
  ADD_TO_WISHLIST: 'gamesWishlisted',
  REMOVE_FROM_WISHLIST: 'gamesWishlisted', // Special handling (decrements)
  SWIPE_DISCOVERY: 'gamesSwiped',
  BEAR_INTERACTION: 'bearInteractions',
  DAILY_LOGIN: 'dailyLogins',
  CREATE_COLLECTION: 'collectionsCreated',
  TAP_RECOMMENDATION: 'recommendationsTapped',
  COMPLETE_TUTORIAL: 'tutorialsCompleted',
  SHARE_GAME: 'gamesShared',
  FIRST_FAVORITE: 'gamesWishlisted',
  EXPLORE_CATEGORY: 'categoriesExplored',
  COMPLETE_TASK: 'tasksCompleted',
  OPEN_MYSTERY_BOX: 'mysteryBoxOpened',
};

// Default stats
const DEFAULT_STATS: CollectionStats = {
  gamesViewed: 0,
  gamesWishlisted: 0,
  gamesSwiped: 0,
  bearInteractions: 0,
  dailyLogins: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastLoginDate: '',
  collectionsCreated: 0,
  recommendationsTapped: 0,
  totalPlayTime: 0,
  tasksCompleted: 0,
  mysteryBoxOpened: 0,
  tutorialsCompleted: 0,
  gamesShared: 0,
  categoriesExplored: 0,
};

// Default progress
const getDefaultProgress = (): CollectionProgress => ({
  badges: {},
  animals: {},
  stats: { ...DEFAULT_STATS },
});

// Context type
interface CollectionContextType {
  // Data
  badges: BadgeDefinition[];
  animals: AnimalDefinition[];
  progress: CollectionProgress;
  isLoaded: boolean;

  // Badge methods
  getBadgeProgress: (badgeId: string) => BadgeProgress | undefined;
  isBadgeUnlocked: (badgeId: string) => boolean;
  getUnlockedBadges: () => BadgeDefinition[];
  getLockedBadges: () => BadgeDefinition[];

  // Animal methods
  getAnimalProgress: (animalId: string) => AnimalProgress | undefined;
  isAnimalUnlocked: (animalId: string) => boolean;
  getUnlockedAnimals: () => AnimalDefinition[];
  getLockedAnimals: () => AnimalDefinition[];

  // Progress methods
  triggerEvent: (event: BadgeEventType, count?: number) => void;
  checkDailyLogin: () => void;
  markBadgeSeen: (badgeId: string) => void;
  markAnimalSeen: (animalId: string) => void;

  // Stats
  getStats: () => CollectionStats;
  getTotalBadges: () => number;
  getUnlockedBadgeCount: () => number;
  getTotalAnimals: () => number;
  getUnlockedAnimalCount: () => number;

  // Unlock queue (for showing unlock animations)
  pendingUnlocks: UnlockEvent[];
  consumeUnlock: () => UnlockEvent | null;
  hasUnseenUnlocks: boolean;
}

const CollectionContext = createContext<CollectionContextType | null>(null);

interface CollectionProviderProps {
  children: ReactNode;
}

export function CollectionProvider({ children }: CollectionProviderProps) {
  const [progress, setProgress] = useState<CollectionProgress>(getDefaultProgress());
  const [isLoaded, setIsLoaded] = useState(false);
  const [pendingUnlocks, setPendingUnlocks] = useState<UnlockEvent[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load progress from storage
   */
  const loadProgress = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(COLLECTION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CollectionProgress;
        // Merge with defaults to handle new fields
        setProgress({
          badges: parsed.badges || {},
          animals: parsed.animals || {},
          stats: { ...DEFAULT_STATS, ...parsed.stats },
        });
      }
    } catch (error) {
      logger.warn('[CollectionContext] Failed to load progress:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  /**
   * Save progress to storage (debounced)
   */
  const saveProgress = useCallback((newProgress: CollectionProgress) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(newProgress));
      } catch (error) {
        logger.warn('[CollectionContext] Failed to save progress:', error);
      }
    }, 500);
  }, []);

  // Load on mount
  useEffect(() => {
    loadProgress();
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [loadProgress]);

  /**
   * Check if a badge should unlock based on current stats
   */
  const checkBadgeUnlock = useCallback((badge: BadgeDefinition, stats: CollectionStats): boolean => {
    const statValue = stats[badge.requirementKey as keyof CollectionStats] as number;
    return statValue >= badge.requirementValue;
  }, []);

  /**
   * Process new unlocks after stat update
   */
  const processUnlocks = useCallback((newStats: CollectionStats, currentBadges: Record<string, BadgeProgress>) => {
    const newUnlocks: UnlockEvent[] = [];
    const updatedBadges = { ...currentBadges };
    const updatedAnimals: Record<string, AnimalProgress> = {};

    for (const badge of BADGES) {
      const existingProgress = updatedBadges[badge.id];
      const isCurrentlyUnlocked = existingProgress?.unlocked || false;

      // Update progress value
      const statValue = newStats[badge.requirementKey as keyof CollectionStats] as number;
      const progressValue = Math.min(statValue, badge.requirementValue);

      updatedBadges[badge.id] = {
        badgeId: badge.id,
        progress: progressValue,
        unlocked: isCurrentlyUnlocked || checkBadgeUnlock(badge, newStats),
        unlockedAt: existingProgress?.unlockedAt,
        seen: existingProgress?.seen || false,
      };

      // Check for new unlock
      if (!isCurrentlyUnlocked && updatedBadges[badge.id].unlocked) {
        const now = Date.now();
        updatedBadges[badge.id].unlockedAt = now;

        // Unlock associated animal
        const animal = ANIMALS_BY_BADGE[badge.id];
        if (animal) {
          updatedAnimals[animal.id] = {
            animalId: animal.id,
            unlocked: true,
            unlockedAt: now,
            seen: false,
          };

          // Add to unlock queue
          newUnlocks.push({
            badge,
            animal,
            isFirstUnlock: Object.keys(currentBadges).filter(k => currentBadges[k]?.unlocked).length === 0,
          });
        }
      }
    }

    return { updatedBadges, updatedAnimals, newUnlocks };
  }, [checkBadgeUnlock]);

  /**
   * Trigger a badge event
   */
  const triggerEvent = useCallback((event: BadgeEventType, count: number = 1) => {
    if (!isLoaded) return;

    setProgress(prev => {
      const statKey = EVENT_TO_STAT[event];
      if (!statKey) return prev;

      // Handle special case for remove from wishlist
      const delta = event === 'REMOVE_FROM_WISHLIST' ? -count : count;

      const newStats: CollectionStats = {
        ...prev.stats,
        [statKey]: Math.max(0, (prev.stats[statKey] as number) + delta),
      };

      // Process any new unlocks
      const { updatedBadges, updatedAnimals, newUnlocks } = processUnlocks(newStats, prev.badges);

      // Add new unlocks to queue
      if (newUnlocks.length > 0) {
        setPendingUnlocks(current => [...current, ...newUnlocks]);

        // Play unlock sound
        SoundManager.play('rewards.achievement');
      }

      const newProgress: CollectionProgress = {
        badges: updatedBadges,
        animals: { ...prev.animals, ...updatedAnimals },
        stats: newStats,
      };

      saveProgress(newProgress);
      return newProgress;
    });
  }, [isLoaded, processUnlocks, saveProgress]);

  /**
   * Check and update daily login streak
   */
  const checkDailyLogin = useCallback(() => {
    if (!isLoaded) return;

    const today = new Date().toISOString().split('T')[0];

    setProgress(prev => {
      const lastLogin = prev.stats.lastLoginDate;

      // Already logged in today
      if (lastLogin === today) return prev;

      let newStreak = prev.stats.currentStreak;

      if (lastLogin) {
        const lastDate = new Date(lastLogin);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day - increase streak
          newStreak += 1;
        } else if (diffDays > 1) {
          // Streak broken - reset to 1
          newStreak = 1;
        }
      } else {
        // First login
        newStreak = 1;
      }

      const newStats: CollectionStats = {
        ...prev.stats,
        lastLoginDate: today,
        dailyLogins: prev.stats.dailyLogins + 1,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.stats.longestStreak, newStreak),
      };

      // Process unlocks with new streak value
      const { updatedBadges, updatedAnimals, newUnlocks } = processUnlocks(newStats, prev.badges);

      if (newUnlocks.length > 0) {
        setPendingUnlocks(current => [...current, ...newUnlocks]);
        SoundManager.play('rewards.achievement');
      }

      const newProgress: CollectionProgress = {
        badges: updatedBadges,
        animals: { ...prev.animals, ...updatedAnimals },
        stats: newStats,
      };

      saveProgress(newProgress);
      return newProgress;
    });
  }, [isLoaded, processUnlocks, saveProgress]);

  /**
   * Mark a badge as seen (hide notification)
   */
  const markBadgeSeen = useCallback((badgeId: string) => {
    setProgress(prev => {
      if (!prev.badges[badgeId]) return prev;

      const newProgress: CollectionProgress = {
        ...prev,
        badges: {
          ...prev.badges,
          [badgeId]: { ...prev.badges[badgeId], seen: true },
        },
      };

      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  /**
   * Mark an animal as seen
   */
  const markAnimalSeen = useCallback((animalId: string) => {
    setProgress(prev => {
      if (!prev.animals[animalId]) return prev;

      const newProgress: CollectionProgress = {
        ...prev,
        animals: {
          ...prev.animals,
          [animalId]: { ...prev.animals[animalId], seen: true },
        },
      };

      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  /**
   * Consume the next unlock from the queue
   */
  const consumeUnlock = useCallback((): UnlockEvent | null => {
    if (pendingUnlocks.length === 0) return null;

    const [next, ...rest] = pendingUnlocks;
    setPendingUnlocks(rest);
    return next;
  }, [pendingUnlocks]);

  // Badge methods
  const getBadgeProgress = useCallback((badgeId: string) => progress.badges[badgeId], [progress.badges]);
  const isBadgeUnlocked = useCallback((badgeId: string) => progress.badges[badgeId]?.unlocked || false, [progress.badges]);
  const getUnlockedBadges = useCallback(() => BADGES.filter(b => progress.badges[b.id]?.unlocked), [progress.badges]);
  const getLockedBadges = useCallback(() => BADGES.filter(b => !progress.badges[b.id]?.unlocked), [progress.badges]);

  // Animal methods
  const getAnimalProgress = useCallback((animalId: string) => progress.animals[animalId], [progress.animals]);
  const isAnimalUnlocked = useCallback((animalId: string) => progress.animals[animalId]?.unlocked || false, [progress.animals]);
  const getUnlockedAnimals = useCallback(() => ANIMALS.filter(a => progress.animals[a.id]?.unlocked), [progress.animals]);
  const getLockedAnimals = useCallback(() => ANIMALS.filter(a => !progress.animals[a.id]?.unlocked), [progress.animals]);

  // Stats methods
  const getStats = useCallback(() => progress.stats, [progress.stats]);
  const getTotalBadges = useCallback(() => BADGES.length, []);
  const getUnlockedBadgeCount = useCallback(() => Object.values(progress.badges).filter(b => b.unlocked).length, [progress.badges]);
  const getTotalAnimals = useCallback(() => ANIMALS.length, []);
  const getUnlockedAnimalCount = useCallback(() => Object.values(progress.animals).filter(a => a.unlocked).length, [progress.animals]);

  // Check for unseen unlocks
  const hasUnseenUnlocks = pendingUnlocks.length > 0 ||
    Object.values(progress.badges).some(b => b.unlocked && !b.seen) ||
    Object.values(progress.animals).some(a => a.unlocked && !a.seen);

  const value: CollectionContextType = {
    badges: BADGES,
    animals: ANIMALS,
    progress,
    isLoaded,
    getBadgeProgress,
    isBadgeUnlocked,
    getUnlockedBadges,
    getLockedBadges,
    getAnimalProgress,
    isAnimalUnlocked,
    getUnlockedAnimals,
    getLockedAnimals,
    triggerEvent,
    checkDailyLogin,
    markBadgeSeen,
    markAnimalSeen,
    getStats,
    getTotalBadges,
    getUnlockedBadgeCount,
    getTotalAnimals,
    getUnlockedAnimalCount,
    pendingUnlocks,
    consumeUnlock,
    hasUnseenUnlocks,
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
}

/**
 * Hook to access collection context
 */
export function useCollection() {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
}

/**
 * Hook to trigger badge events easily
 */
export function useBadgeEvent(event: BadgeEventType) {
  const { triggerEvent } = useCollection();
  return useCallback((count?: number) => triggerEvent(event, count), [triggerEvent, event]);
}

export default CollectionContext;
