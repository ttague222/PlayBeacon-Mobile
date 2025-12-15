/**
 * SoundManager
 *
 * Global sound management for PlayBeacon app.
 * Handles loading, playing, and managing all app sounds using expo-av.
 */

import { Audio } from 'expo-av';
import logger from '../utils/logger';

// Sound files are now available - enable sounds
const SOUNDS_ENABLED = true;

/**
 * Sound categories
 */
export const SoundCategory = {
  UI: 'ui',
  REWARDS: 'rewards',
  SYSTEM: 'system',
};

/**
 * Sound file mappings
 * Maps sound keys to their require() sources
 */
const SOUND_FILES = {
  // UI sounds
  'ui.tap': require('../../assets/sounds/ui/tap.mp3'),
  'ui.swipe': require('../../assets/sounds/ui/swipe.mp3'),
  'ui.tab_change': require('../../assets/sounds/ui/tab_change.mp3'),
  'ui.modal_open': require('../../assets/sounds/ui/modal_open.mp3'),
  'ui.modal_close': require('../../assets/sounds/ui/modal_close.mp3'),
  'ui.favorite': require('../../assets/sounds/ui/favorite.mp3'),
  'ui.remove': require('../../assets/sounds/ui/remove.mp3'),

  // Game feedback sounds
  'ui.like': require('../../assets/sounds/ui/like.mp3'),
  'ui.dislike': require('../../assets/sounds/ui/dislike.mp3'),
  'ui.skip': require('../../assets/sounds/ui/skip.mp3'),

  // Reward sounds
  'rewards.achievement': require('../../assets/sounds/rewards/achievement.mp3'),
  'rewards.streak': require('../../assets/sounds/rewards/streak.mp3'),
  'rewards.daily': require('../../assets/sounds/rewards/daily.mp3'),
  'rewards.xp': require('../../assets/sounds/rewards/xp.mp3'),
  'rewards.confetti': require('../../assets/sounds/rewards/confetti.mp3'),

  // System sounds
  'system.success': require('../../assets/sounds/system/success.mp3'),
  'system.error': require('../../assets/sounds/system/no_results.mp3'),
  'system.ping': require('../../assets/sounds/system/ping.mp3'),
  'system.loading_ambient': require('../../assets/sounds/system/loading_ambient.mp3'),
  'system.loading_complete': require('../../assets/sounds/system/loading_complete.mp3'),
};

/**
 * Event to sound mapping
 */
export const EVENT_SOUND_MAP = {
  // UI events
  'TAP': 'ui.tap',
  'SWIPE': 'ui.swipe',
  'TAB_CHANGE': 'ui.tab_change',
  'MODAL_OPEN': 'ui.modal_open',
  'MODAL_CLOSE': 'ui.modal_close',
  'ADD_TO_WISHLIST': 'ui.favorite',
  'REMOVE_FROM_WISHLIST': 'ui.remove',

  // Game feedback events
  'LIKE_GAME': 'ui.like',
  'DISLIKE_GAME': 'ui.dislike',
  'SKIP_GAME': 'ui.skip',

  // Reward events
  'ACHIEVEMENT_UNLOCK': 'rewards.achievement',
  'STREAK_MILESTONE': 'rewards.streak',
  'DAILY_LOGIN': 'rewards.daily',
  'XP_GAIN': 'rewards.xp',
  'CONFETTI': 'rewards.confetti',

  // System events
  'SUCCESS': 'system.success',
  'ERROR': 'system.error',
  'LOADING_START': 'system.loading_ambient',
  'LOADING_COMPLETE': 'system.loading_complete',
};

/**
 * Rate limits per category (in milliseconds)
 * Prevents audio issues from rapid repeated plays
 */
const CATEGORY_RATE_LIMITS = {
  [SoundCategory.UI]: 100,      // 100ms - allow fairly rapid UI feedback
  [SoundCategory.REWARDS]: 500, // 500ms - rewards shouldn't overlap
  [SoundCategory.SYSTEM]: 300,  // 300ms - system sounds need some gap
};

class SoundManagerClass {
  constructor() {
    this.isEnabled = true;
    this.masterVolume = 0.7;
    this.isInitialized = false;
    this.loadedSounds = {};
    this.categoryVolumes = {
      [SoundCategory.UI]: 0.5,
      [SoundCategory.REWARDS]: 0.6,
      [SoundCategory.SYSTEM]: 0.5,
    };
    this.reduceLoudSounds = false;
    // Rate limiting: track last play time per sound key
    this.lastPlayTime = {};
  }

  /**
   * Get category from sound key
   */
  _getCategoryFromKey(soundKey) {
    const [category] = soundKey.split('.');
    return category || SoundCategory.SYSTEM;
  }

  /**
   * Get effective volume for a sound
   */
  _getEffectiveVolume(soundKey) {
    const category = this._getCategoryFromKey(soundKey);
    const categoryVolume = this.categoryVolumes[category] || 0.5;
    let volume = this.masterVolume * categoryVolume;

    if (this.reduceLoudSounds) {
      volume *= 0.6;
    }

    return Math.min(1, Math.max(0, volume));
  }

  /**
   * Check if sound can be played based on rate limiting
   */
  _canPlaySound(soundKey) {
    const now = Date.now();
    const lastTime = this.lastPlayTime[soundKey] || 0;
    const category = this._getCategoryFromKey(soundKey);
    const rateLimit = CATEGORY_RATE_LIMITS[category] || 100;

    if (now - lastTime < rateLimit) {
      return false;
    }

    this.lastPlayTime[soundKey] = now;
    return true;
  }

