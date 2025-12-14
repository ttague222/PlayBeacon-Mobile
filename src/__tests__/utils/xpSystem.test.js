/**
 * Unit Tests for XP System Utilities
 *
 * Tests level calculation, XP rewards, and level-up detection
 * for the gamification system.
 */

import {
  XP_REWARDS,
  calculateLevel,
  getXPForLevel,
  getLevelProgress,
  getXPReward,
  hasLeveledUp,
  getLevelUpInfo,
} from '../../utils/xpSystem';

describe('XP System Utilities', () => {
  // ==========================================
  // XP_REWARDS Constants
  // ==========================================
  describe('XP_REWARDS', () => {
    it('should have correct reward values', () => {
      expect(XP_REWARDS.GAME_VIEWED).toBe(1);
      expect(XP_REWARDS.GAME_SAVED).toBe(5);
      expect(XP_REWARDS.COLLECTION_CREATED).toBe(10);
      expect(XP_REWARDS.AI_RECOMMENDATION_USED).toBe(3);
      expect(XP_REWARDS.DAILY_LOGIN).toBe(20);
    });

    it('should have all expected reward types', () => {
      const expectedKeys = [
        'GAME_VIEWED',
        'GAME_SAVED',
        'COLLECTION_CREATED',
        'AI_RECOMMENDATION_USED',
        'DAILY_LOGIN',
      ];
      expect(Object.keys(XP_REWARDS)).toEqual(expectedKeys);
    });
  });

  // ==========================================
  // calculateLevel Tests
  // ==========================================
  describe('calculateLevel', () => {
    it('should return level 0 for 0 XP', () => {
      expect(calculateLevel(0)).toBe(0);
    });

    it('should return level 0 for XP less than 10', () => {
      expect(calculateLevel(1)).toBe(0);
      expect(calculateLevel(5)).toBe(0);
      expect(calculateLevel(9)).toBe(0);
    });

    it('should return level 1 for XP between 10 and 39', () => {
      expect(calculateLevel(10)).toBe(1);
      expect(calculateLevel(20)).toBe(1);
      expect(calculateLevel(39)).toBe(1);
    });

    it('should return level 2 for XP between 40 and 89', () => {
      expect(calculateLevel(40)).toBe(2);
      expect(calculateLevel(60)).toBe(2);
      expect(calculateLevel(89)).toBe(2);
    });

    it('should return level 3 for XP between 90 and 159', () => {
      expect(calculateLevel(90)).toBe(3);
      expect(calculateLevel(100)).toBe(3);
      expect(calculateLevel(159)).toBe(3);
    });

    it('should handle large XP values', () => {
      expect(calculateLevel(1000)).toBe(10);
      expect(calculateLevel(10000)).toBe(31);
      expect(calculateLevel(100000)).toBe(100);
    });

    it('should handle negative XP gracefully (returns NaN for sqrt of negative)', () => {
      // Math.sqrt(-10/10) = Math.sqrt(-1) = NaN, Math.floor(NaN) = NaN
      expect(calculateLevel(-10)).toBeNaN();
    });
  });

  // ==========================================
  // getXPForLevel Tests
  // ==========================================
  describe('getXPForLevel', () => {
    it('should return 0 XP for level 0', () => {
      expect(getXPForLevel(0)).toBe(0);
    });

    it('should return 10 XP for level 1', () => {
      expect(getXPForLevel(1)).toBe(10);
    });

    it('should return 40 XP for level 2', () => {
      expect(getXPForLevel(2)).toBe(40);
    });

    it('should return 90 XP for level 3', () => {
      expect(getXPForLevel(3)).toBe(90);
    });

    it('should follow formula: level^2 * 10', () => {
      expect(getXPForLevel(5)).toBe(250); // 5^2 * 10
      expect(getXPForLevel(10)).toBe(1000); // 10^2 * 10
      expect(getXPForLevel(20)).toBe(4000); // 20^2 * 10
    });

    it('should handle large levels', () => {
      expect(getXPForLevel(100)).toBe(100000);
    });

    it('should handle negative levels (mathematically valid but not meaningful)', () => {
      expect(getXPForLevel(-1)).toBe(10); // (-1)^2 * 10 = 10
    });
  });

  // ==========================================
  // getLevelProgress Tests
  // ==========================================
  describe('getLevelProgress', () => {
    it('should return correct progress for 0 XP', () => {
      const progress = getLevelProgress(0);
      expect(progress.currentLevel).toBe(0);
      expect(progress.nextLevel).toBe(1);
      expect(progress.currentXP).toBe(0);
      expect(progress.xpIntoCurrentLevel).toBe(0);
      expect(progress.xpNeededForNextLevel).toBe(10);
      expect(progress.totalXPForNextLevel).toBe(10);
      expect(progress.progressPercentage).toBe(0);
    });

    it('should return correct progress mid-level', () => {
      const progress = getLevelProgress(25);
      expect(progress.currentLevel).toBe(1);
      expect(progress.nextLevel).toBe(2);
      expect(progress.currentXP).toBe(25);
      expect(progress.xpIntoCurrentLevel).toBe(15); // 25 - 10
      expect(progress.xpNeededForNextLevel).toBe(30); // 40 - 10
      expect(progress.totalXPForNextLevel).toBe(40);
      expect(progress.progressPercentage).toBe(50); // 15/30 * 100
    });

    it('should return correct progress at level boundary', () => {
      const progress = getLevelProgress(40);
      expect(progress.currentLevel).toBe(2);
      expect(progress.nextLevel).toBe(3);
      expect(progress.xpIntoCurrentLevel).toBe(0); // Just hit level 2
      expect(progress.progressPercentage).toBe(0);
    });

    it('should clamp progressPercentage between 0 and 100', () => {
      const progress = getLevelProgress(5);
      expect(progress.progressPercentage).toBeGreaterThanOrEqual(0);
      expect(progress.progressPercentage).toBeLessThanOrEqual(100);
    });

    it('should handle large XP values', () => {
      const progress = getLevelProgress(5000);
      expect(progress.currentLevel).toBe(22);
      expect(progress.nextLevel).toBe(23);
      expect(progress.progressPercentage).toBeGreaterThanOrEqual(0);
      expect(progress.progressPercentage).toBeLessThanOrEqual(100);
    });
  });

  // ==========================================
  // getXPReward Tests
  // ==========================================
  describe('getXPReward', () => {
    it('should return correct reward for GAME_VIEWED', () => {
      expect(getXPReward('GAME_VIEWED')).toBe(1);
    });

    it('should return correct reward for GAME_SAVED', () => {
      expect(getXPReward('GAME_SAVED')).toBe(5);
    });

    it('should return correct reward for COLLECTION_CREATED', () => {
      expect(getXPReward('COLLECTION_CREATED')).toBe(10);
    });

    it('should return correct reward for AI_RECOMMENDATION_USED', () => {
      expect(getXPReward('AI_RECOMMENDATION_USED')).toBe(3);
    });

    it('should return correct reward for DAILY_LOGIN', () => {
      expect(getXPReward('DAILY_LOGIN')).toBe(20);
    });

    it('should return 0 for unknown action types', () => {
      expect(getXPReward('UNKNOWN_ACTION')).toBe(0);
      expect(getXPReward('')).toBe(0);
      expect(getXPReward(null)).toBe(0);
      expect(getXPReward(undefined)).toBe(0);
    });

    it('should be case-sensitive', () => {
      expect(getXPReward('game_viewed')).toBe(0);
      expect(getXPReward('Game_Viewed')).toBe(0);
    });
  });

  // ==========================================
  // hasLeveledUp Tests
  // ==========================================
  describe('hasLeveledUp', () => {
    it('should return false when no level change', () => {
      expect(hasLeveledUp(0, 5)).toBe(false); // Both level 0
      expect(hasLeveledUp(10, 20)).toBe(false); // Both level 1
      expect(hasLeveledUp(40, 60)).toBe(false); // Both level 2
    });

    it('should return true when leveling up', () => {
      expect(hasLeveledUp(9, 10)).toBe(true); // Level 0 -> 1
      expect(hasLeveledUp(39, 40)).toBe(true); // Level 1 -> 2
      expect(hasLeveledUp(89, 90)).toBe(true); // Level 2 -> 3
    });

    it('should return true when leveling up multiple levels', () => {
      expect(hasLeveledUp(0, 40)).toBe(true); // Level 0 -> 2
      expect(hasLeveledUp(5, 100)).toBe(true); // Level 0 -> 3
    });

    it('should return false when XP decreases (edge case)', () => {
      expect(hasLeveledUp(50, 10)).toBe(false); // Level 2 -> 1
    });

    it('should return false when XP is the same', () => {
      expect(hasLeveledUp(50, 50)).toBe(false);
    });
  });

  // ==========================================
  // getLevelUpInfo Tests
  // ==========================================
  describe('getLevelUpInfo', () => {
    it('should return null when no level up', () => {
      expect(getLevelUpInfo(0, 5)).toBeNull();
      expect(getLevelUpInfo(10, 20)).toBeNull();
      expect(getLevelUpInfo(50, 50)).toBeNull();
    });

    it('should return correct info for single level up', () => {
      const info = getLevelUpInfo(9, 10);
      expect(info).not.toBeNull();
      expect(info.oldLevel).toBe(0);
      expect(info.newLevel).toBe(1);
      expect(info.levelsGained).toBe(1);
    });

    it('should return correct info for level 1 to 2', () => {
      const info = getLevelUpInfo(39, 40);
      expect(info).not.toBeNull();
      expect(info.oldLevel).toBe(1);
      expect(info.newLevel).toBe(2);
      expect(info.levelsGained).toBe(1);
    });

    it('should return correct info for multiple level ups', () => {
      const info = getLevelUpInfo(0, 100);
      expect(info).not.toBeNull();
      expect(info.oldLevel).toBe(0);
      expect(info.newLevel).toBe(3);
      expect(info.levelsGained).toBe(3);
    });

    it('should handle large XP jumps', () => {
      const info = getLevelUpInfo(100, 10000);
      expect(info).not.toBeNull();
      expect(info.oldLevel).toBe(3);
      expect(info.newLevel).toBe(31);
      expect(info.levelsGained).toBe(28);
    });
  });

  // ==========================================
  // Integration Tests
  // ==========================================
  describe('Integration Tests', () => {
    it('should have consistent level calculation and XP requirements', () => {
      // Verify that calculateLevel(getXPForLevel(n)) === n
      for (let level = 0; level <= 20; level++) {
        const xp = getXPForLevel(level);
        expect(calculateLevel(xp)).toBe(level);
      }
    });

    it('should correctly track progress through multiple levels', () => {
      let totalXP = 0;
      let lastLevel = 0;
      let levelUps = 0;

      // Simulate earning XP for 100 game views
      for (let i = 0; i < 100; i++) {
        const oldXP = totalXP;
        totalXP += getXPReward('GAME_VIEWED');

        if (hasLeveledUp(oldXP, totalXP)) {
          levelUps++;
          const info = getLevelUpInfo(oldXP, totalXP);
          expect(info.newLevel).toBeGreaterThan(lastLevel);
          lastLevel = info.newLevel;
        }
      }

      expect(totalXP).toBe(100); // 100 * 1 XP
      expect(calculateLevel(totalXP)).toBe(3); // floor(sqrt(100/10)) = floor(sqrt(10)) = 3
    });

    it('should handle daily login streak progression', () => {
      let totalXP = 0;

      // Simulate 7 days of daily logins
      for (let day = 1; day <= 7; day++) {
        totalXP += getXPReward('DAILY_LOGIN');
      }

      expect(totalXP).toBe(140); // 7 * 20 XP
      expect(calculateLevel(totalXP)).toBe(3); // floor(sqrt(14)) = 3
    });
  });
});
