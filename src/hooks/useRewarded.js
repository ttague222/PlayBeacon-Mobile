/**
 * useRewarded Hook
 *
 * Manages rewarded ad loading and display.
 * Provides callbacks for reward completion.
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
    return { RewardedAd: null, RewardedAdEventType: null, AdEventType: null };
  }
  try {
    const ads = require('react-native-google-mobile-ads');
    return {
      RewardedAd: ads.RewardedAd,
      RewardedAdEventType: ads.RewardedAdEventType,
      AdEventType: ads.AdEventType,
    };
  } catch (error) {
    logger.warn('RewardedAd not available:', error?.message);
    nativeModuleLoadFailed = true;
    return { RewardedAd: null, RewardedAdEventType: null, AdEventType: null };
  }
};

// Max retry attempts for loading ads
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000;

export function useRewarded() {
  const { shouldShowAds, isExpoGo: contextIsExpoGo } = useAds();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const rewardedRef = useRef(null);
  const onRewardRef = useRef(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef(null);

  // Lazy load ad components on first hook call
  const { RewardedAd, RewardedAdEventType, AdEventType } = getAdComponents();

  // Check if ads are available
  const adsAvailable = !isExpoGo && !contextIsExpoGo && RewardedAd !== null;

  /**
   * Load a new rewarded ad with retry support
   */
  const loadAd = useCallback(() => {
    if (!adsAvailable || !shouldShowAds() || isLoading) {
      logger.log('Rewarded ad: skipping load', { adsAvailable, shouldShowAds: shouldShowAds?.(), isLoading });
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);

      logger.log('Rewarded ad: creating ad request with unit ID:', AD_UNIT_IDS.REWARDED);

      // Create new rewarded ad instance
      const rewarded = RewardedAd.createForAdRequest(AD_UNIT_IDS.REWARDED, {
        requestNonPersonalizedAdsOnly: true,
      });

      // Set up event listeners
      const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        logger.log('Rewarded ad loaded successfully');
        setIsLoaded(true);
        setIsLoading(false);
        setLoadError(null);
        retryCountRef.current = 0; // Reset retry count on success
      });

      const unsubscribeEarned = rewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          logger.log('User earned reward:', reward);
          // Call the reward callback if set
          if (onRewardRef.current) {
            onRewardRef.current(reward);
            onRewardRef.current = null;
          }
        }
      );

      const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        logger.log('Rewarded ad closed');
        setIsShowing(false);
        setIsLoaded(false);
        retryCountRef.current = 0; // Reset retry count
        // Preload next ad
        loadAd();
      });

      const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
        logger.log('Rewarded ad error:', error?.message || error);
        setIsLoaded(false);
        setIsLoading(false);
        setLoadError(error?.message || 'Failed to load ad');

        // Retry loading if we haven't exceeded max attempts
        if (retryCountRef.current < MAX_RETRY_ATTEMPTS) {
          retryCountRef.current += 1;
          logger.log(`Rewarded ad: retrying (attempt ${retryCountRef.current}/${MAX_RETRY_ATTEMPTS}) in ${RETRY_DELAY_MS}ms`);
          retryTimeoutRef.current = setTimeout(() => {
            loadAd();
          }, RETRY_DELAY_MS);
        } else {
          logger.log('Rewarded ad: max retry attempts reached');
        }
      });

      // Store reference and load
      rewardedRef.current = {
        ad: rewarded,
        unsubscribeLoaded,
        unsubscribeEarned,
        unsubscribeClosed,
        unsubscribeError,
      };

      rewarded.load();
    } catch (error) {
      logger.error('Failed to create rewarded ad:', error);
      setIsLoading(false);
      setLoadError(error?.message || 'Failed to create ad');
    }
  }, [adsAvailable, shouldShowAds, isLoading]);

  /**
   * Show rewarded ad with callback for reward
   * @param {Function} onReward - Callback when user earns reward
   * @returns {Promise<boolean>} - Whether ad was shown
   */
  const showAd = useCallback(
    async (onReward) => {
      if (!adsAvailable || !isLoaded || !rewardedRef.current?.ad) {
        logger.log('Rewarded ad not ready');
        return false;
      }

      try {
        // Store reward callback
        onRewardRef.current = onReward;
        setIsShowing(true);
        await rewardedRef.current.ad.show();
        return true;
      } catch (error) {
        logger.error('Failed to show rewarded ad:', error);
        setIsShowing(false);
        onRewardRef.current = null;
        return false;
      }
    },
    [adsAvailable, isLoaded]
  );

  /**
   * Convenience method to show ad and handle reward
   * Returns a promise that resolves when user completes the ad
   */
  const showRewardedAd = useCallback(
    (onReward) => {
      return new Promise((resolve, reject) => {
        if (!adsAvailable) {
          reject(new Error('Ads not available'));
          return;
        }
        if (!isLoaded) {
          reject(new Error('Rewarded ad not loaded'));
          return;
        }

        showAd((reward) => {
          if (onReward) {
            onReward(reward);
          }
          resolve(reward);
        }).catch(reject);
      });
    },
    [adsAvailable, isLoaded, showAd]
  );

  // Load ad on mount if ads are enabled
  useEffect(() => {
    if (adsAvailable && shouldShowAds()) {
      loadAd();
    }

    // Cleanup on unmount
    return () => {
      // Clear any pending retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (rewardedRef.current) {
        rewardedRef.current.unsubscribeLoaded?.();
        rewardedRef.current.unsubscribeEarned?.();
        rewardedRef.current.unsubscribeClosed?.();
        rewardedRef.current.unsubscribeError?.();
      }
    };
  }, [adsAvailable, shouldShowAds, loadAd]);

  return {
    isLoaded,
    isShowing,
    isLoading,
    loadError,
    showAd,
    showRewardedAd,
    loadAd,
    adsAvailable,
  };
}

export default useRewarded;
