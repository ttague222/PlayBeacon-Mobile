/**
 * AdMob Configuration
 *
 * Ad configuration for 16+ rated app.
 * Uses test IDs in development, real IDs in production.
 * Gracefully handles Expo Go (where native ads aren't available).
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import logger from '../utils/logger';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Dynamically import MaxAdContentRating only when not in Expo Go
let MaxAdContentRating = null;

if (!isExpoGo) {
  try {
    MaxAdContentRating = require('react-native-google-mobile-ads').MaxAdContentRating;
  } catch (error) {
    logger.log('MaxAdContentRating not available - running in Expo Go');
  }
}

// Google's official test ad unit IDs
const TEST_IDS = {
  BANNER_IOS: 'ca-app-pub-3940256099942544/2934735716',
  BANNER_ANDROID: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL_IOS: 'ca-app-pub-3940256099942544/4411468910',
  INTERSTITIAL_ANDROID: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED_IOS: 'ca-app-pub-3940256099942544/1712485313',
  REWARDED_ANDROID: 'ca-app-pub-3940256099942544/5224354917',
};

// Production ad unit IDs from environment variables
const PROD_IDS = {
  BANNER_IOS: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID_IOS,
  BANNER_ANDROID: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID_ANDROID,
  INTERSTITIAL_IOS: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID_IOS,
  INTERSTITIAL_ANDROID: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID_ANDROID,
  REWARDED_IOS: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID_IOS,
  REWARDED_ANDROID: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID_ANDROID,
};

/**
 * Get ad unit ID based on development mode OR forced test mode
 * Test mode can be forced via Remote Config (ads_test_mode flag)
 */
const getAdUnitId = (iosId, androidId, testIosId, testAndroidId, forceTestMode = false) => {
  if (__DEV__ || forceTestMode) {
    return Platform.OS === 'ios' ? testIosId : testAndroidId;
  }
  return Platform.OS === 'ios' ? iosId : androidId;
};

/**
 * Get ad unit IDs dynamically based on test mode flag
 * @param {boolean} forceTestMode - Whether to force test ads (from Remote Config)
 */
export const getAdUnitIds = (forceTestMode = false) => ({
  BANNER: getAdUnitId(
    PROD_IDS.BANNER_IOS,
    PROD_IDS.BANNER_ANDROID,
    TEST_IDS.BANNER_IOS,
    TEST_IDS.BANNER_ANDROID,
    forceTestMode
  ),
  INTERSTITIAL: getAdUnitId(
    PROD_IDS.INTERSTITIAL_IOS,
    PROD_IDS.INTERSTITIAL_ANDROID,
    TEST_IDS.INTERSTITIAL_IOS,
    TEST_IDS.INTERSTITIAL_ANDROID,
    forceTestMode
  ),
  REWARDED: getAdUnitId(
    PROD_IDS.REWARDED_IOS,
    PROD_IDS.REWARDED_ANDROID,
    TEST_IDS.REWARDED_IOS,
    TEST_IDS.REWARDED_ANDROID,
    forceTestMode
  ),
});

// Static export for backwards compatibility (uses __DEV__ only)
export const AD_UNIT_IDS = getAdUnitIds(false);

// Export test IDs separately for components that need them directly
export { TEST_IDS };

/**
 * Ad request configuration for 16+ rated app
 *
 * Note: When running in Expo Go, MaxAdContentRating won't be available.
 * The actual config is only used when initializing AdMob in a native build.
 */
export const AD_REQUEST_CONFIG = MaxAdContentRating
  ? {
      // Set max ad content rating to 'T' for Teen audiences (16+)
      maxAdContentRating: MaxAdContentRating.T,
      // Not a child-directed app (16+ rating)
      tagForChildDirectedTreatment: false,
      // Not targeting users under age of consent (16+ rating)
      tagForUnderAgeOfConsent: false,
    }
  : {
      // Fallback config for Expo Go (won't be used but prevents errors)
      maxAdContentRating: 'T',
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    };

/**
 * Interstitial ad configuration
 */
export const INTERSTITIAL_CONFIG = {
  // Number of game detail views before showing an interstitial
  viewsBeforeAd: 4,
  // Minimum time between interstitials (in milliseconds)
  minTimeBetweenAds: 60000, // 1 minute
};

/**
 * Whether we're running in Expo Go (ads not available)
 */
export const IS_EXPO_GO = isExpoGo;
