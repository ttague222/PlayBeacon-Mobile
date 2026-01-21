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
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { useAds } from '../../context/AdContext';
import { getAdUnitIds } from '../../config/admob';
import { colors } from '../../styles/colors';
import logger from '../../utils/logger';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Dynamically import BannerAd only when not in Expo Go
let BannerAd = null;
let BannerAdSize = null;

if (!isExpoGo) {
  try {
    const ads = require('react-native-google-mobile-ads');
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
  } catch (error) {
    logger.log('BannerAd not available - running in Expo Go');
  }
}

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds

export default function PlayBeaconBannerAd({
  size,
  style,
  containerStyle,
}) {
  const { t } = useTranslation();
  const { shouldShowAds, isInitialized, isExpoGo: contextIsExpoGo, isTestMode } = useAds();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adKey, setAdKey] = useState(0); // Used to force re-render and retry
  const [retryCount, setRetryCount] = useState(0);
  const [permanentError, setPermanentError] = useState(false);
  const retryTimeoutRef = useRef(null);

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

  // Get ad unit ID based on test mode from Remote Config
  const adUnitId = getAdUnitIds(isTestMode).BANNER;

  return (
    <View style={[styles.container, containerStyle, !adLoaded && styles.hidden]}>
      {/* Ad disclosure label for transparency */}
      {adLoaded && (
        <Text style={styles.adLabel}>{t('components.adLabel')}</Text>
      )}
      <BannerAd
        key={adKey}
        unitId={adUnitId}
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
  adLabel: {
    fontSize: 10,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
