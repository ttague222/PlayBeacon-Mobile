/**
 * Haptic Feedback Hook
 *
 * Provides haptic feedback for key user interactions.
 * Uses Expo Haptics when available, gracefully degrades on unsupported devices.
 */

import { useCallback, useRef } from 'react';
import { Platform, Vibration } from 'react-native';
import logger from '../utils/logger';

// Haptic feedback types
export const HapticType = {
  // Light feedback - for selections, toggles
  LIGHT: 'light',
  // Medium feedback - for button presses, swipes
  MEDIUM: 'medium',
  // Heavy feedback - for important actions, errors
  HEAVY: 'heavy',
  // Success feedback - for completed actions
  SUCCESS: 'success',
  // Warning feedback - for warnings, alerts
  WARNING: 'warning',
  // Error feedback - for errors, failures
  ERROR: 'error',
  // Selection feedback - for picker selections
  SELECTION: 'selection',
};

// Try to import expo-haptics if available
let Haptics = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  logger.log('expo-haptics not available, using fallback vibration');
}

/**
 * Map haptic types to expo-haptics styles
 */
const getHapticStyle = (type) => {
  if (!Haptics) return null;

  switch (type) {
    case HapticType.LIGHT:
      return Haptics.ImpactFeedbackStyle.Light;
    case HapticType.MEDIUM:
      return Haptics.ImpactFeedbackStyle.Medium;
    case HapticType.HEAVY:
      return Haptics.ImpactFeedbackStyle.Heavy;
    case HapticType.SUCCESS:
      return Haptics.NotificationFeedbackType.Success;
    case HapticType.WARNING:
      return Haptics.NotificationFeedbackType.Warning;
    case HapticType.ERROR:
      return Haptics.NotificationFeedbackType.Error;
    case HapticType.SELECTION:
      return 'selection';
    default:
      return Haptics.ImpactFeedbackStyle.Medium;
  }
};

/**
 * Map haptic types to vibration patterns (fallback)
 */
const getVibrationPattern = (type) => {
  switch (type) {
    case HapticType.LIGHT:
      return 10;
    case HapticType.MEDIUM:
      return 25;
    case HapticType.HEAVY:
      return 50;
    case HapticType.SUCCESS:
      return [0, 25, 50, 25]; // Double tap pattern
    case HapticType.WARNING:
      return [0, 50, 100, 50];
    case HapticType.ERROR:
      return [0, 100, 50, 100, 50, 100];
    case HapticType.SELECTION:
      return 5;
    default:
      return 25;
  }
};

/**
 * Trigger haptic feedback
 */
export const triggerHaptic = async (type = HapticType.MEDIUM) => {
  try {
    if (Haptics) {
      const style = getHapticStyle(type);

      if (style === 'selection') {
        await Haptics.selectionAsync();
      } else if (
        type === HapticType.SUCCESS ||
        type === HapticType.WARNING ||
        type === HapticType.ERROR
      ) {
        await Haptics.notificationAsync(style);
      } else {
        await Haptics.impactAsync(style);
      }
    } else {
      // Fallback to Vibration API
      const pattern = getVibrationPattern(type);
      if (Array.isArray(pattern)) {
        Vibration.vibrate(pattern);
      } else {
        Vibration.vibrate(pattern);
      }
    }
  } catch (error) {
    // Silently fail - haptics are not critical
    logger.log('Haptic feedback failed:', error.message);
  }
};

/**
 * Hook for haptic feedback with debouncing
 */
export function useHaptics(enabled = true) {
  const lastHapticTime = useRef(0);
  const DEBOUNCE_MS = 50; // Minimum time between haptics

  /**
   * Trigger haptic with debouncing
   */
  const haptic = useCallback(
    async (type = HapticType.MEDIUM) => {
      if (!enabled) return;

      const now = Date.now();
      if (now - lastHapticTime.current < DEBOUNCE_MS) {
        return;
      }

      lastHapticTime.current = now;
      await triggerHaptic(type);
    },
    [enabled]
  );

  /**
   * Pre-built haptic triggers for common actions
   */
  const haptics = {
    // UI interactions
    tap: useCallback(() => haptic(HapticType.LIGHT), [haptic]),
    press: useCallback(() => haptic(HapticType.MEDIUM), [haptic]),
    longPress: useCallback(() => haptic(HapticType.HEAVY), [haptic]),
    selection: useCallback(() => haptic(HapticType.SELECTION), [haptic]),

    // Feedback types
    success: useCallback(() => haptic(HapticType.SUCCESS), [haptic]),
    warning: useCallback(() => haptic(HapticType.WARNING), [haptic]),
    error: useCallback(() => haptic(HapticType.ERROR), [haptic]),

    // Game-specific actions
    like: useCallback(() => haptic(HapticType.SUCCESS), [haptic]),
    dislike: useCallback(() => haptic(HapticType.MEDIUM), [haptic]),
    skip: useCallback(() => haptic(HapticType.LIGHT), [haptic]),
    swipe: useCallback(() => haptic(HapticType.LIGHT), [haptic]),
    addToCollection: useCallback(() => haptic(HapticType.SUCCESS), [haptic]),
    badgeUnlock: useCallback(() => haptic(HapticType.SUCCESS), [haptic]),
    dailyReward: useCallback(() => haptic(HapticType.SUCCESS), [haptic]),
  };

  return {
    haptic,
    ...haptics,
    // Expose the trigger function directly
    trigger: triggerHaptic,
    // Check if haptics are available
    isAvailable: Haptics !== null || Platform.OS !== 'web',
  };
}

export default useHaptics;
