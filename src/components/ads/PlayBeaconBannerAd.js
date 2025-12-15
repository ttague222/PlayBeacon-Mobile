/**
 * PlayBeacon Banner Ad Component
 *
 * A reusable banner ad component that:
 * - Automatically detects iOS/Android and loads correct Ad Unit ID
 * - Hides when user is premium
 * - Retries loading on failure with exponential backoff (max 3 retries)
 * - Supports smart banner sizing
 * - Gracefully handles Expo Go (where native ads aren't available)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { useAds } from '../../context/AdContext';
import { AD_UNIT_IDS } from '../../config/admob';
import logger from '../../utils/logger';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Flag to track if we've attempted to load and it failed
let nativeModuleLoadFailed = false;

// Lazy load ad components to prevent crashes at module initialization
// These are loaded on first render, not at import time
const getAdComponents = () => {
  if (isExpoGo || nativeModuleLoadFailed) {
    return { BannerAd: null, BannerAdSize: null };
  }
  try {
    const ads = require('react-native-google-mobile-ads');
    return { BannerAd: ads.BannerAd, BannerAdSize: ads.BannerAdSize };
  } catch (error) {
    console.warn('BannerAd not available:', error?.message);
    nativeModuleLoadFailed = true;
    return { BannerAd: null, BannerAdSize: null };
  }
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds

export default function PlayBeaconBannerAd({
  size,
  style,
  containerStyle,
}) {
  const { shouldShowAds, isInitialized, isExpoGo: contextIsExpoGo } = useAds();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adKey, setAdKey] = useState(0); // Used to force re-render and retry
  const [retryCount, setRetryCount] = useState(0);
  const [permanentError, setPermanentError] = useState(false);
  const retryTimeoutRef = useRef(null);

  // Lazy load ad components on first render
  const { BannerAd, BannerAdSize } = getAdComponents();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleAdFailedToLoad = useCallback((error) => {
    logger.log(`Banner ad failed to load (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error);
    setAdLoaded(false);

    if (retryCount < MAX_RETRIES) {
      // Calculate delay with exponential backoff: 2s, 4s, 8s
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      logger.log(`Retrying banner ad in ${delay / 1000}s...`);

      retryTimeoutRef.current = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setAdKey((prev) => prev + 1); // Force re-render to retry loading
      }, delay);
    } else {
      logger.log('Banner ad max retries reached, giving up');
      setPermanentError(true);
    }
  }, [retryCount]);

  const handleAdLoaded = useCallback(() => {
    logger.log('Banner ad loaded successfully');
    setAdLoaded(true);
    setRetryCount(0); // Reset retry count on success
  }, []);

  // Don't render in Expo Go or if native modules aren't available
  if (isExpoGo || contextIsExpoGo || !BannerAd) {
    return null;
  }

  // Don't render if ads shouldn't be shown or SDK not initialized
  if (!shouldShowAds() || !isInitialized) {
    return null;
  }

  // Don't render if we've exhausted all retries
  if (permanentError) {
    return null;
  }

  // Use default size if not provided
  const bannerSize = size || (BannerAdSize ? BannerAdSize.ANCHORED_ADAPTIVE_BANNER : 'ANCHORED_ADAPTIVE_BANNER');

  return (
    <View style={[styles.container, containerStyle, !adLoaded && styles.hidden]}>
      <BannerAd
        key={adKey}
        unitId={AD_UNIT_IDS.BANNER}
        size={bannerSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
        onAdOpened={() => {
          logger.log('Banner ad opened');
        }}
        onAdClosed={() => {
          logger.log('Banner ad closed');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  hidden: {
    opacity: 0,
    height: 0,
  },
});
