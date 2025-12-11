/**
 * Page-Level Bear Wrappers
 *
 * Pre-configured Bear components for each screen type.
 * These handle screen-specific behaviors and positioning.
 */

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Bear, { BearState, BearPositioned } from './Bear';
import { useBear, useBearLoading } from '../context/BearContext';
import { useCollection } from '../context/CollectionContext';

/**
 * Bear for Home Screen
 *
 * - Positioned bottom-right as corner mascot
 * - Auto-blink and idle behaviors enabled
 * - Smaller size (100-140px)
 * - Responds to recommendations loading
 */
export function BearHome({ onPress }) {
  const { currentState, isVisible } = useBear();

  if (!isVisible) return null;

  return (
    <BearPositioned
      position="bottom-right"
      offset={{ x: 16, y: 80 }} // Above tab bar
      state={currentState}
      size={100}
      autoBlink={true}
      autoIdleBehaviors={true}
      onPress={onPress}
    />
  );
}

/**
 * Bear for Discovery/Queue Screen
 *
 * - Positioned bottom-left to not cover cards
 * - Reacts to scroll direction
 * - Shows excitement for new games
 */
export function BearDiscovery({ scrollDirection, isEmpty, isLoading }) {
  const { setState, currentState, isVisible } = useBear();

  useEffect(() => {
    if (isLoading) {
      setState(BearState.THINK, false);
    } else if (isEmpty) {
      setState(BearState.SAD);
    } else if (scrollDirection === 'left') {
      setState(BearState.POINT_LEFT);
    } else if (scrollDirection === 'right') {
      setState(BearState.POINT_RIGHT);
    }
  }, [scrollDirection, isEmpty, isLoading, setState]);

  if (!isVisible) return null;

  return (
    <BearPositioned
      position="bottom-left"
      offset={{ x: 16, y: 80 }}
      state={currentState}
      size={90}
      autoBlink={true}
      autoIdleBehaviors={false} // Don't interrupt during browsing
    />
  );
}

/**
 * Bear for Wishlist/Collections Screen
 *
 * - Positioned bottom-right
 * - Celebrates when items added
 * - Sad when empty
 */
export function BearWishlist({ isEmpty, itemCount }) {
  const { currentState, isVisible, triggerEvent } = useBear();

  useEffect(() => {
    if (isEmpty) {
      triggerEvent('EMPTY_RESULTS');
    }
  }, [isEmpty, triggerEvent]);

  if (!isVisible) return null;

  return (
    <BearPositioned
      position="bottom-right"
      offset={{ x: 16, y: 80 }}
      state={currentState}
      size={100}
      autoBlink={true}
      autoIdleBehaviors={true}
    />
  );
}

/**
 * Bear for Profile Screen
 *
 * - Points to login button when logged out
 * - Celebrates achievements/streaks
 * - Goes to sleep after inactivity
 */
export function BearProfile({ isLoggedIn, viewingAchievements }) {
  const { currentState, isVisible, setState } = useBear();

  useEffect(() => {
    if (!isLoggedIn) {
      setState(BearState.POINT_RIGHT, false);
    } else if (viewingAchievements) {
      setState(BearState.CELEBRATE);
    }
  }, [isLoggedIn, viewingAchievements, setState]);

  if (!isVisible) return null;

  return (
    <BearPositioned
      position="bottom-right"
      offset={{ x: 16, y: 80 }}
      state={currentState}
      size={120}
      autoBlink={true}
      autoIdleBehaviors={true}
      sleepTimeout={isLoggedIn ? 15 : 0} // Sleep after 15s when logged in
    />
  );
}

/**
 * Bear for Onboarding Screens
 *
 * - Larger size for emphasis
 * - Different states per onboarding step
 * - No auto behaviors (controlled by step)
 */
export function BearOnboarding({ step }) {
  const stepStates = {
    welcome: BearState.WAVE,
    explore: BearState.POINT_RIGHT,
    wishlist: BearState.TAP_BOUNCE,
    rewards: BearState.CELEBRATE,
    complete: BearState.JUMP,
  };

  const state = stepStates[step] || BearState.WAVE;

  return (
    <View style={styles.onboardingBear}>
      <Bear
        state={state}
        size={200}
        autoBlink={false}
        autoIdleBehaviors={false}
        interactive={false}
      />
    </View>
  );
}

/**
 * Bear for Game Detail Screen
 *
 * - Anchored at bottom
 * - Reacts to add/remove actions
 * - Shows thinking during load
 */
export function BearGameDetail({ isLoading, isFavorited }) {
  const { currentState, isVisible } = useBear();
  const { startLoading, stopLoading } = useBearLoading();

  useEffect(() => {
    if (isLoading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [isLoading, startLoading, stopLoading]);

  if (!isVisible) return null;

  return (
    <BearPositioned
      position="bottom-right"
      offset={{ x: 16, y: 16 }}
      state={currentState}
      size={100}
      autoBlink={true}
      autoIdleBehaviors={false}
    />
  );
}

/**
 * Bear Loading Overlay
 *
 * - Full screen loading state
 * - Bear in thinking mode
 * - Centered
 */
export function BearLoadingScreen({ message }) {
  return (
    <View style={styles.loadingContainer}>
      <Bear
        state={BearState.THINK}
        size={180}
        autoBlink={false}
        autoIdleBehaviors={false}
        interactive={false}
      />
    </View>
  );
}

/**
 * Bear Error State
 *
 * - For error screens
 * - Sad or shaking head
 */
export function BearError({ type = 'general' }) {
  const state = type === 'network' ? BearState.SAD : BearState.NO;

  return (
    <View style={styles.errorContainer}>
      <Bear
        state={state}
        size={150}
        autoBlink={false}
        autoIdleBehaviors={false}
        interactive={true}
      />
    </View>
  );
}

/**
 * Bear Empty State
 *
 * - For empty lists
 * - Sad Bear
 */
export function BearEmpty() {
  return (
    <View style={styles.emptyContainer}>
      <Bear
        state={BearState.SAD}
        size={150}
        autoBlink={true}
        autoIdleBehaviors={false}
        interactive={true}
      />
    </View>
  );
}

/**
 * Global Bear Layer
 *
 * Use this at the app root level to have Bear persist across screens.
 * Reads state from BearContext.
 * Tracks bear interactions for badge progress.
 */
export function GlobalBear() {
  const { currentState, isVisible, position } = useBear();
  const { triggerEvent } = useCollection();

  // Track bear interactions for badges
  const handleBearPress = useCallback(() => {
    triggerEvent('BEAR_INTERACTION');
  }, [triggerEvent]);

  if (!isVisible) return null;

  return (
    <BearPositioned
      position={position}
      offset={{ x: 16, y: 80 }}
      state={currentState}
      size={100}
      autoBlink={true}
      autoIdleBehaviors={true}
      opacity={0.95}
      onPress={handleBearPress}
    />
  );
}

const styles = StyleSheet.create({
  onboardingBear: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
});
