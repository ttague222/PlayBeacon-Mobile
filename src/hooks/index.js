/**
 * Hooks Index
 *
 * Central export file for all custom hooks.
 */

// Sound Hooks
export {
  default as useSoundEffect,
  useSoundEvent,
  useSounds,
  useUISounds,
  useRewardSounds,
  useSystemSounds,
  useWithSound,
  useTouchWithSound,
  useSwipeWithSound,
  useFavoriteWithSound,
} from './useSoundEffect';

// Ad Hooks
export { default as useInterstitial } from './useInterstitial';
export { default as useRewarded } from './useRewarded';

// Network Hooks
export { default as useNetworkState } from './useNetworkState';

// Haptic Feedback Hooks
export { default as useHaptics, HapticType, triggerHaptic } from './useHaptics';
