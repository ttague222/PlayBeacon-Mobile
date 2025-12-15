/**
 * Sound Context Provider
 *
 * Global sound settings management for PlayBeacon app.
 * Persists user preferences and provides hooks for sound control.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SoundManager, { SoundCategory } from '../services/SoundManager';
import logger from '../utils/logger';

const STORAGE_KEY = '@playbeacon_sound_settings';

const SoundContext = createContext(null);

/**
 * Default sound settings
 */
const DEFAULT_SETTINGS = {
  soundEnabled: true,
  masterVolume: 0.7,
  reduceLoudSounds: false,
};

export function SoundProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(DEFAULT_SETTINGS.soundEnabled);
  const [masterVolume, setMasterVolume] = useState(DEFAULT_SETTINGS.masterVolume);
  const [reduceLoudSounds, setReduceLoudSounds] = useState(DEFAULT_SETTINGS.reduceLoudSounds);

  /**
   * Load saved settings on mount
   */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Initialize SoundManager with extra error protection
        try {
          await SoundManager.initialize();
        } catch (soundInitError) {
          // Sound initialization failed - app continues without sound
          logger.warn('[SoundContext] SoundManager initialization failed:', soundInitError);
          // Don't throw - continue loading settings and mark as initialized
        }

        // Load saved settings
        const savedSettings = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSoundEnabled(parsed.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled);
          setMasterVolume(parsed.masterVolume ?? DEFAULT_SETTINGS.masterVolume);
          setReduceLoudSounds(parsed.reduceLoudSounds ?? DEFAULT_SETTINGS.reduceLoudSounds);

          // Apply to SoundManager
          SoundManager.applySettings({
            isEnabled: parsed.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled,
            masterVolume: parsed.masterVolume ?? DEFAULT_SETTINGS.masterVolume,
            reduceLoudSounds: parsed.reduceLoudSounds ?? DEFAULT_SETTINGS.reduceLoudSounds,
          });
        }

        setIsInitialized(true);
      } catch (error) {
        logger.warn('[SoundContext] Failed to load settings:', error);
        setIsInitialized(true);
      }
    };

    loadSettings();

    return () => {
      SoundManager.cleanup();
    };
  }, []);

  /**
   * Save settings when they change
   */
  useEffect(() => {
    if (!isInitialized) return;

    const saveSettings = async () => {
      try {
        const settings = {
          soundEnabled,
          masterVolume,
          reduceLoudSounds,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        logger.warn('[SoundContext] Failed to save settings:', error);
      }
    };

    saveSettings();
  }, [isInitialized, soundEnabled, masterVolume, reduceLoudSounds]);

  /**
   * Toggle all sounds on/off
   */
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      SoundManager.setEnabled(newValue);
      return newValue;
    });
  }, []);

  /**
   * Set sound enabled state
   */
  const setSoundEnabledValue = useCallback((enabled) => {
    setSoundEnabled(enabled);
    SoundManager.setEnabled(enabled);
  }, []);

  /**
   * Set master volume (0-1)
   */
  const setMasterVolumeValue = useCallback((volume) => {
    const clamped = Math.min(1, Math.max(0, volume));
    setMasterVolume(clamped);
    SoundManager.setMasterVolume(clamped);
  }, []);

  /**
   * Toggle reduce loud sounds
   */
  const toggleReduceLoudSounds = useCallback(() => {
    setReduceLoudSounds((prev) => {
      const newValue = !prev;
      SoundManager.setReduceLoudSounds(newValue);
      return newValue;
    });
  }, []);

  /**
   * Set reduce loud sounds
   */
  const setReduceLoudSoundsValue = useCallback((enabled) => {
    setReduceLoudSounds(enabled);
    SoundManager.setReduceLoudSounds(enabled);
  }, []);

  /**
   * Play a sound by key (e.g., 'ui.tap', 'bear.celebrate')
   */
  const playSound = useCallback((soundKey, options = {}) => {
    return SoundManager.play(soundKey, options);
  }, []);

  /**
   * Play a sound by event name (e.g., 'ADD_TO_WISHLIST')
   */
  const playSoundEvent = useCallback((eventName, options = {}) => {
    return SoundManager.playEvent(eventName, options);
  }, []);

  /**
   * Stop all sounds
   */
  const stopAllSounds = useCallback(() => {
    return SoundManager.stopAll();
  }, []);

  /**
   * Reset to default settings
   */
  const resetSettings = useCallback(async () => {
    setSoundEnabled(DEFAULT_SETTINGS.soundEnabled);
    setMasterVolume(DEFAULT_SETTINGS.masterVolume);
    setReduceLoudSounds(DEFAULT_SETTINGS.reduceLoudSounds);

    SoundManager.applySettings({
      isEnabled: DEFAULT_SETTINGS.soundEnabled,
      masterVolume: DEFAULT_SETTINGS.masterVolume,
      reduceLoudSounds: DEFAULT_SETTINGS.reduceLoudSounds,
    });

    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      logger.warn('[SoundContext] Failed to reset settings:', error);
    }
  }, []);

  const value = {
    // State
    isInitialized,
    soundEnabled,
    masterVolume,
    reduceLoudSounds,

    // Toggles
    toggleSound,
    toggleReduceLoudSounds,

    // Setters
    setSoundEnabled: setSoundEnabledValue,
    setMasterVolume: setMasterVolumeValue,
    setReduceLoudSounds: setReduceLoudSoundsValue,

    // Actions
    playSound,
    playSoundEvent,
    stopAllSounds,
    resetSettings,
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
}

/**
 * Hook to access sound context
 */
export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}

/**
 * Hook for sound settings only
 */
export function useSoundSettings() {
  const {
    soundEnabled,
    masterVolume,
    reduceLoudSounds,
    toggleSound,
    toggleReduceLoudSounds,
    setSoundEnabled,
    setMasterVolume,
    setReduceLoudSounds,
    resetSettings,
  } = useSound();

  return {
    soundEnabled,
    masterVolume,
    reduceLoudSounds,
    toggleSound,
    toggleReduceLoudSounds,
    setSoundEnabled,
    setMasterVolume,
    setReduceLoudSounds,
    resetSettings,
  };
}

export default SoundContext;
