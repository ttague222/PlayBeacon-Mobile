/**
 * useInterstitial Hook
 *
 * Manages interstitial ad loading and display.
 * Tracks game detail views and shows ads at appropriate intervals.
 * Gracefully handles Expo Go (where native ads aren't available).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import Constants from 'expo-constants';
import { useAds } from '../context/AdContext';
import { AD_UNIT_IDS } from '../config/admob';
import logger from '../utils/logger';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Flag to track if module load failed (prevents repeated attempts)
let nativeModuleLoadFailed = false;

// Lazy load ad components to prevent crashes at module initialization
// Called inside the hook, not at module import time
const getAdComponents = () => {
  if (isExpoGo || nativeModuleLoadFailed) {
    return { InterstitialAd: null, AdEventType: null };
  }
  try {
    const ads = require('react-native-google-mobile-ads');
    return { InterstitialAd: ads.InterstitialAd, AdEventType: ads.AdEventType };
  } catch (error) {
    logger.warn('InterstitialAd not available:', error?.message);
    nativeModuleLoadFailed = true;
    return { InterstitialAd: null, AdEventType: null };
  }
};

export function useInterstitial() {
  const { shouldShowAds, trackGameView, resetInterstitialCounter, isExpoGo: contextIsExpoGo } = useAds();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const interstitialRef = useRef(null);

  // Lazy load ad components on first hook call
  const { InterstitialAd, AdEventType } = getAdComponents();

  // Check if ads are available
  const adsAvailable = !isExpoGo && !contextIsExpoGo && InterstitialAd !== null;

  /**
   * Load a new interstitial ad
   */
  const loadAd = useCallback(() => {
    if (!adsAvailable || !shouldShowAds()) {
      return;
    }

    try {
      // Create new interstitial instance
      const interstitial = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL, {
        requestNonPersonalizedAdsOnly: true,
      });

      // Set up event listeners
      const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
        logger.log('Interstitial ad loaded');
        setIsLoaded(true);
      });

      const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        logger.log('Interstitial ad closed');
        setIsShowing(false);
        setIsLoaded(false);
        // Preload next ad
        loadAd();
      });

      const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
        logger.log('Interstitial ad error:', error);
        setIsLoaded(false);
      });

      // Store reference and load
      interstitialRef.current = {
        ad: interstitial,
        unsubscribeLoaded,
        unsubscribeClosed,
        unsubscribeError,
      };

      interstitial.load();
    } catch (error) {
      logger.error('Failed to create interstitial ad:', error);
    }
  }, [adsAvailable, shouldShowAds]);

  /**
   * Show interstitial if loaded
   * Returns true if ad was shown
   */
  const showAd = useCallback(async () => {
    if (!adsAvailable || !isLoaded || !interstitialRef.current?.ad) {
      logger.log('Interstitial not ready');
      return false;
    }

    try {
      setIsShowing(true);
      await interstitialRef.current.ad.show();
      resetInterstitialCounter();
      return true;
    } catch (error) {
      logger.error('Failed to show interstitial:', error);
      setIsShowing(false);
      return false;
    }
  }, [adsAvailable, isLoaded, resetInterstitialCounter]);

  /**
   * Check if we should show an interstitial and show it
   * Call this when user views a game detail
   */
  const showInterstitialIfNeeded = useCallback(async () => {
    if (!adsAvailable || !shouldShowAds()) {
      return false;
    }

    const shouldShow = trackGameView();

    if (shouldShow && isLoaded) {
      return await showAd();
    }

    return false;
  }, [adsAvailable, shouldShowAds, trackGameView, isLoaded, showAd]);

  // Load ad on mount if ads are enabled
  useEffect(() => {
    if (adsAvailable && shouldShowAds()) {
      loadAd();
    }

    // Cleanup on unmount
    return () => {
      if (interstitialRef.current) {
        interstitialRef.current.unsubscribeLoaded?.();
        interstitialRef.current.unsubscribeClosed?.();
        interstitialRef.current.unsubscribeError?.();
      }
    };
  }, [adsAvailable, shouldShowAds, loadAd]);

  return {
    isLoaded,
    isShowing,
    showAd,
    showInterstitialIfNeeded,
    loadAd,
    adsAvailable,
  };
}

export default useInterstitial;
