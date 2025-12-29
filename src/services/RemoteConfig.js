/**
 * Remote Config Service
 *
 * Manages remote configuration for feature flags including:
 * - ads_enabled: Controls whether ads are shown (for App Store review)
 * - ads_test_mode: Forces test ads even in production builds
 *
 * Uses Firebase Remote Config with local fallback values.
 * This allows toggling ads ON after Apple approval without app resubmission.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';

// Storage key for caching remote config
const REMOTE_CONFIG_CACHE_KEY = '@playbeacon_remote_config';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Default values - used if remote fetch fails
// IMPORTANT: Set ads_enabled to false for App Store submission
const DEFAULT_CONFIG = {
  ads_enabled: false,        // Set to false for App Store review
  ads_test_mode: true,       // Force test ads during review
  min_app_version: '1.0.0',  // Minimum supported app version
  maintenance_mode: false,   // Emergency kill switch
};

// Remote config endpoint (use your API or Firebase)
// For now, we'll use a simple approach that can be updated later
const REMOTE_CONFIG_URL = process.env.EXPO_PUBLIC_REMOTE_CONFIG_URL;

class RemoteConfigService {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.lastFetchTime = 0;
    this.isInitialized = false;
    this.listeners = new Set();
  }

  /**
   * Initialize remote config - load cached values and fetch fresh ones
   */
  async initialize() {
    try {
      // Load cached config first for instant availability
      await this.loadCachedConfig();

      // Fetch fresh config in background
      this.fetchRemoteConfig();

      this.isInitialized = true;
      logger.log('[RemoteConfig] Initialized with config:', this.config);
    } catch (error) {
      logger.error('[RemoteConfig] Initialization failed:', error);
      // Use defaults on error
      this.config = { ...DEFAULT_CONFIG };
      this.isInitialized = true;
    }
  }

  /**
   * Load cached config from AsyncStorage
   */
  async loadCachedConfig() {
    try {
      const cached = await AsyncStorage.getItem(REMOTE_CONFIG_CACHE_KEY);
      if (cached) {
        const { config, timestamp } = JSON.parse(cached);
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.lastFetchTime = timestamp;
        logger.log('[RemoteConfig] Loaded cached config');
      }
    } catch (error) {
      logger.warn('[RemoteConfig] Failed to load cached config:', error);
    }
  }

  /**
   * Fetch remote config from server
   */
  async fetchRemoteConfig() {
    // Skip fetch if no URL configured or recently fetched
    if (!REMOTE_CONFIG_URL) {
      logger.log('[RemoteConfig] No remote URL configured, using defaults');
      return;
    }

    const now = Date.now();
    if (now - this.lastFetchTime < CACHE_EXPIRY_MS) {
      logger.log('[RemoteConfig] Using cached config (not expired)');
      return;
    }

    try {
      const response = await fetch(REMOTE_CONFIG_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const remoteConfig = await response.json();
      this.config = { ...DEFAULT_CONFIG, ...remoteConfig };
      this.lastFetchTime = now;

      // Cache the config
      await AsyncStorage.setItem(
        REMOTE_CONFIG_CACHE_KEY,
        JSON.stringify({ config: this.config, timestamp: now })
      );

      logger.log('[RemoteConfig] Fetched fresh config:', this.config);

      // Notify listeners
      this.notifyListeners();
    } catch (error) {
      logger.warn('[RemoteConfig] Failed to fetch remote config:', error);
      // Keep using cached/default values
    }
  }

  /**
   * Get a config value
   */
  getValue(key) {
    return this.config[key] ?? DEFAULT_CONFIG[key];
  }

  /**
   * Get boolean config value
   */
  getBoolean(key) {
    const value = this.getValue(key);
    return value === true || value === 'true';
  }

  /**
   * Get string config value
   */
  getString(key) {
    return String(this.getValue(key) ?? '');
  }

  /**
   * Check if ads are enabled
   */
  areAdsEnabled() {
    return this.getBoolean('ads_enabled');
  }

  /**
   * Check if test mode is forced
   */
  isTestModeForced() {
    return this.getBoolean('ads_test_mode');
  }

  /**
   * Check if maintenance mode is active
   */
  isMaintenanceMode() {
    return this.getBoolean('maintenance_mode');
  }

  /**
   * Add a listener for config changes
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of config change
   */
  notifyListeners() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.config);
      } catch (error) {
        logger.error('[RemoteConfig] Listener error:', error);
      }
    });
  }

  /**
   * Force refresh config (useful for pull-to-refresh)
   */
  async forceRefresh() {
    this.lastFetchTime = 0;
    await this.fetchRemoteConfig();
  }

  /**
   * Get all config values (for debugging)
   */
  getAllConfig() {
    return { ...this.config };
  }
}

// Singleton instance
const remoteConfig = new RemoteConfigService();

export default remoteConfig;
