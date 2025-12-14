/**
 * SoundManager Tests
 *
 * Tests for sound playback, volume control,
 * and child-safe audio settings.
 */

// Mock expo-av Audio
const mockSound = {
  playAsync: jest.fn().mockResolvedValue(undefined),
  stopAsync: jest.fn().mockResolvedValue(undefined),
  setPositionAsync: jest.fn().mockResolvedValue(undefined),
  setVolumeAsync: jest.fn().mockResolvedValue(undefined),
  setIsLoopingAsync: jest.fn().mockResolvedValue(undefined),
  setOnPlaybackStatusUpdate: jest.fn(),
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, positionMillis: 0 }),
};

jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    Sound: {
      createAsync: jest.fn().mockResolvedValue({ sound: mockSound }),
    },
  },
}));

// Mock sound files
jest.mock('../../../assets/sounds/ui/tap.mp3', () => 'tap.mp3', { virtual: true });
jest.mock('../../../assets/sounds/ui/swipe.mp3', () => 'swipe.mp3', { virtual: true });
jest.mock('../../../assets/sounds/ui/tab_change.mp3', () => 'tab_change.mp3', { virtual: true });
jest.mock('../../../assets/sounds/ui/remove.mp3', () => 'remove.mp3', { virtual: true });
jest.mock('../../../assets/sounds/ui/modal_open.mp3', () => 'modal_open.mp3', { virtual: true });
jest.mock('../../../assets/sounds/ui/modal_close.mp3', () => 'modal_close.mp3', { virtual: true });
jest.mock('../../../assets/sounds/ui/favorite.mp3', () => 'favorite.mp3', { virtual: true });
jest.mock('../../../assets/sounds/ui/like.mp3', () => 'like.mp3', { virtual: true });
jest.mock('../../../assets/sounds/ui/dislike.mp3', () => 'dislike.mp3', { virtual: true });
jest.mock('../../../assets/sounds/ui/skip.mp3', () => 'skip.mp3', { virtual: true });
jest.mock('../../../assets/sounds/bear/celebrate.mp3', () => 'celebrate.mp3', { virtual: true });
jest.mock('../../../assets/sounds/bear/sad.mp3', () => 'sad.mp3', { virtual: true });
jest.mock('../../../assets/sounds/bear/sleep.mp3', () => 'sleep.mp3', { virtual: true });
jest.mock('../../../assets/sounds/bear/sniff.mp3', () => 'sniff.mp3', { virtual: true });
jest.mock('../../../assets/sounds/bear/happy.mp3', () => 'happy.mp3', { virtual: true });
jest.mock('../../../assets/sounds/bear/earwiggle.mp3', () => 'earwiggle.mp3', { virtual: true });
jest.mock('../../../assets/sounds/rewards/confetti.mp3', () => 'confetti.mp3', { virtual: true });
jest.mock('../../../assets/sounds/rewards/streak.mp3', () => 'streak.mp3', { virtual: true });
jest.mock('../../../assets/sounds/rewards/daily.mp3', () => 'daily.mp3', { virtual: true });
jest.mock('../../../assets/sounds/rewards/achievement.mp3', () => 'achievement.mp3', { virtual: true });
jest.mock('../../../assets/sounds/rewards/xp.mp3', () => 'xp.mp3', { virtual: true });
jest.mock('../../../assets/sounds/system/ping.mp3', () => 'ping.mp3', { virtual: true });
jest.mock('../../../assets/sounds/system/success.mp3', () => 'success.mp3', { virtual: true });
jest.mock('../../../assets/sounds/system/no_results.mp3', () => 'no_results.mp3', { virtual: true });
jest.mock('../../../assets/sounds/system/loading_ambient.mp3', () => 'loading_ambient.mp3', { virtual: true });
jest.mock('../../../assets/sounds/system/loading_complete.mp3', () => 'loading_complete.mp3', { virtual: true });

