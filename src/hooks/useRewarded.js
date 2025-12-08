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

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Dynamically import RewardedAd only when not in Expo Go
let RewardedAd = null;
let RewardedAdEventType = null;
let AdEventType = null;

if (!isExpoGo) {
  try {
    const ads = require('react-native-google-mobile-ads');
    RewardedAd = ads.RewardedAd;
    RewardedAdEventType = ads.RewardedAdEventType;
    AdEventType = ads.AdEventType;
  } catch (error) {
    console.log('RewardedAd not available - running in Expo Go');
  }
}

export function useRewarded() {
  const { shouldShowAds, isExpoGo: contextIsExpoGo } = useAds();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const rewardedRef = useRef(null);
  const onRewardRef = useRef(null);

  // Check if ads are available
  const adsAvailable = !isExpoGo && !contextIsExpoGo && RewardedAd !== null;

  /**
   * Load a new rewarded ad
   */
  const loadAd = useCallback(() => {
    if (!adsAvailable || !shouldShowAds() || isLoading) {
      return;
    }

    try {
      setIsLoading(true);

      // Create new rewarded ad instance
      const rewarded = RewardedAd.createForAdRequest(AD_UNIT_IDS.REWARDED, {
        requestNonPersonalizedAdsOnly: true,
      });

      // Set up event listeners
      const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('Rewarded ad loaded');
        setIsLoaded(true);
        setIsLoading(false);
      });

      const unsubscribeEarned = rewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          console.log('User earned reward:', reward);
          // Call the reward callback if set
          if (onRewardRef.current) {
            onRewardRef.current(reward);
            onRewardRef.current = null;
          }
        }
      );

      const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('Rewarded ad closed');
        setIsShowing(false);
        setIsLoaded(false);
        // Preload next ad
        loadAd();
      });

      const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
        console.log('Rewarded ad error:', error);
        setIsLoaded(false);
        setIsLoading(false);
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
      console.error('Failed to create rewarded ad:', error);
      setIsLoading(false);
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
        console.log('Rewarded ad not ready');
        return false;
      }

      try {
        // Store reward callback
        onRewardRef.current = onReward;
        setIsShowing(true);
        await rewardedRef.current.ad.show();
        return true;
      } catch (error) {
        console.error('Failed to show rewarded ad:', error);
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
    showAd,
    showRewardedAd,
    loadAd,
    adsAvailable,
  };
}

export default useRewarded;
