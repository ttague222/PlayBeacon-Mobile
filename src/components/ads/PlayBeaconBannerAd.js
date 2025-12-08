/**
 * PlayBeacon Banner Ad Component
 *
 * A reusable banner ad component that:
 * - Automatically detects iOS/Android and loads correct Ad Unit ID
 * - Hides when user is premium
 * - Fails silently if ads can't load
 * - Supports smart banner sizing
 * - Gracefully handles Expo Go (where native ads aren't available)
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { useAds } from '../../context/AdContext';
import { AD_UNIT_IDS } from '../../config/admob';

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
    console.log('BannerAd not available - running in Expo Go');
  }
}

export default function PlayBeaconBannerAd({
  size,
  style,
  containerStyle,
}) {
  const { shouldShowAds, isInitialized, isExpoGo: contextIsExpoGo } = useAds();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  // Don't render in Expo Go or if native modules aren't available
  if (isExpoGo || contextIsExpoGo || !BannerAd) {
    return null;
  }

  // Don't render if ads shouldn't be shown or SDK not initialized
  if (!shouldShowAds() || !isInitialized) {
    return null;
  }

  // Don't render if ad failed to load
  if (adError) {
    return null;
  }

  // Use default size if not provided
  const bannerSize = size || (BannerAdSize ? BannerAdSize.ANCHORED_ADAPTIVE_BANNER : 'ANCHORED_ADAPTIVE_BANNER');

  return (
    <View style={[styles.container, containerStyle, !adLoaded && styles.hidden]}>
      <BannerAd
        unitId={AD_UNIT_IDS.BANNER}
        size={bannerSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
          setAdLoaded(true);
        }}
        onAdFailedToLoad={(error) => {
          console.log('Banner ad failed to load:', error);
          setAdError(true);
        }}
        onAdOpened={() => {
          console.log('Banner ad opened');
        }}
        onAdClosed={() => {
          console.log('Banner ad closed');
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
