/**
 * Ad Context Provider
 *
 * Manages ad state and provides hooks for ad components.
 * Integrates with PremiumContext for premium/ad-free status.
 * Integrates with RemoteConfig for dynamic ad control (App Store review).
 *
 * Ad Frequency Logic:
 * - First 20 game recommendations each day are ad-free
 * - After 20 games, show interstitial every 5 games
 * - Resets daily at midnight (local time)
 *
 * Remote Config Flags:
 * - ads_enabled: Master toggle for ads (false during App Store review)
 * - ads_test_mode: Force test ads even in production builds
 *
 * NOTE: react-native-google-mobile-ads requires a native build (EAS Build).
 * In Expo Go, ads will be disabled gracefully.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePremium } from './PremiumContext';
import remoteConfig from '../services/RemoteConfig';
import logger from '../utils/logger';

// Check if we're running in Expo Go (where native modules aren't available)
const isExpoGo = Constants.appOwnership === 'expo';

// Storage key for daily ad tracking
const AD_TRACKING_KEY = '@playbeacon_ad_tracking';

// Ad frequency configuration
const AD_FREQUENCY_CONFIG = {
  freeGamesPerDay: 20,      // First 20 games are ad-free
  gamesPerAdAfterFree: 5,   // After free games, show ad every 5 games
  minTimeBetweenAds: 30000, // 30 seconds minimum between ads
};

const AdContext = createContext(null);

/**
 * Get today's date string in YYYY-MM-DD format (local time)
 */
function getTodayDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function AdProvider({ children }) {
  // Get premium status from PremiumContext
  const { isPremium: premiumStatus } = usePremium();

  const [isInitialized, setIsInitialized] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(!isExpoGo);
  const [remoteAdsEnabled, setRemoteAdsEnabled] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState(null);

  // Daily tracking state
  const [dailyGameCount, setDailyGameCount] = useState(0);
  const [trackingDate, setTrackingDate] = useState(getTodayDateString());
  const [gamesSinceLastAd, setGamesSinceLastAd] = useState(0);
  const lastInterstitialTime = useRef(0);
  const isLoadingTracking = useRef(true);

  // Update ads enabled based on premium status AND remote config
  useEffect(() => {
    if (!isExpoGo) {
      // Ads only enabled if: not premium AND remote config allows ads
      setAdsEnabled(!premiumStatus && remoteAdsEnabled);
    }
  }, [premiumStatus, remoteAdsEnabled]);

  // Initialize Remote Config and listen for changes
  useEffect(() => {
    const initRemoteConfig = async () => {
      await remoteConfig.initialize();
      setRemoteAdsEnabled(remoteConfig.areAdsEnabled());
      setIsTestMode(remoteConfig.isTestModeForced());
      logger.log(`[AdContext] Remote config: ads_enabled=${remoteConfig.areAdsEnabled()}, test_mode=${remoteConfig.isTestModeForced()}`);
    };

    initRemoteConfig();

    // Listen for remote config changes
    const unsubscribe = remoteConfig.addListener((config) => {
      setRemoteAdsEnabled(config.ads_enabled === true);
      setIsTestMode(config.ads_test_mode === true);
      logger.log('[AdContext] Remote config updated:', config);
    });

    return unsubscribe;
  }, []);

  /**
   * Load saved tracking data from AsyncStorage
   */
  const loadTrackingData = useCallback(async () => {
    try {
      const savedData = await AsyncStorage.getItem(AD_TRACKING_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const today = getTodayDateString();

        // Check if it's a new day - reset if so
        if (parsed.date === today) {
          setDailyGameCount(parsed.dailyGameCount || 0);
          setGamesSinceLastAd(parsed.gamesSinceLastAd || 0);
          setTrackingDate(today);
          logger.log(`[AdContext] Loaded tracking: ${parsed.dailyGameCount} games today, ${parsed.gamesSinceLastAd} since last ad`);
        } else {
          // New day - reset counters
          logger.log('[AdContext] New day detected, resetting ad counters');
          setDailyGameCount(0);
          setGamesSinceLastAd(0);
          setTrackingDate(today);
          await saveTrackingData(0, 0, today);
        }
      } else {
        // No saved data - initialize
        const today = getTodayDateString();
        setTrackingDate(today);
        await saveTrackingData(0, 0, today);
      }
    } catch (error) {
      logger.warn('[AdContext] Failed to load tracking data:', error);
    } finally {
      isLoadingTracking.current = false;
    }
  }, []);

  /**
   * Save tracking data to AsyncStorage
   */
  const saveTrackingData = useCallback(async (gameCount, sinceLastAd, date) => {
    try {
      const data = {
        date: date || getTodayDateString(),
        dailyGameCount: gameCount,
        gamesSinceLastAd: sinceLastAd,
        lastUpdated: Date.now(),
      };
      await AsyncStorage.setItem(AD_TRACKING_KEY, JSON.stringify(data));
    } catch (error) {
      logger.warn('[AdContext] Failed to save tracking data:', error);
    }
  }, []);

  /**
   * Check if it's a new day and reset if needed
   */
  const checkAndResetIfNewDay = useCallback(() => {
    const today = getTodayDateString();
    if (trackingDate !== today) {
      logger.log('[AdContext] New day detected during session, resetting counters');
      setDailyGameCount(0);
      setGamesSinceLastAd(0);
      setTrackingDate(today);
      saveTrackingData(0, 0, today);
      return true;
    }
    return false;
  }, [trackingDate, saveTrackingData]);

  /**
   * Initialize AdMob SDK for 16+ rated app
   */
  const initializeAds = useCallback(async () => {
    // Skip initialization in Expo Go
    if (isExpoGo) {
      logger.log('AdMob: Skipping initialization (running in Expo Go)');
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
          logger.log('Tracking permission not granted, showing non-personalized ads');
        }
      }

      // Ad request configuration for 16+ rated app
      const adConfig = {
        maxAdContentRating: MaxAdContentRating.T,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      };

      await mobileAds().setRequestConfiguration(adConfig);
      await mobileAds().initialize();

      logger.log('AdMob SDK initialized successfully');
      setIsInitialized(true);
    } catch (error) {
      logger.error('Failed to initialize AdMob:', error);
      setIsInitialized(false);
      setAdsEnabled(false);
    }
  }, []);

  // Load tracking data and initialize ads on mount
  useEffect(() => {
    loadTrackingData();
    initializeAds();
  }, [loadTrackingData, initializeAds]);

  /**
   * Track game recommendation view for interstitial ad logic
   *
   * Logic:
   * - First 20 games per day: No ads
   * - After 20 games: Show ad every 5 games
   *
   * @returns {boolean} Whether an ad should be shown
   */
  const trackGameView = useCallback(() => {
    // Skip if premium, ads disabled, or still loading
    if (premiumStatus || !adsEnabled || isExpoGo || isLoadingTracking.current) {
      return false;
    }

    // Check for new day
    checkAndResetIfNewDay();

    const newDailyCount = dailyGameCount + 1;
    const newSinceLastAd = gamesSinceLastAd + 1;

    // Update state
    setDailyGameCount(newDailyCount);
    setGamesSinceLastAd(newSinceLastAd);

    // Determine if we should show an ad
    const now = Date.now();
    const timeSinceLastAd = now - lastInterstitialTime.current;

    // Within free games period - no ads
    if (newDailyCount <= AD_FREQUENCY_CONFIG.freeGamesPerDay) {
      logger.log(`[AdContext] Game ${newDailyCount}/${AD_FREQUENCY_CONFIG.freeGamesPerDay} (free period)`);
      saveTrackingData(newDailyCount, newSinceLastAd, trackingDate);
      return false;
    }

    // After free period - check if we should show an ad
    const shouldShow =
      newSinceLastAd >= AD_FREQUENCY_CONFIG.gamesPerAdAfterFree &&
      timeSinceLastAd >= AD_FREQUENCY_CONFIG.minTimeBetweenAds;

    if (shouldShow) {
      logger.log(`[AdContext] Showing ad after game ${newDailyCount} (${newSinceLastAd} games since last ad)`);
      // Will be reset after ad is actually shown via resetInterstitialCounter
      return true;
    }

    logger.log(`[AdContext] Game ${newDailyCount}, ${newSinceLastAd}/${AD_FREQUENCY_CONFIG.gamesPerAdAfterFree} until next ad`);
    saveTrackingData(newDailyCount, newSinceLastAd, trackingDate);
    return false;
  }, [
    premiumStatus,
    adsEnabled,
    dailyGameCount,
    gamesSinceLastAd,
    trackingDate,
    checkAndResetIfNewDay,
    saveTrackingData,
  ]);

  /**
   * Reset counter after ad is shown
   */
  const resetInterstitialCounter = useCallback(() => {
    lastInterstitialTime.current = Date.now();
    setGamesSinceLastAd(0);
    saveTrackingData(dailyGameCount, 0, trackingDate);
    logger.log('[AdContext] Ad shown, reset games-since-last-ad counter');
  }, [dailyGameCount, trackingDate, saveTrackingData]);

  /**
   * Check if ads should currently be shown
   * Requires: initialized, not premium, not Expo Go, AND remote config enabled
   */
  const shouldShowAds = useCallback(() => {
    return isInitialized && adsEnabled && !premiumStatus && !isExpoGo && remoteAdsEnabled;
  }, [isInitialized, adsEnabled, premiumStatus, remoteAdsEnabled]);

  /**
   * Get current ad status info (for debugging/UI)
   */
  const getAdStatus = useCallback(() => {
    const gamesUntilFirstAd = Math.max(0, AD_FREQUENCY_CONFIG.freeGamesPerDay - dailyGameCount);
    const gamesUntilNextAd = dailyGameCount < AD_FREQUENCY_CONFIG.freeGamesPerDay
      ? gamesUntilFirstAd
      : Math.max(0, AD_FREQUENCY_CONFIG.gamesPerAdAfterFree - gamesSinceLastAd);

    return {
      dailyGameCount,
      gamesSinceLastAd,
      freeGamesRemaining: gamesUntilFirstAd,
      gamesUntilNextAd,
      isInFreePeriod: dailyGameCount < AD_FREQUENCY_CONFIG.freeGamesPerDay,
      config: AD_FREQUENCY_CONFIG,
      remoteAdsEnabled,
      isTestMode,
    };
  }, [dailyGameCount, gamesSinceLastAd, remoteAdsEnabled, isTestMode]);

  const value = {
    isInitialized,
    isPremium: premiumStatus,
    adsEnabled,
    remoteAdsEnabled,
    isTestMode,
    trackingStatus,
    isExpoGo,
    shouldShowAds,
    trackGameView,
    resetInterstitialCounter,
    initializeAds,
    getAdStatus,
    // Expose daily tracking for UI purposes
    dailyGameCount,
    freeGamesRemaining: Math.max(0, AD_FREQUENCY_CONFIG.freeGamesPerDay - dailyGameCount),
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
