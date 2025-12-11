/**
 * SoundContext Tests
 *
 * Tests for sound settings management, persistence, and playback.
 * Child-safe: tests volume limits and accessibility features.
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock SoundManager
const mockSoundManager = {
  initialize: jest.fn().mockResolvedValue(undefined),
  cleanup: jest.fn().mockResolvedValue(undefined),
  applySettings: jest.fn(),
  setEnabled: jest.fn(),
  setBearSoundEnabled: jest.fn(),
  setMasterVolume: jest.fn(),
  setReduceLoudSounds: jest.fn(),
  play: jest.fn().mockResolvedValue(true),
  playEvent: jest.fn().mockResolvedValue(true),
  stopAll: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../../services/SoundManager', () => ({
  __esModule: true,
  default: mockSoundManager,
  SoundCategory: {
    UI: 'ui',
    BEAR: 'bear',
    REWARDS: 'rewards',
    SYSTEM: 'system',
  },
}));

import { SoundProvider, useSound, useSoundSettings } from '../../context/SoundContext';

const wrapper = ({ children }) => <SoundProvider>{children}</SoundProvider>;

describe('SoundContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize SoundManager on mount', async () => {
      renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(mockSoundManager.initialize).toHaveBeenCalled();
      });
    });

    it('should have default sound settings', async () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.soundEnabled).toBe(true);
      expect(result.current.bearSoundEnabled).toBe(true);
      expect(result.current.masterVolume).toBe(0.7);
      expect(result.current.reduceLoudSounds).toBe(false);
    });

    it('should load saved settings from AsyncStorage', async () => {
      const savedSettings = {
        soundEnabled: false,
        bearSoundEnabled: false,
        masterVolume: 0.5,
        reduceLoudSounds: true,
      };
      await AsyncStorage.setItem('@playbeacon_sound_settings', JSON.stringify(savedSettings));

      const { result } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.soundEnabled).toBe(false);
      expect(result.current.bearSoundEnabled).toBe(false);
      expect(result.current.masterVolume).toBe(0.5);
      expect(result.current.reduceLoudSounds).toBe(true);
    });

    it('should apply loaded settings to SoundManager', async () => {
      const savedSettings = {
        soundEnabled: false,
        bearSoundEnabled: true,
        masterVolume: 0.3,
        reduceLoudSounds: true,
      };
      await AsyncStorage.setItem('@playbeacon_sound_settings', JSON.stringify(savedSettings));

      renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(mockSoundManager.applySettings).toHaveBeenCalledWith({
          isEnabled: false,
          isBearSoundEnabled: true,
          masterVolume: 0.3,
          reduceLoudSounds: true,
        });
      });
    });

    it('should cleanup SoundManager on unmount', async () => {
      const { unmount } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(mockSoundManager.initialize).toHaveBeenCalled();
      });

      unmount();

      expect(mockSoundManager.cleanup).toHaveBeenCalled();
    });
  });

  describe('Sound Toggle', () => {
    it('should toggle all sounds', async () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.soundEnabled).toBe(true);

      act(() => {
        result.current.toggleSound();
      });

      expect(result.current.soundEnabled).toBe(false);
      expect(mockSoundManager.setEnabled).toHaveBeenCalledWith(false);

      act(() => {
        result.current.toggleSound();
      });

      expect(result.current.soundEnabled).toBe(true);
      expect(mockSoundManager.setEnabled).toHaveBeenCalledWith(true);
    });

    it('should set sound enabled directly', async () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      act(() => {
        result.current.setSoundEnabled(false);
      });

      expect(result.current.soundEnabled).toBe(false);
      expect(mockSoundManager.setEnabled).toHaveBeenCalledWith(false);
    });
  });

  describe('Bear Sound Toggle', () => {
    it('should toggle bear sounds independently', async () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.bearSoundEnabled).toBe(true);

      act(() => {
        result.current.toggleBearSound();
      });

      expect(result.current.bearSoundEnabled).toBe(false);
      expect(mockSoundManager.setBearSoundEnabled).toHaveBeenCalledWith(false);
    });

    it('should set bear sound enabled directly', async () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      act(() => {
        result.current.setBearSoundEnabled(false);
      });

      expect(result.current.bearSoundEnabled).toBe(false);
      expect(mockSoundManager.setBearSoundEnabled).toHaveBeenCalledWith(false);
    });
  });

  describe('Volume Control', () => {
    it('should set master volume', async () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      act(() => {
        result.current.setMasterVolume(0.5);
      });

      expect(result.current.masterVolume).toBe(0.5);
      expect(mockSoundManager.setMasterVolume).toHaveBeenCalledWith(0.5);
    });

    it('should clamp volume to 0-1 range', async () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Test above 1
      act(() => {
        result.current.setMasterVolume(1.5);
      });

      expect(result.current.masterVolume).toBe(1);

      // Test below 0
      act(() => {
        result.current.setMasterVolume(-0.5);
      });

      expect(result.current.masterVolume).toBe(0);
    });

    it('should support child-safe volume levels (default 0.7)', async () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Default volume should be moderate (0.7) for child safety
      expect(result.current.masterVolume).toBe(0.7);
      expect(result.current.masterVolume).toBeLessThanOrEqual(0.7);
    });
  });

  describe('Reduce Loud Sounds (Accessibility)', () => {
    it('should toggle reduce loud sounds', async () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.reduceLoudSounds).toBe(false);

      act(() => {
        result.current.toggleReduceLoudSounds();
      });

      expect(result.current.reduceLoudSounds).toBe(true);
      expect(mockSoundManager.setReduceLoudSounds).toHaveBeenCalledWith(true);
    });

    it('should set reduce loud sounds directly', async () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      act(() => {
        result.current.setReduceLoudSounds(true);
      });

      expect(result.current.reduceLoudSounds).toBe(true);
      expect(mockSoundManager.setReduceLoudSounds).toHaveBeenCalledWith(true);
    });
  });

  describe('Sound Playback', () => {
    it('should play sound by key', async () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.playSound('ui.tap');
      });

      expect(mockSoundManager.play).toHaveBeenCalledWith('ui.tap', {});
    });

    it('should play sound by event', async () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.playSoundEvent('ADD_TO_WISHLIST');
      });

      expect(mockSoundManager.playEvent).toHaveBeenCalledWith('ADD_TO_WISHLIST', {});
    });

    it('should stop all sounds', async () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.stopAllSounds();
      });

      expect(mockSoundManager.stopAll).toHaveBeenCalled();
    });
  });

  describe('Settings Persistence', () => {
    it('should save settings when changed', async () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      act(() => {
        result.current.setMasterVolume(0.5);
      });

      await waitFor(async () => {
        const saved = await AsyncStorage.getItem('@playbeacon_sound_settings');
        expect(saved).not.toBeNull();
        const parsed = JSON.parse(saved);
        expect(parsed.masterVolume).toBe(0.5);
      });
    });

    it('should reset settings to defaults', async () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Change settings
      act(() => {
        result.current.setMasterVolume(0.2);
        result.current.setSoundEnabled(false);
      });

      // Reset
      await act(async () => {
        await result.current.resetSettings();
      });

      expect(result.current.soundEnabled).toBe(true);
      expect(result.current.bearSoundEnabled).toBe(true);
      expect(result.current.masterVolume).toBe(0.7);
      expect(result.current.reduceLoudSounds).toBe(false);
    });
  });

  describe('useSoundSettings Hook', () => {
    it('should provide only settings-related values', async () => {
      const { result } = renderHook(() => useSoundSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.soundEnabled).toBeDefined();
      });

      // Should have settings
      expect(result.current).toHaveProperty('soundEnabled');
      expect(result.current).toHaveProperty('bearSoundEnabled');
      expect(result.current).toHaveProperty('masterVolume');
      expect(result.current).toHaveProperty('reduceLoudSounds');

      // Should have toggles
      expect(result.current).toHaveProperty('toggleSound');
      expect(result.current).toHaveProperty('toggleBearSound');
      expect(result.current).toHaveProperty('toggleReduceLoudSounds');

      // Should have setters
      expect(result.current).toHaveProperty('setSoundEnabled');
      expect(result.current).toHaveProperty('setBearSoundEnabled');
      expect(result.current).toHaveProperty('setMasterVolume');
      expect(result.current).toHaveProperty('setReduceLoudSounds');

      // Should NOT have playback functions (those are in useSound)
      expect(result.current).not.toHaveProperty('playSound');
      expect(result.current).not.toHaveProperty('playSoundEvent');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useSound is used outside provider', () => {
      expect(() => {
        renderHook(() => useSound());
      }).toThrow('useSound must be used within a SoundProvider');
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const { result } = renderHook(() => useSound(), { wrapper });

      // Should still initialize with defaults
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.soundEnabled).toBe(true);
    });
  });
});