  /**
   * Initialize audio settings
   */
  async initialize() {
    if (this.isInitialized) return;

    if (!SOUNDS_ENABLED) {
      logger.log('[SoundManager] Sounds disabled');
      this.isInitialized = true;
      return;
    }

    try {
      // Configure audio mode for the app
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false, // Respect silent mode
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      this.isInitialized = true;
      logger.log('[SoundManager] Initialized successfully');
    } catch (error) {
      logger.error('[SoundManager] Failed to initialize:', error);
      this.isInitialized = true; // Mark as initialized to prevent retries
    }
  }

  /**
   * Load a sound file and cache it
   */
  async _loadSound(soundKey) {
    if (this.loadedSounds[soundKey]) {
      return this.loadedSounds[soundKey];
    }

    const soundFile = SOUND_FILES[soundKey];
    if (!soundFile) {
      logger.warn(`[SoundManager] Sound not found: ${soundKey}`);
      return null;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(soundFile, {
        shouldPlay: false,
        volume: this._getEffectiveVolume(soundKey),
      });

      this.loadedSounds[soundKey] = sound;
      return sound;
    } catch (error) {
      logger.error(`[SoundManager] Failed to load sound ${soundKey}:`, error);
      return null;
    }
  }

  /**
   * Play a sound by key
   * @param {string} soundKey - The sound key to play
   * @param {Object} options - Options object
   * @param {number} options.volume - Override volume (0-1)
   * @param {boolean} options.bypassRateLimit - Skip rate limiting check
   */
  async play(soundKey, options = {}) {
    if (!SOUNDS_ENABLED || !this.isEnabled) return false;

    // Check rate limiting unless bypassed
    if (!options.bypassRateLimit && !this._canPlaySound(soundKey)) {
      return false;
    }

    try {
      // Get or load the sound
      let sound = this.loadedSounds[soundKey];

      if (!sound) {
        sound = await this._loadSound(soundKey);
        if (!sound) return false;
      }

      // Get playback status
      const status = await sound.getStatusAsync();

      // Reset position if the sound was played before
      if (status.isLoaded && status.positionMillis > 0) {
        await sound.setPositionAsync(0);
      }

      // Set volume
      const volume = options.volume !== undefined
        ? options.volume * this.masterVolume
        : this._getEffectiveVolume(soundKey);
      await sound.setVolumeAsync(volume);

      // Play the sound
      await sound.playAsync();
      return true;
    } catch (error) {
      logger.error(`[SoundManager] Failed to play sound ${soundKey}:`, error);
      return false;
    }
  }

  /**
   * Play sound by event name
   */
  async playEvent(eventName, options = {}) {
    if (!SOUNDS_ENABLED) return false;
    const soundKey = EVENT_SOUND_MAP[eventName];
    if (!soundKey) return false;
    return this.play(soundKey, options);
  }

  /**
   * Stop a specific sound
   */
  async stop(soundKey) {
    const sound = this.loadedSounds[soundKey];
    if (sound) {
      try {
        await sound.stopAsync();
      } catch (error) {
        logger.error(`[SoundManager] Failed to stop sound ${soundKey}:`, error);
      }
    }
  }

  /**
   * Stop all sounds
   */
  async stopAll() {
    const stopPromises = Object.values(this.loadedSounds).map(async (sound) => {
      try {
        await sound.stopAsync();
      } catch (error) {
        // Ignore errors when stopping
      }
    });
    await Promise.all(stopPromises);
  }

  /**
   * Preload commonly used sounds
   */
  async preloadSounds(soundKeys) {
    const loadPromises = soundKeys.map(key => this._loadSound(key));
    await Promise.all(loadPromises);
  }

  /**
   * Enable/disable all sounds
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.min(1, Math.max(0, volume));
  }

  /**
   * Set category volume (0-1)
   */
  setCategoryVolume(category, volume) {
    this.categoryVolumes[category] = Math.min(1, Math.max(0, volume));
  }

  /**
   * Enable/disable reduce loud sounds mode
   */
  setReduceLoudSounds(enabled) {
    this.reduceLoudSounds = enabled;
  }

  /**
   * Get current settings
   */
  getSettings() {
    return {
      isEnabled: this.isEnabled,
      masterVolume: this.masterVolume,
      categoryVolumes: { ...this.categoryVolumes },
      reduceLoudSounds: this.reduceLoudSounds,
    };
  }

  /**
   * Apply settings
   */
  applySettings(settings) {
    if (settings.isEnabled !== undefined) this.isEnabled = settings.isEnabled;
    if (settings.masterVolume !== undefined) this.masterVolume = settings.masterVolume;
    if (settings.categoryVolumes) this.categoryVolumes = { ...this.categoryVolumes, ...settings.categoryVolumes };
    if (settings.reduceLoudSounds !== undefined) this.reduceLoudSounds = settings.reduceLoudSounds;
  }

  /**
   * Cleanup all loaded sounds
   */
  async cleanup() {
    const unloadPromises = Object.values(this.loadedSounds).map(async (sound) => {
      try {
        await sound.unloadAsync();
      } catch (error) {
        // Ignore errors when unloading
      }
    });
    await Promise.all(unloadPromises);
    this.loadedSounds = {};
    this.isInitialized = false;
  }
}

// Singleton instance
const SoundManager = new SoundManagerClass();

export default SoundManager;
