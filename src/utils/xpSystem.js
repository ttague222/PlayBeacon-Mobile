// XP rewards for different actions
export const XP_REWARDS = {
  GAME_VIEWED: 1,
  GAME_SAVED: 5,
  COLLECTION_CREATED: 10,
  AI_RECOMMENDATION_USED: 3,
  DAILY_LOGIN: 20,
};

/**
 * Calculate level from XP
 * Formula: level = floor(sqrt(xp / 10))
 * @param {number} xp - Total XP
 * @returns {number} Current level
 */
export const calculateLevel = (xp) => {
  return Math.floor(Math.sqrt(xp / 10));
};

/**
 * Calculate XP required for a specific level
 * Inverse formula: xp = level^2 * 10
 * @param {number} level - Target level
 * @returns {number} XP required for that level
 */
export const getXPForLevel = (level) => {
  return level * level * 10;
};

/**
 * Get XP progress for current level
 * @param {number} currentXP - Current total XP
 * @returns {Object} Progress information
 */
export const getLevelProgress = (currentXP) => {
  const currentLevel = calculateLevel(currentXP);
  const nextLevel = currentLevel + 1;

  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(nextLevel);

  const xpIntoCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;

  const progressPercentage = (xpIntoCurrentLevel / xpNeededForNextLevel) * 100;

  return {
    currentLevel,
    nextLevel,
    currentXP,
    xpIntoCurrentLevel,
    xpNeededForNextLevel,
    totalXPForNextLevel: nextLevelXP,
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
  };
};

/**
 * Calculate XP to award based on action
 * @param {string} actionType - Type of action (from XP_REWARDS keys)
 * @returns {number} XP to award
 */
export const getXPReward = (actionType) => {
  return XP_REWARDS[actionType] || 0;
};

/**
 * Check if leveled up after XP gain
 * @param {number} oldXP - XP before action
 * @param {number} newXP - XP after action
 * @returns {boolean} True if leveled up
 */
export const hasLeveledUp = (oldXP, newXP) => {
  const oldLevel = calculateLevel(oldXP);
  const newLevel = calculateLevel(newXP);
  return newLevel > oldLevel;
};

/**
 * Get level up info if applicable
 * @param {number} oldXP - XP before action
 * @param {number} newXP - XP after action
 * @returns {Object|null} Level up info or null
 */
export const getLevelUpInfo = (oldXP, newXP) => {
  if (!hasLeveledUp(oldXP, newXP)) {
    return null;
  }

  const oldLevel = calculateLevel(oldXP);
  const newLevel = calculateLevel(newXP);

  return {
    oldLevel,
    newLevel,
    levelsGained: newLevel - oldLevel,
  };
};
