/**
 * Ad Context Provider
 *
 * Manages ad state, premium user logic, and provides hooks for ad components.
 * Integrates with Firebase for premium status and RevenueCat for purchases.
 *
 * NOTE: react-native-google-mobile-ads requires a native build (EAS Build).
 * In Expo Go, ads will be disabled gracefully.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';

// Check if we're running in Expo Go (where native modules aren't available)
const isExpoGo = Constants.appOwnership === 'expo';

// Interstitial config - duplicated here to avoid importing from admob.js which may trigger native imports
const INTERSTITIAL_CONFIG = {
  viewsBeforeAd: 4,
  minTimeBetweenAds: 60000,
};

const AdContext = createContext(null);

export function AdProvider({ children }) {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(!isExpoGo);
  const [trackingStatus, setTrackingStatus] = useState(null);

  // Interstitial tracking
  const gameViewCount = useRef(0);
  const lastInterstitialTime = useRef(0);

  /**
   * Initialize AdMob SDK with COPPA-compliant settings
   */
  const initializeAds = useCallback(async () => {
    // Skip initialization in Expo Go
    if (isExpoGo) {
      console.log('AdMob: Skipping initialization (running in Expo Go)');
      setIsInitialized(false);
      setAdsEnabled(false);
      return;
    }

    try {
      // Dynamically import native modules
      const mobileAds = require('react-native-google-mobile-ads').default;
      const { MaxAdContentRating } = require('react-native-google-mobile-ads');
      const { requestTrackingPermissionsAsync } = require('expo-tracking-transparency');

      // Request iOS App Tracking Transparency permission
      if (Platform.OS === 'ios') {
        const { status } = await requestTrackingPermissionsAsync();
        setTrackingStatus(status);

        if (status !== 'granted') {
          console.log('Tracking permission not granted, showing non-personalized ads');
        }
      }

      // COPPA-compliant request configuration
      const coppaConfig = {
        maxAdContentRating: MaxAdContentRating.G,
        tagForChildDirectedTreatment: true,
        tagForUnderAgeOfConsent: true,
      };

      await mobileAds().setRequestConfiguration(coppaConfig);
      await mobileAds().initialize();

      console.log('AdMob SDK initialized successfully');
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
      setIsInitialized(false);
      setAdsEnabled(false);
    }
  }, []);

  /**
   * Check if user has premium status (Remove Ads)
   */
  const checkPremiumStatus = useCallback(async () => {
    if (!user) {
      setIsPremium(false);
      return;
    }

    try {
      const userIsPremium = user.isPremium || false;
      setIsPremium(userIsPremium);
      if (!isExpoGo) {
        setAdsEnabled(!userIsPremium);
      }
    } catch (error) {
      console.error('Failed to check premium status:', error);
      setIsPremium(false);
    }
  }, [user]);

  useEffect(() => {
    initializeAds();
  }, [initializeAds]);

  useEffect(() => {
    checkPremiumStatus();
  }, [checkPremiumStatus]);

  /**
   * Track game detail view for interstitial ad logic
   */
  const trackGameView = useCallback(() => {
    if (isPremium || !adsEnabled || isExpoGo) {
      return false;
    }

    gameViewCount.current += 1;
    const now = Date.now();
    const timeSinceLastAd = now - lastInterstitialTime.current;

    const shouldShow =
      gameViewCount.current >= INTERSTITIAL_CONFIG.viewsBeforeAd &&
      timeSinceLastAd >= INTERSTITIAL_CONFIG.minTimeBetweenAds;

    if (shouldShow) {
      gameViewCount.current = 0;
      lastInterstitialTime.current = now;
      return true;
    }

    return false;
  }, [isPremium, adsEnabled]);

  const resetInterstitialCounter = useCallback(() => {
    gameViewCount.current = 0;
    lastInterstitialTime.current = Date.now();
  }, []);

  const setPremiumStatus = useCallback((status) => {
    setIsPremium(status);
    if (!isExpoGo) {
      setAdsEnabled(!status);
    }
  }, []);

  const shouldShowAds = useCallback(() => {
    return isInitialized && adsEnabled && !isPremium && !isExpoGo;
  }, [isInitialized, adsEnabled, isPremium]);

  const value = {
    isInitialized,
    isPremium,
    adsEnabled,
    trackingStatus,
    isExpoGo,
    shouldShowAds,
    trackGameView,
    resetInterstitialCounter,
    setPremiumStatus,
    initializeAds,
  };

  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}

export function useAds() {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
}

export default AdContext;
