/**
 * Ad Context Provider
 *
 * Manages ad state, premium user logic, and provides hooks for ad components.
 * Integrates with Firebase for premium status and RevenueCat for purchases.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import mobileAds, { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { useAuth } from './AuthContext';
import { COPPA_REQUEST_CONFIG, INTERSTITIAL_CONFIG } from '../config/admob';

const AdContext = createContext(null);

export function AdProvider({ children }) {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [trackingStatus, setTrackingStatus] = useState(null);

  // Interstitial tracking
  const gameViewCount = useRef(0);
  const lastInterstitialTime = useRef(0);

  /**
   * Initialize AdMob SDK with COPPA-compliant settings
   */
  const initializeAds = useCallback(async () => {
    try {
      // Request iOS App Tracking Transparency permission
      if (Platform.OS === 'ios') {
        const { status } = await requestTrackingPermissionsAsync();
        setTrackingStatus(status);

        // If user denies tracking, we still show ads but non-personalized
        if (status !== 'granted') {
          console.log('Tracking permission not granted, showing non-personalized ads');
        }
      }

      // Set COPPA-compliant request configuration
      await mobileAds().setRequestConfiguration(COPPA_REQUEST_CONFIG);

      // Initialize the Mobile Ads SDK
      await mobileAds().initialize();

      console.log('AdMob SDK initialized successfully');
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
      // Fail silently - ads just won't show
      setIsInitialized(false);
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
      // Check Firestore user document for premium status
      // This would be set by RevenueCat webhook or manual admin action
      // For now, check a simple flag on the user profile
      const userIsPremium = user.isPremium || false;
      setIsPremium(userIsPremium);
      setAdsEnabled(!userIsPremium);
    } catch (error) {
      console.error('Failed to check premium status:', error);
      setIsPremium(false);
    }
  }, [user]);

  // Initialize ads on mount
  useEffect(() => {
    initializeAds();
  }, [initializeAds]);

  // Check premium status when user changes
  useEffect(() => {
    checkPremiumStatus();
  }, [checkPremiumStatus]);

  /**
   * Track game detail view for interstitial ad logic
   * Returns true if an interstitial should be shown
   */
  const trackGameView = useCallback(() => {
    if (isPremium || !adsEnabled) {
      return false;
    }

    gameViewCount.current += 1;
    const now = Date.now();
    const timeSinceLastAd = now - lastInterstitialTime.current;

    // Check if we should show an interstitial
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

  /**
   * Reset interstitial counter (e.g., after showing an ad)
   */
  const resetInterstitialCounter = useCallback(() => {
    gameViewCount.current = 0;
    lastInterstitialTime.current = Date.now();
  }, []);

  /**
   * Manually set premium status (for RevenueCat integration)
   */
  const setPremiumStatus = useCallback((status) => {
    setIsPremium(status);
    setAdsEnabled(!status);
  }, []);

  /**
   * Check if ads should be shown
   */
  const shouldShowAds = useCallback(() => {
    return isInitialized && adsEnabled && !isPremium;
  }, [isInitialized, adsEnabled, isPremium]);

  const value = {
    isInitialized,
    isPremium,
    adsEnabled,
    trackingStatus,
    shouldShowAds,
    trackGameView,
    resetInterstitialCounter,
    setPremiumStatus,
    initializeAds,
  };

  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}

/**
 * Hook to access ad context
 */
export function useAds() {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
}

export default AdContext;
