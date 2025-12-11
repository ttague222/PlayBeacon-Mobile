/**
 * SoundManager Tests
 *
 * Tests for sound playback, rate limiting, volume control,
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
};

jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    Sound: {
      createAsync: jest.fn().mockResolvedValue({ sound: mockSound }),
    },
  },
}));

// Mock sound events
jest.mock('../../config/soundEvents.json', () => ({
  events: {
    ADD_TO_WISHLIST: 'ui.favorite',
    BEAR_TAP: 'bear.pawpop',
    ACHIEVEMENT: 'rewards.achievement',
    ERROR: 'system.error',
  },
}));

// Need to mock require for sound files
jest.mock('../../../assets/sounds/ui/tap.mp3', () => 'tap.mp3', { virtual: true });
jest.mock('../../../assets/sounds/ui/swipe.mp3', () => 'swipe.mp3', { virtual: true });
jest.mock('../../../assets/sounds/ui/tab_change.mp3', () => 'tab_change.mp3', { virtual: true });
jest.mock('../../../assets/sounds/ui/remove.mp3', () => 'remove.mp3', { virtual: true });
jest.mock('../../../assets/sounds/ui/modal_open.mp3', () => 'modal_open.mp3', { virtual: true });
jest.mock('../../../assets/sounds/ui/modal_close.mp3', () => 'modal_close.mp3', { virtual: true });
jest.mock('../../../assets/sounds/ui/favorite.mp3', () => 'favorite.mp3', { virtual: true });
jest.mock('../../../assets/sounds/bear/tailwag.mp3', () => 'tailwag.mp3', { virtual: true });
jest.mock('../../../assets/sounds/bear/pawpop.mp3', () => 'pawpop.mp3', { virtual: true });
jest.mock('../../../assets/sounds/bear/sniff.mp3', () => 'sniff.mp3', { virtual: true });
jest.mock('../../../assets/sounds/bear/celebrate.mp3', () => 'celebrate.mp3', { virtual: true });
jest.mock('../../../assets/sounds/bear/sad.mp3', () => 'sad.mp3', { virtual: true });
jest.mock('../../../assets/sounds/bear/sleep.mp3', () => 'sleep.mp3', { virtual: true });
jest.mock('../../../assets/sounds/bear/surprise.mp3', () => 'surprise.mp3', { virtual: true });
jest.mock('../../../assets/sounds/bear/earwiggle.mp3', () => 'earwiggle.mp3', { virtual: true });
jest.mock('../../../assets/sounds/bear/happy.mp3', () => 'happy.mp3', { virtual: true });
jest.mock('../../../assets/sounds/rewards/confetti.mp3', () => 'confetti.mp3', { virtual: true });
jest.mock('../../../assets/sounds/rewards/streak.mp3', () => 'streak.mp3', { virtual: true });
jest.mock('../../../assets/sounds/rewards/daily.mp3', () => 'daily.mp3', { virtual: true });
jest.mock('../../../assets/sounds/rewards/achievement.mp3', () => 'achievement.mp3', { virtual: true });
jest.mock('../../../assets/sounds/rewards/xp.mp3', () => 'xp.mp3', { virtual: true });
jest.mock('../../../assets/sounds/system/ping.mp3', () => 'ping.mp3', { virtual: true });
jest.mock('../../../assets/sounds/system/success.mp3', () => 'success.mp3', { virtual: true });
jest.mock('../../../assets/sounds/system/error.mp3', () => 'error.mp3', { virtual: true });
jest.mock('../../../assets/sounds/system/loading_ambient.mp3', () => 'loading_ambient.mp3', { virtual: true });
jest.mock('../../../assets/sounds/system/loading_complete.mp3', () => 'loading_complete.mp3', { virtual: true });
jest.mock('../../../assets/sounds/system/no_results.mp3', () => 'no_results.mp3', { virtual: true });

import { Audio } from 'expo-av';
import SoundManager, { SoundCategory, SOUNDS, EVENT_SOUND_MAP } from '../../services/SoundManager';

describe('SoundManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset SoundManager state
    SoundManager.isEnabled = true;
    SoundManager.isBearSoundEnabled = true;
    SoundManager.masterVolume = 0.7;
    SoundManager.reduceLoudSounds = false;
    SoundManager.currentlyPlaying.clear();
    SoundManager.lastPlayedTime.clear();
    SoundManager.isInitialized = false;
  });

  describe('Initialization', () => {
    it('should configure audio mode on initialize', async () => {
      await SoundManager.initialize();

      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
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

    it('should have sounds for each category', () => {
      const categories = new Set(Object.values(SOUNDS).map(s => s.category));

      expect(categories.has(SoundCategory.UI)).toBe(true);
      expect(categories.has(SoundCategory.BEAR)).toBe(true);
      expect(categories.has(SoundCategory.REWARDS)).toBe(true);
      expect(categories.has(SoundCategory.SYSTEM)).toBe(true);
    });
  });

  describe('Sound Definitions', () => {
    it('should define UI sounds', () => {
      expect(SOUNDS['ui.tap']).toBeDefined();
      expect(SOUNDS['ui.swipe']).toBeDefined();
      expect(SOUNDS['ui.favorite']).toBeDefined();
    });

    it('should define bear sounds', () => {
      expect(SOUNDS['bear.tailwag']).toBeDefined();
      expect(SOUNDS['bear.celebrate']).toBeDefined();
      expect(SOUNDS['bear.sad']).toBeDefined();
    });

    it('should define reward sounds', () => {
      expect(SOUNDS['rewards.confetti']).toBeDefined();
      expect(SOUNDS['rewards.achievement']).toBeDefined();
      expect(SOUNDS['rewards.streak']).toBeDefined();
    });

    it('should define system sounds', () => {
      expect(SOUNDS['system.success']).toBeDefined();
      expect(SOUNDS['system.error']).toBeDefined();
    });

    it('should have child-safe volume levels (all <= 0.6)', () => {
      Object.entries(SOUNDS).forEach(([key, config]) => {
        expect(config.volume).toBeLessThanOrEqual(0.6);
      });
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

      // Mock that the sound is already cached
      SoundManager.soundCache.set('bear.celebrate', {
        sound: mockSound,
        config: SOUNDS['bear.celebrate'],
      });

      const result = await SoundManager.play('bear.celebrate');
      expect(result).toBe(false);

      // Cleanup
      SoundManager.soundCache.delete('bear.celebrate');
    });

    it('should still play non-bear sounds when bear sounds disabled', async () => {
      SoundManager.isInitialized = true;
      SoundManager.setBearSoundEnabled(false);

      // Mock that the UI sound is already cached
      SoundManager.soundCache.set('ui.tap', {
        sound: mockSound,
        config: SOUNDS['ui.tap'],
      });

      const result = await SoundManager.play('ui.tap');
      expect(result).toBe(true);

      // Cleanup
      SoundManager.soundCache.delete('ui.tap');
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

    it('should calculate effective volume correctly', () => {
      SoundManager.masterVolume = 1;
      SoundManager.categoryVolumes[SoundCategory.UI] = 1;
      SoundManager.soundCache.set('ui.tap', {
        sound: mockSound,
        config: { ...SOUNDS['ui.tap'], volume: 0.5 },
      });

      const volume = SoundManager.getEffectiveVolume('ui.tap');
      expect(volume).toBe(0.5); // 0.5 * 1 * 1

      // Cleanup
      SoundManager.soundCache.delete('ui.tap');
    });
  });

  describe('Reduce Loud Sounds (Accessibility)', () => {
    it('should enable reduce loud sounds', () => {
      SoundManager.setReduceLoudSounds(true);
      expect(SoundManager.reduceLoudSounds).toBe(true);
    });

    it('should cap volume at 0.5 when reduce loud sounds is enabled', () => {
      SoundManager.setReduceLoudSounds(true);
      SoundManager.masterVolume = 1;
      SoundManager.categoryVolumes[SoundCategory.REWARDS] = 1;
      SoundManager.soundCache.set('rewards.achievement', {
        sound: mockSound,
        config: { ...SOUNDS['rewards.achievement'], volume: 0.6 },
      });

      const volume = SoundManager.getEffectiveVolume('rewards.achievement');
      expect(volume).toBe(0.5); // Capped at 0.5

      // Cleanup
      SoundManager.soundCache.delete('rewards.achievement');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', () => {
      SoundManager.soundCache.set('ui.tap', {
        sound: mockSound,
        config: SOUNDS['ui.tap'],
      });
      SoundManager.lastPlayedTime.set('ui.tap', Date.now());

      // Should not be able to play immediately
      expect(SoundManager.canPlay('ui.tap')).toBe(false);

      // Cleanup
      SoundManager.soundCache.delete('ui.tap');
    });

    it('should allow play after rate limit expires', () => {
      SoundManager.soundCache.set('ui.tap', {
        sound: mockSound,
        config: SOUNDS['ui.tap'],
      });
      // Set last played time to past the rate limit
      SoundManager.lastPlayedTime.set('ui.tap', Date.now() - 200);

      expect(SoundManager.canPlay('ui.tap')).toBe(true);

      // Cleanup
      SoundManager.soundCache.delete('ui.tap');
    });

    it('should have different rate limits per category', () => {
      // UI sounds have faster rate limits than bear sounds
      const uiLimit = SoundManager.getRateLimit('ui.tap');
      const bearLimit = SoundManager.getRateLimit('bear.celebrate');

      // UI is typically 120ms, bear is 1000ms
      expect(uiLimit).toBeLessThan(bearLimit);
    });
  });

  describe('Priority System', () => {
    it('should allow high priority sounds to override', () => {
      // Fill up concurrent sounds
      SoundManager.currentlyPlaying.add('ui.tap');
      SoundManager.currentlyPlaying.add('ui.swipe');

      // System error should have higher priority
      const canPlay = SoundManager.canPlayWithPriority('system.error');
      expect(canPlay).toBe(true);
    });

    it('should respect max concurrent sounds', () => {
      SoundManager.currentlyPlaying.add('system.error');
      SoundManager.currentlyPlaying.add('system.success');

      // Low priority sound should be blocked
      const canPlay = SoundManager.canPlayWithPriority('ui.tap');
      expect(canPlay).toBe(false);
    });
  });

  describe('Event Sound Mapping', () => {
    it('should map events to sounds', () => {
      expect(EVENT_SOUND_MAP.ADD_TO_WISHLIST).toBe('ui.favorite');
      expect(EVENT_SOUND_MAP.BEAR_TAP).toBe('bear.pawpop');
      expect(EVENT_SOUND_MAP.ACHIEVEMENT).toBe('rewards.achievement');
      expect(EVENT_SOUND_MAP.ERROR).toBe('system.error');
    });

    it('should play sound by event name', async () => {
      SoundManager.isInitialized = true;
      SoundManager.soundCache.set('ui.favorite', {
        sound: mockSound,
        config: SOUNDS['ui.favorite'],
      });

      const result = await SoundManager.playEvent('ADD_TO_WISHLIST');
      expect(result).toBe(true);

      // Cleanup
      SoundManager.soundCache.delete('ui.favorite');
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

    it('should clear sound cache on cleanup', async () => {
      SoundManager.soundCache.set('ui.tap', {
        sound: mockSound,
        config: SOUNDS['ui.tap'],
      });

      await SoundManager.cleanup();

      expect(SoundManager.soundCache.size).toBe(0);
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
      expect(SoundManager.masterVolume).toBe(0.7);
    });

    it('should limit concurrent sounds to 2', () => {
      expect(SoundManager.maxConcurrentSounds).toBe(2);
    });
  });
});