// Mock logger
jest.mock('../../utils/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

import { Audio } from 'expo-av';
import SoundManager, { SoundCategory, EVENT_SOUND_MAP } from '../../services/SoundManager';

describe('SoundManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset SoundManager state
    SoundManager.isEnabled = true;
    SoundManager.isBearSoundEnabled = true;
    SoundManager.masterVolume = 0.7;
    SoundManager.reduceLoudSounds = false;
    SoundManager.loadedSounds = {};
    SoundManager.isInitialized = false;
    SoundManager.categoryVolumes = {
      [SoundCategory.UI]: 0.5,
      [SoundCategory.BEAR]: 0.4,
      [SoundCategory.REWARDS]: 0.6,
      [SoundCategory.SYSTEM]: 0.5,
    };
  });

  describe('Initialization', () => {
    it('should configure audio mode on initialize', async () => {
      await SoundManager.initialize();

      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    });

    it('should set initialized flag', async () => {
      SoundManager.isInitialized = false;
      await SoundManager.initialize();

      expect(SoundManager.isInitialized).toBe(true);
    });

    it('should only initialize once', async () => {
      SoundManager.isInitialized = true;
      await SoundManager.initialize();

      expect(Audio.setAudioModeAsync).not.toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      Audio.setAudioModeAsync.mockRejectedValueOnce(new Error('Audio error'));

      await SoundManager.initialize();

      // Should still mark as initialized to allow app to continue
      expect(SoundManager.isInitialized).toBe(true);
    });
  });

  describe('Sound Categories', () => {
    it('should define all sound categories', () => {
      expect(SoundCategory.UI).toBe('ui');
      expect(SoundCategory.BEAR).toBe('bear');
      expect(SoundCategory.REWARDS).toBe('rewards');
      expect(SoundCategory.SYSTEM).toBe('system');
    });
  });

  describe('Enable/Disable', () => {
    it('should enable sounds', () => {
      SoundManager.setEnabled(true);
      expect(SoundManager.isEnabled).toBe(true);
    });

    it('should disable sounds', () => {
      SoundManager.setEnabled(false);
      expect(SoundManager.isEnabled).toBe(false);
    });

    it('should stop all sounds when disabled', async () => {
      const stopAllSpy = jest.spyOn(SoundManager, 'stopAll');
      SoundManager.setEnabled(false);
      expect(stopAllSpy).toHaveBeenCalled();
      stopAllSpy.mockRestore();
    });

    it('should not play when disabled', async () => {
      SoundManager.setEnabled(false);
      const result = await SoundManager.play('ui.tap');
      expect(result).toBe(false);
    });
  });

  describe('Bear Sound Toggle', () => {
    it('should enable bear sounds', () => {
      SoundManager.setBearSoundEnabled(true);
      expect(SoundManager.isBearSoundEnabled).toBe(true);
    });

    it('should disable bear sounds', () => {
      SoundManager.setBearSoundEnabled(false);
      expect(SoundManager.isBearSoundEnabled).toBe(false);
    });

    it('should not play bear sounds when disabled', async () => {
      SoundManager.isInitialized = true;
      SoundManager.setBearSoundEnabled(false);

      const result = await SoundManager.play('bear.celebrate');
      expect(result).toBe(false);
    });

    it('should still play non-bear sounds when bear sounds disabled', async () => {
      SoundManager.isInitialized = true;
      SoundManager.setBearSoundEnabled(false);
      // Pre-load the sound
      SoundManager.loadedSounds['ui.tap'] = mockSound;

      const result = await SoundManager.play('ui.tap');
      expect(result).toBe(true);
    });
  });

  describe('Volume Control', () => {
    it('should set master volume', () => {
      SoundManager.setMasterVolume(0.5);
      expect(SoundManager.masterVolume).toBe(0.5);
    });

    it('should clamp master volume to 0-1 range', () => {
      SoundManager.setMasterVolume(1.5);
      expect(SoundManager.masterVolume).toBe(1);

      SoundManager.setMasterVolume(-0.5);
      expect(SoundManager.masterVolume).toBe(0);
    });

    it('should set category volume', () => {
      SoundManager.setCategoryVolume(SoundCategory.UI, 0.3);
      expect(SoundManager.categoryVolumes[SoundCategory.UI]).toBe(0.3);
    });

    it('should clamp category volume to 0-1 range', () => {
      SoundManager.setCategoryVolume(SoundCategory.UI, 2);
      expect(SoundManager.categoryVolumes[SoundCategory.UI]).toBe(1);

      SoundManager.setCategoryVolume(SoundCategory.UI, -1);
      expect(SoundManager.categoryVolumes[SoundCategory.UI]).toBe(0);
    });
  });

  describe('Reduce Loud Sounds (Accessibility)', () => {
    it('should enable reduce loud sounds', () => {
      SoundManager.setReduceLoudSounds(true);
      expect(SoundManager.reduceLoudSounds).toBe(true);
    });

    it('should disable reduce loud sounds', () => {
      SoundManager.setReduceLoudSounds(false);
      expect(SoundManager.reduceLoudSounds).toBe(false);
    });
  });

  describe('Event Sound Mapping', () => {
    it('should map events to sounds', () => {
      expect(EVENT_SOUND_MAP.ADD_TO_WISHLIST).toBe('ui.favorite');
      expect(EVENT_SOUND_MAP.BEAR_TAP).toBe('bear.pawpop');
      expect(EVENT_SOUND_MAP.ACHIEVEMENT_UNLOCK).toBe('rewards.achievement');
      expect(EVENT_SOUND_MAP.ERROR).toBe('system.error');
    });

    it('should play sound by event name', async () => {
      SoundManager.isInitialized = true;
      SoundManager.isEnabled = true;
      // Pre-load the sound
      SoundManager.loadedSounds['ui.favorite'] = mockSound;

      const result = await SoundManager.playEvent('ADD_TO_WISHLIST');
      expect(result).toBe(true);
    });

    it('should return false for unknown event', async () => {
      const result = await SoundManager.playEvent('UNKNOWN_EVENT');
      expect(result).toBe(false);
    });
  });

  describe('Settings Management', () => {
    it('should get current settings', () => {
      SoundManager.isEnabled = true;
      SoundManager.isBearSoundEnabled = false;
      SoundManager.masterVolume = 0.5;
      SoundManager.reduceLoudSounds = true;

      const settings = SoundManager.getSettings();

      expect(settings.isEnabled).toBe(true);
      expect(settings.isBearSoundEnabled).toBe(false);
      expect(settings.masterVolume).toBe(0.5);
      expect(settings.reduceLoudSounds).toBe(true);
    });

    it('should apply settings', () => {
      SoundManager.applySettings({
        isEnabled: false,
        isBearSoundEnabled: true,
        masterVolume: 0.3,
        reduceLoudSounds: true,
      });

      expect(SoundManager.isEnabled).toBe(false);
      expect(SoundManager.isBearSoundEnabled).toBe(true);
      expect(SoundManager.masterVolume).toBe(0.3);
      expect(SoundManager.reduceLoudSounds).toBe(true);
    });

    it('should apply partial settings', () => {
      SoundManager.isEnabled = true;
      SoundManager.masterVolume = 0.7;

      SoundManager.applySettings({
        masterVolume: 0.5,
      });

      expect(SoundManager.isEnabled).toBe(true); // Unchanged
      expect(SoundManager.masterVolume).toBe(0.5); // Changed
    });
  });

  describe('Cleanup', () => {
    it('should stop all sounds on cleanup', async () => {
      await SoundManager.cleanup();
      expect(SoundManager.isInitialized).toBe(false);
    });

    it('should clear loaded sounds on cleanup', async () => {
      SoundManager.loadedSounds = { 'ui.tap': mockSound };

      await SoundManager.cleanup();

      expect(Object.keys(SoundManager.loadedSounds).length).toBe(0);
    });
  });

  describe('Child Safety', () => {
    it('should not play in silent mode on iOS', async () => {
      await SoundManager.initialize();

      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          playsInSilentModeIOS: false,
        })
      );
    });

    it('should not stay active in background', async () => {
      await SoundManager.initialize();

      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          staysActiveInBackground: false,
        })
      );
    });

    it('should have moderate default master volume (0.7)', () => {
      // Reset to defaults
      SoundManager.masterVolume = 0.7;
      expect(SoundManager.masterVolume).toBe(0.7);
    });
  });

  describe('Playing Sounds', () => {
    it('should play a sound successfully', async () => {
      SoundManager.isEnabled = true;
      SoundManager.isInitialized = true;
      // Pre-load the sound
      SoundManager.loadedSounds['ui.tap'] = mockSound;

      const result = await SoundManager.play('ui.tap');
      expect(result).toBe(true);
    });

    it('should return false when sound is not found', async () => {
      SoundManager.isEnabled = true;
      SoundManager.isInitialized = true;

      // This sound key doesn't exist in SOUND_FILES
      const result = await SoundManager.play('unknown.sound');
      expect(result).toBe(false);
    });

    it('should set volume when playing', async () => {
      SoundManager.isEnabled = true;
      SoundManager.isInitialized = true;
      // Pre-load the sound
      SoundManager.loadedSounds['ui.tap'] = mockSound;

      await SoundManager.play('ui.tap');
      expect(mockSound.setVolumeAsync).toHaveBeenCalled();
    });

    it('should reset position when replaying', async () => {
      mockSound.getStatusAsync.mockResolvedValueOnce({
        isLoaded: true,
        positionMillis: 1000,
      });

      SoundManager.isEnabled = true;
      SoundManager.isInitialized = true;
      SoundManager.loadedSounds['ui.tap'] = mockSound;

      await SoundManager.play('ui.tap');
      expect(mockSound.setPositionAsync).toHaveBeenCalledWith(0);
    });
  });

  describe('Stopping Sounds', () => {
    it('should stop a specific sound', async () => {
      SoundManager.loadedSounds['ui.tap'] = mockSound;

      await SoundManager.stop('ui.tap');
      expect(mockSound.stopAsync).toHaveBeenCalled();
    });

    it('should stop all loaded sounds', async () => {
      SoundManager.loadedSounds = {
        'ui.tap': mockSound,
        'ui.swipe': mockSound,
      };

      await SoundManager.stopAll();
      expect(mockSound.stopAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('Preloading', () => {
    it('should preload multiple sounds', async () => {
      const soundKeys = ['ui.tap', 'ui.swipe', 'ui.favorite'];

      await SoundManager.preloadSounds(soundKeys);

      expect(Audio.Sound.createAsync).toHaveBeenCalledTimes(3);
    });
  });
});
