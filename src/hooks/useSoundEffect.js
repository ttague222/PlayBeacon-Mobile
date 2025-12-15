/**
 * useSoundEffect Hook
 *
 * React hooks for playing sounds in components.
 * Provides easy access to SoundManager with automatic cleanup.
 */

import { useCallback, useEffect, useRef } from 'react';
import SoundManager, { EVENT_SOUND_MAP } from '../services/SoundManager';

/**
 * Hook to play a specific sound
 *
 * @param {string} soundKey - The sound key to play (e.g., 'ui.tap', 'bear.celebrate')
 * @returns {Function} - Function to trigger the sound
 *
 * Usage:
 *   const playTap = useSoundEffect('ui.tap');
 *   <TouchableOpacity onPress={() => { playTap(); doSomething(); }} />
 */
export function useSoundEffect(soundKey) {
  return useCallback(
    (options = {}) => {
      SoundManager.play(soundKey, options);
    },
    [soundKey]
  );
}

/**
 * Hook to play a sound by event name
 *
 * @param {string} eventName - The event name (from EVENT_SOUND_MAP)
 * @returns {Function} - Function to trigger the sound
 *
 * Usage:
 *   const playAddToWishlist = useSoundEvent('ADD_TO_WISHLIST');
 *   playAddToWishlist(); // Plays rewards.confetti
 */
export function useSoundEvent(eventName) {
  return useCallback(
    (options = {}) => {
      SoundManager.playEvent(eventName, options);
    },
    [eventName]
  );
}

/**
 * Hook to get sound play functions for multiple sounds
 *
 * @param {string[]} soundKeys - Array of sound keys
 * @returns {Object} - Object with play functions keyed by sound name
 *
 * Usage:
 *   const sounds = useSounds(['ui.tap', 'ui.swipe', 'rewards.confetti']);
 *   sounds['ui.tap'](); // Play tap sound
 */
export function useSounds(soundKeys) {
  const soundsRef = useRef({});

  useEffect(() => {
    const newSounds = {};
    soundKeys.forEach((key) => {
      newSounds[key] = (options = {}) => SoundManager.play(key, options);
    });
    soundsRef.current = newSounds;
  }, [soundKeys.join(',')]);

  return soundsRef.current;
}

/**
 * Hook for UI interaction sounds
 *
 * Usage:
 *   const uiSounds = useUISounds();
 *   uiSounds.tap(); // Play tap sound
 *   uiSounds.swipe(); // Play swipe sound
 */
export function useUISounds() {
  return {
    tap: useCallback(() => SoundManager.play('ui.tap'), []),
    swipe: useCallback(() => SoundManager.play('ui.swipe'), []),
    tabChange: useCallback(() => SoundManager.play('ui.tab_change'), []),
    remove: useCallback(() => SoundManager.play('ui.remove'), []),
    modalOpen: useCallback(() => SoundManager.play('ui.modal_open'), []),
    modalClose: useCallback(() => SoundManager.play('ui.modal_close'), []),
    favorite: useCallback(() => SoundManager.play('ui.favorite'), []),
  };
}

/**
 * Hook for reward/achievement sounds
 *
 * Usage:
 *   const rewardSounds = useRewardSounds();
 *   rewardSounds.confetti(); // Play confetti sound
 */
export function useRewardSounds() {
  return {
    confetti: useCallback(() => SoundManager.play('rewards.confetti'), []),
    streak: useCallback(() => SoundManager.play('rewards.streak'), []),
    daily: useCallback(() => SoundManager.play('rewards.daily'), []),
    achievement: useCallback(() => SoundManager.play('rewards.achievement'), []),
    xp: useCallback(() => SoundManager.play('rewards.xp'), []),
  };
}

/**
 * Hook for system feedback sounds
 *
 * Usage:
 *   const systemSounds = useSystemSounds();
 *   systemSounds.success(); // Play login success sound
 *   systemSounds.error(); // Play error sound
 */
export function useSystemSounds() {
  return {
    success: useCallback(() => SoundManager.play('system.success'), []),
    error: useCallback(() => SoundManager.play('system.error'), []),
    ping: useCallback(() => SoundManager.play('system.ping'), []),
    loadingComplete: useCallback(() => SoundManager.play('system.loading_complete'), []),
    noResults: useCallback(() => SoundManager.play('system.no_results'), []),
  };
}

/**
 * Hook to wrap a callback with sound playback
 *
 * @param {Function} callback - The function to wrap
 * @param {string} soundKey - Sound to play before callback
 * @returns {Function} - Wrapped function that plays sound then calls callback
 *
 * Usage:
 *   const handlePress = useWithSound(() => navigation.navigate('Home'), 'ui.tap');
 *   <TouchableOpacity onPress={handlePress} />
 */
export function useWithSound(callback, soundKey) {
  return useCallback(
    (...args) => {
      SoundManager.play(soundKey);
      return callback?.(...args);
    },
    [callback, soundKey]
  );
}

/**
 * Hook for creating a touch handler with sound
 *
 * @param {Function} onPress - The press handler
 * @param {string} soundKey - Sound key to play (default: 'ui.tap')
 * @returns {Object} - Props object with onPress that includes sound
 *
 * Usage:
 *   const touchProps = useTouchWithSound(() => doSomething());
 *   <TouchableOpacity {...touchProps} />
 */
export function useTouchWithSound(onPress, soundKey = 'ui.tap') {
  const handlePress = useCallback(
    (...args) => {
      SoundManager.play(soundKey);
      return onPress?.(...args);
    },
    [onPress, soundKey]
  );

  return { onPress: handlePress };
}

/**
 * Hook for swipe gestures with sound
 *
 * Usage:
 *   const swipeHandlers = useSwipeWithSound(onSwipeLeft, onSwipeRight);
 */
export function useSwipeWithSound(onSwipeLeft, onSwipeRight) {
  const handleSwipeLeft = useCallback(
    (...args) => {
      SoundManager.play('ui.swipe');
      return onSwipeLeft?.(...args);
    },
    [onSwipeLeft]
  );

  const handleSwipeRight = useCallback(
    (...args) => {
      SoundManager.play('ui.swipe');
      return onSwipeRight?.(...args);
    },
    [onSwipeRight]
  );

  return { onSwipeLeft: handleSwipeLeft, onSwipeRight: handleSwipeRight };
}

/**
 * Hook for favorite toggle with appropriate sounds
 *
 * Usage:
 *   const handleFavorite = useFavoriteWithSound(isFavorite, toggleFavorite);
 */
export function useFavoriteWithSound(isFavorite, onToggle) {
  return useCallback(
    (...args) => {
      if (isFavorite) {
        SoundManager.play('ui.remove');
      } else {
        SoundManager.play('ui.favorite');
      }
      return onToggle?.(...args);
    },
    [isFavorite, onToggle]
  );
}

export default useSoundEffect;
