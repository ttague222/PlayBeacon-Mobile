/**
 * useBadgeEvents Hook
 *
 * Provides easy-to-use methods for triggering badge events
 * throughout the app.
 */

import { useCallback, useEffect } from 'react';
import { useCollection } from '../context/CollectionContext';
import { BadgeEventType } from '../types/badges';

/**
 * Main hook for triggering badge events
 */
export function useBadgeEvents() {
  const { triggerEvent, checkDailyLogin, pendingUnlocks } = useCollection();

  // Trigger on app launch
  useEffect(() => {
    checkDailyLogin();
  }, [checkDailyLogin]);

  // Event triggers
  const onViewGame = useCallback(() => {
    triggerEvent('VIEW_GAME');
  }, [triggerEvent]);

  const onAddToWishlist = useCallback(() => {
    triggerEvent('ADD_TO_WISHLIST');
  }, [triggerEvent]);

  const onRemoveFromWishlist = useCallback(() => {
    triggerEvent('REMOVE_FROM_WISHLIST');
  }, [triggerEvent]);

  const onSwipeDiscovery = useCallback(() => {
    triggerEvent('SWIPE_DISCOVERY');
  }, [triggerEvent]);

  const onBearInteraction = useCallback(() => {
    triggerEvent('BEAR_INTERACTION');
  }, [triggerEvent]);

  const onCreateCollection = useCallback(() => {
    triggerEvent('CREATE_COLLECTION');
  }, [triggerEvent]);

  const onTapRecommendation = useCallback(() => {
    triggerEvent('TAP_RECOMMENDATION');
  }, [triggerEvent]);

  const onCompleteTutorial = useCallback(() => {
    triggerEvent('COMPLETE_TUTORIAL');
  }, [triggerEvent]);

  return {
    onViewGame,
    onAddToWishlist,
    onRemoveFromWishlist,
    onSwipeDiscovery,
    onBearInteraction,
    onCreateCollection,
    onTapRecommendation,
    onCompleteTutorial,
    triggerEvent,
    hasPendingUnlocks: pendingUnlocks.length > 0,
  };
}

/**
 * Hook specifically for game viewing tracking
 */
export function useGameViewTracking() {
  const { triggerEvent } = useCollection();

  const trackGameView = useCallback(() => {
    triggerEvent('VIEW_GAME');
  }, [triggerEvent]);

  const trackRecommendationTap = useCallback(() => {
    triggerEvent('TAP_RECOMMENDATION');
  }, [triggerEvent]);

  return { trackGameView, trackRecommendationTap };
}

/**
 * Hook specifically for wishlist tracking
 */
export function useWishlistTracking() {
  const { triggerEvent } = useCollection();

  const trackAddToWishlist = useCallback(() => {
    triggerEvent('ADD_TO_WISHLIST');
  }, [triggerEvent]);

  const trackRemoveFromWishlist = useCallback(() => {
    triggerEvent('REMOVE_FROM_WISHLIST');
  }, [triggerEvent]);

  return { trackAddToWishlist, trackRemoveFromWishlist };
}

/**
 * Hook specifically for discovery/swipe tracking
 */
export function useDiscoveryTracking() {
  const { triggerEvent } = useCollection();

  const trackSwipe = useCallback(() => {
    triggerEvent('SWIPE_DISCOVERY');
  }, [triggerEvent]);

  return { trackSwipe };
}

/**
 * Hook specifically for Bear interaction tracking
 */
export function useBearTracking() {
  const { triggerEvent } = useCollection();

  const trackBearInteraction = useCallback(() => {
    triggerEvent('BEAR_INTERACTION');
  }, [triggerEvent]);

  return { trackBearInteraction };
}

/**
 * Hook specifically for collection tracking
 */
export function useCollectionTracking() {
  const { triggerEvent } = useCollection();

  const trackCollectionCreate = useCallback(() => {
    triggerEvent('CREATE_COLLECTION');
  }, [triggerEvent]);

  return { trackCollectionCreate };
}

export default useBadgeEvents;
