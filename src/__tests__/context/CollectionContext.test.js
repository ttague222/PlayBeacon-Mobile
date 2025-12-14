/**
 * CollectionContext Tests
 *
 * Tests for badge/animal collection management, event triggering,
 * progress tracking, and unlock mechanics.
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock BearContext
jest.mock('../../context/BearContext', () => ({
  useBear: () => ({
    triggerEvent: jest.fn(),
  }),
}));

// Mock SoundManager
jest.mock('../../services/SoundManager', () => ({
  play: jest.fn(),
}));

// Mock badge and animal data
jest.mock('../../data/badges.json', () => ({
  badges: [
    {
      id: 'first_view',
      name: 'First Look',
      icon: '👀',
      description: 'View your first game',
      hint: 'Start exploring!',
      requirementType: 'count',
      requirementKey: 'gamesViewed',
      requirementValue: 1,
      animalId: 'bear',
      order: 1,
    },
    {
      id: 'explorer',
      name: 'Explorer',
      icon: '🔭',
      description: 'View 10 games',
      hint: 'Keep exploring!',
      requirementType: 'count',
      requirementKey: 'gamesViewed',
      requirementValue: 10,
      animalId: 'fox',
      order: 2,
    },
    {
      id: 'wishlist_starter',
      name: 'Wishlist Starter',
      icon: '⭐',
      description: 'Add first game to wishlist',
      hint: 'Save a game you like!',
      requirementType: 'count',
      requirementKey: 'gamesWishlisted',
      requirementValue: 1,
      animalId: 'penguin',
      order: 3,
    },
    {
      id: 'daily_visitor',
      name: 'Daily Visitor',
      icon: '📅',
      description: 'Log in for 3 days',
      hint: 'Come back every day!',
      requirementType: 'count',
      requirementKey: 'dailyLogins',
      requirementValue: 3,
      animalId: 'owl',
      order: 4,
    },
  ],
}));

jest.mock('../../data/animals.json', () => ({
  animals: [
    {
      id: 'bear',
      name: 'Buddy Bear',
      image: 'bear.png',
      rarity: 'common',
      funFact: 'Bears love games!',
      badgeId: 'first_view',
      order: 1,
    },
    {
      id: 'fox',
      name: 'Foxy',
      image: 'fox.png',
      rarity: 'rare',
      funFact: 'Foxes are clever!',
      badgeId: 'explorer',
      order: 2,
    },
    {
      id: 'penguin',
      name: 'Penny Penguin',
      image: 'penguin.png',
      rarity: 'common',
      funFact: 'Penguins love wishlists!',
      badgeId: 'wishlist_starter',
      order: 3,
    },
    {
      id: 'owl',
      name: 'Oliver Owl',
      image: 'owl.png',
      rarity: 'special',
      funFact: 'Owls are wise!',
      badgeId: 'daily_visitor',
      order: 4,
    },
  ],
}));

import {
  CollectionProvider,
  useCollection,
  useBadgeEvent,
} from '../../context/CollectionContext';
import SoundManager from '../../services/SoundManager';

const wrapper = ({ children }) => <CollectionProvider>{children}</CollectionProvider>;

describe('CollectionContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('Initial State', () => {
    it('should provide badges array', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.badges).toBeDefined();
      expect(Array.isArray(result.current.badges)).toBe(true);
      expect(result.current.badges.length).toBe(4);
    });

    it('should provide animals array', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.animals).toBeDefined();
      expect(Array.isArray(result.current.animals)).toBe(true);
      expect(result.current.animals.length).toBe(4);
    });

    it('should have empty progress initially', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.progress.badges).toEqual({});
      expect(result.current.progress.animals).toEqual({});
    });

    it('should have default stats', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.progress.stats.gamesViewed).toBe(0);
      expect(result.current.progress.stats.gamesWishlisted).toBe(0);
      expect(result.current.progress.stats.dailyLogins).toBe(0);
    });

    it('should have no pending unlocks initially', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.pendingUnlocks).toEqual([]);
    });
  });

  describe('Badge Methods', () => {
    it('should return undefined for unknown badge progress', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.getBadgeProgress('unknown')).toBeUndefined();
    });

    it('should return false for locked badges', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.isBadgeUnlocked('first_view')).toBe(false);
    });

    it('should return empty array for unlocked badges initially', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.getUnlockedBadges()).toEqual([]);
    });

    it('should return all badges as locked initially', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.getLockedBadges().length).toBe(4);
    });
  });

  describe('Animal Methods', () => {
    it('should return undefined for unknown animal progress', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.getAnimalProgress('unknown')).toBeUndefined();
    });

    it('should return false for locked animals', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.isAnimalUnlocked('bear')).toBe(false);
    });

    it('should return empty array for unlocked animals initially', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.getUnlockedAnimals()).toEqual([]);
    });
  });

  describe('Event Triggering', () => {
    it('should increment gamesViewed stat on VIEW_GAME event', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.triggerEvent('VIEW_GAME');
      });

      expect(result.current.progress.stats.gamesViewed).toBe(1);
    });

    it('should increment gamesWishlisted stat on ADD_TO_WISHLIST event', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.triggerEvent('ADD_TO_WISHLIST');
      });

      expect(result.current.progress.stats.gamesWishlisted).toBe(1);
    });

    it('should decrement gamesWishlisted on REMOVE_FROM_WISHLIST event', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      // First add to wishlist
      act(() => {
        result.current.triggerEvent('ADD_TO_WISHLIST');
        result.current.triggerEvent('ADD_TO_WISHLIST');
      });

      expect(result.current.progress.stats.gamesWishlisted).toBe(2);

      // Then remove
      act(() => {
        result.current.triggerEvent('REMOVE_FROM_WISHLIST');
      });

      expect(result.current.progress.stats.gamesWishlisted).toBe(1);
    });

    it('should not go below 0 on REMOVE_FROM_WISHLIST', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.triggerEvent('REMOVE_FROM_WISHLIST');
      });

      expect(result.current.progress.stats.gamesWishlisted).toBe(0);
    });

    it('should increment by count parameter', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.triggerEvent('VIEW_GAME', 5);
      });

      expect(result.current.progress.stats.gamesViewed).toBe(5);
    });
  });

  describe('Badge Unlocking', () => {
    it('should unlock badge when requirement is met', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      // first_view requires gamesViewed >= 1
      act(() => {
        result.current.triggerEvent('VIEW_GAME');
      });

      expect(result.current.isBadgeUnlocked('first_view')).toBe(true);
    });

    it('should unlock associated animal when badge unlocks', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.triggerEvent('VIEW_GAME');
      });

      expect(result.current.isAnimalUnlocked('bear')).toBe(true);
    });

    it('should add unlock to pending queue', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.triggerEvent('VIEW_GAME');
      });

      expect(result.current.pendingUnlocks.length).toBe(1);
      expect(result.current.pendingUnlocks[0].badge.id).toBe('first_view');
      expect(result.current.pendingUnlocks[0].animal.id).toBe('bear');
    });

    it('should play achievement sound on unlock', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.triggerEvent('VIEW_GAME');
      });

      expect(SoundManager.play).toHaveBeenCalledWith('rewards.achievement');
    });

    it('should not unlock badge if requirement not met', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      // explorer requires gamesViewed >= 10
      act(() => {
        result.current.triggerEvent('VIEW_GAME', 5);
      });

      expect(result.current.isBadgeUnlocked('explorer')).toBe(false);
    });

    it('should unlock multiple badges when requirements are met', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      // View 10 games to unlock both first_view and explorer
      act(() => {
        result.current.triggerEvent('VIEW_GAME', 10);
      });

      expect(result.current.isBadgeUnlocked('first_view')).toBe(true);
      expect(result.current.isBadgeUnlocked('explorer')).toBe(true);
    });
  });

  describe('Consume Unlock', () => {
    it('should return and remove first pending unlock', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      // Trigger unlocks
      act(() => {
        result.current.triggerEvent('VIEW_GAME', 10);
      });

      expect(result.current.pendingUnlocks.length).toBe(2);

      let consumed;
      act(() => {
        consumed = result.current.consumeUnlock();
      });

      expect(consumed).not.toBeNull();
      expect(consumed.badge.id).toBe('first_view');
      expect(result.current.pendingUnlocks.length).toBe(1);
    });

    it('should return null when no pending unlocks', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      let consumed;
      act(() => {
        consumed = result.current.consumeUnlock();
      });

      expect(consumed).toBeNull();
    });
  });

  describe('Mark Seen', () => {
    it('should mark badge as seen', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      // Unlock badge first
      act(() => {
        result.current.triggerEvent('VIEW_GAME');
      });

      expect(result.current.getBadgeProgress('first_view').seen).toBe(false);

      act(() => {
        result.current.markBadgeSeen('first_view');
      });

      expect(result.current.getBadgeProgress('first_view').seen).toBe(true);
    });

    it('should mark animal as seen', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      // Unlock animal first
      act(() => {
        result.current.triggerEvent('VIEW_GAME');
      });

      expect(result.current.getAnimalProgress('bear').seen).toBe(false);

      act(() => {
        result.current.markAnimalSeen('bear');
      });

      expect(result.current.getAnimalProgress('bear').seen).toBe(true);
    });
  });

  describe('Stats Methods', () => {
    it('should return current stats', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      const stats = result.current.getStats();
      expect(stats).toBeDefined();
      expect(stats.gamesViewed).toBe(0);
    });

    it('should return total badges count', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.getTotalBadges()).toBe(4);
    });

    it('should return unlocked badge count', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.getUnlockedBadgeCount()).toBe(0);

      act(() => {
        result.current.triggerEvent('VIEW_GAME');
      });

      expect(result.current.getUnlockedBadgeCount()).toBe(1);
    });

    it('should return total animals count', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.getTotalAnimals()).toBe(4);
    });

    it('should return unlocked animal count', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.getUnlockedAnimalCount()).toBe(0);

      act(() => {
        result.current.triggerEvent('VIEW_GAME');
      });

      expect(result.current.getUnlockedAnimalCount()).toBe(1);
    });
  });

  describe('Has Unseen Unlocks', () => {
    it('should be false initially', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.hasUnseenUnlocks).toBe(false);
    });

    it('should be true when there are pending unlocks', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.triggerEvent('VIEW_GAME');
      });

      expect(result.current.hasUnseenUnlocks).toBe(true);
    });
  });

  describe('useBadgeEvent Hook', () => {
    it('should create a trigger function for specific event', async () => {
      const { result } = renderHook(
        () => {
          const collection = useCollection();
          const triggerView = useBadgeEvent('VIEW_GAME');
          return { collection, triggerView };
        },
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.collection.isLoaded).toBe(true);
      });

      act(() => {
        result.current.triggerView();
      });

      expect(result.current.collection.progress.stats.gamesViewed).toBe(1);
    });

    it('should support count parameter', async () => {
      const { result } = renderHook(
        () => {
          const collection = useCollection();
          const triggerView = useBadgeEvent('VIEW_GAME');
          return { collection, triggerView };
        },
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.collection.isLoaded).toBe(true);
      });

      act(() => {
        result.current.triggerView(5);
      });

      expect(result.current.collection.progress.stats.gamesViewed).toBe(5);
    });
  });

  describe('Persistence', () => {
    it('should save progress to AsyncStorage', async () => {
      const { result } = renderHook(() => useCollection(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.triggerEvent('VIEW_GAME');
      });

      // Wait for debounced save (500ms)
      await waitFor(
        () => {
          expect(AsyncStorage.setItem).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useCollection is used outside provider', () => {
      expect(() => {
        renderHook(() => useCollection());
      }).toThrow('useCollection must be used within a CollectionProvider');
    });
  });
});
