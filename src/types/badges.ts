/**
 * Badge & Collectable Types
 *
 * Type definitions for the kid-friendly badges and animal collectables system.
 */

// Badge requirement types
export type BadgeRequirementType = 'count' | 'streak' | 'action';

// Animal rarity levels
export type AnimalRarity = 'common' | 'rare' | 'special';

// Badge definition (static data)
export interface BadgeDefinition {
  id: string;
  name: string;
  icon: string; // Emoji or icon name
  description: string;
  hint: string; // Hint shown when locked
  requirementType: BadgeRequirementType;
  requirementKey: string; // Event key to track
  requirementValue: number; // Target value to unlock
  animalId: string; // Associated animal
  order: number; // Display order
}

// Badge progress (user data)
export interface BadgeProgress {
  badgeId: string;
  progress: number;
  unlocked: boolean;
  unlockedAt?: number; // Unix timestamp
  seen: boolean; // Has user seen the unlock animation
}

// Animal collectable definition (static data)
export interface AnimalDefinition {
  id: string;
  name: string;
  image: string; // Asset path or require()
  rarity: AnimalRarity;
  funFact: string;
  badgeId: string; // Badge that unlocks this animal
  order: number; // Display order
}

// Animal progress (user data)
export interface AnimalProgress {
  animalId: string;
  unlocked: boolean;
  unlockedAt?: number;
  seen: boolean;
}

// User's full collection progress
export interface CollectionProgress {
  badges: Record<string, BadgeProgress>;
  animals: Record<string, AnimalProgress>;
  stats: CollectionStats;
}

// Statistics for tracking
export interface CollectionStats {
  gamesViewed: number;
  gamesWishlisted: number;
  gamesSwiped: number;
  bearInteractions: number;
  dailyLogins: number;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string; // YYYY-MM-DD
  collectionsCreated: number;
  recommendationsTapped: number;
  totalPlayTime: number; // minutes
  tasksCompleted: number;
  mysteryBoxOpened: number;
  tutorialsCompleted: number;
  gamesShared: number;
  categoriesExplored: number;
}

// Badge event types
export type BadgeEventType =
  | 'VIEW_GAME'
  | 'ADD_TO_WISHLIST'
  | 'REMOVE_FROM_WISHLIST'
  | 'SWIPE_DISCOVERY'
  | 'BEAR_INTERACTION'
  | 'DAILY_LOGIN'
  | 'CREATE_COLLECTION'
  | 'TAP_RECOMMENDATION'
  | 'COMPLETE_TUTORIAL'
  | 'SHARE_GAME'
  | 'FIRST_FAVORITE'
  | 'EXPLORE_CATEGORY'
  | 'COMPLETE_TASK'
  | 'OPEN_MYSTERY_BOX';

// Unlock event payload
export interface UnlockEvent {
  badge: BadgeDefinition;
  animal: AnimalDefinition;
  isFirstUnlock: boolean;
}

// Rarity colors and styles (dark theme compatible)
export const RARITY_CONFIG: Record<AnimalRarity, { color: string; bgColor: string; label: string }> = {
  common: {
    color: '#6BCB77',
    bgColor: '#2D4A3E',
    label: 'Common',
  },
  rare: {
    color: '#4FC3F7',
    bgColor: '#2A3F4D',
    label: 'Rare',
  },
  special: {
    color: '#CE93D8',
    bgColor: '#3D2A4A',
    label: 'Special',
  },
};

// Star rating based on rarity
export const RARITY_STARS: Record<AnimalRarity, number> = {
  common: 1,
  rare: 2,
  special: 3,
};
