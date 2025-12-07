/**
 * PlayBeacon Banner Ad Component
 *
 * A reusable banner ad component that:
 * - Automatically detects iOS/Android and loads correct Ad Unit ID
 * - Hides when user is premium
 * - Fails silently if ads can't load
 * - Supports smart banner sizing
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useAds } from '../../context/AdContext';
import { AD_UNIT_IDS } from '../../config/admob';

export default function PlayBeaconBannerAd({
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
  style,
  containerStyle,
}) {
  const { shouldShowAds, isInitialized } = useAds();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  // Don't render if ads shouldn't be shown or SDK not initialized
  if (!shouldShowAds() || !isInitialized) {
    return null;
  }

  // Don't render if ad failed to load
  if (adError) {
    return null;
  }

  return (
    <View style={[styles.container, containerStyle, !adLoaded && styles.hidden]}>
      <BannerAd
        unitId={AD_UNIT_IDS.BANNER}
        size={size}
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
