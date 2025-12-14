/**
 * useHaptics Hook Tests
 *
 * Tests for haptic feedback functionality including
 * debouncing, different feedback types, and fallback behavior.
 */

import { renderHook, act } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { Vibration } from 'react-native';

// Mock Vibration API
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Vibration: {
    vibrate: jest.fn(),
  },
}));

import {
  useHaptics,
  triggerHaptic,
  HapticType,
} from '../../hooks/useHaptics';

describe('useHaptics Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('HapticType Constants', () => {
    it('should have all expected haptic types', () => {
      expect(HapticType.LIGHT).toBe('light');
      expect(HapticType.MEDIUM).toBe('medium');
      expect(HapticType.HEAVY).toBe('heavy');
      expect(HapticType.SUCCESS).toBe('success');
      expect(HapticType.WARNING).toBe('warning');
      expect(HapticType.ERROR).toBe('error');
      expect(HapticType.SELECTION).toBe('selection');
    });
  });

  describe('triggerHaptic Function', () => {
    it('should call impactAsync for LIGHT type', async () => {
      await triggerHaptic(HapticType.LIGHT);

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('should call impactAsync for MEDIUM type', async () => {
      await triggerHaptic(HapticType.MEDIUM);

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });

    it('should call impactAsync for HEAVY type', async () => {
      await triggerHaptic(HapticType.HEAVY);

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Heavy
      );
    });

    it('should call notificationAsync for SUCCESS type', async () => {
      await triggerHaptic(HapticType.SUCCESS);

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it('should call notificationAsync for WARNING type', async () => {
      await triggerHaptic(HapticType.WARNING);

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning
      );
    });

    it('should call notificationAsync for ERROR type', async () => {
      await triggerHaptic(HapticType.ERROR);

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });

    it('should call selectionAsync for SELECTION type', async () => {
      await triggerHaptic(HapticType.SELECTION);

      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });

    it('should default to MEDIUM type', async () => {
      await triggerHaptic();

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });
  });

  describe('useHaptics Hook - Basic Usage', () => {
    it('should return haptic function', () => {
      const { result } = renderHook(() => useHaptics());

      expect(typeof result.current.haptic).toBe('function');
    });

    it('should return trigger function', () => {
      const { result } = renderHook(() => useHaptics());

      expect(typeof result.current.trigger).toBe('function');
    });

    it('should return isAvailable boolean', () => {
      const { result } = renderHook(() => useHaptics());

      expect(typeof result.current.isAvailable).toBe('boolean');
    });

    it('should trigger haptic when haptic() is called', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.haptic(HapticType.LIGHT);
      });

      expect(Haptics.impactAsync).toHaveBeenCalled();
    });
  });

  describe('Convenience Methods', () => {
    it('should have tap method that triggers LIGHT haptic', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.tap();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('should have press method that triggers MEDIUM haptic', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.press();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });

    it('should have longPress method that triggers HEAVY haptic', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.longPress();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Heavy
      );
    });

    it('should have selection method', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.selection();
      });

      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });

    it('should have success method', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.success();
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it('should have warning method', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.warning();
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning
      );
    });

    it('should have error method', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.error();
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });
  });

  describe('Game-Specific Methods', () => {
    it('should have like method that triggers SUCCESS', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.like();
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it('should have dislike method that triggers MEDIUM', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.dislike();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });

    it('should have skip method that triggers LIGHT', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.skip();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('should have swipe method that triggers LIGHT', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.swipe();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('should have addToCollection method that triggers SUCCESS', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.addToCollection();
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it('should have badgeUnlock method that triggers SUCCESS', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.badgeUnlock();
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it('should have dailyReward method that triggers SUCCESS', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.dailyReward();
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });
  });

  describe('Debouncing', () => {
    it('should debounce rapid haptic calls', async () => {
      const { result } = renderHook(() => useHaptics());

      // Trigger multiple haptics rapidly
      await act(async () => {
        await result.current.tap();
        await result.current.tap();
        await result.current.tap();
      });

      // Should only trigger once due to debouncing (within 50ms)
      expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    });

    it('should allow haptics after debounce period', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.tap();
      });

      // Advance time past debounce period (50ms)
      act(() => {
        jest.advanceTimersByTime(60);
      });

      await act(async () => {
        await result.current.tap();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('Enabled/Disabled', () => {
    it('should not trigger haptics when disabled', async () => {
      const { result } = renderHook(() => useHaptics(false));

      await act(async () => {
        await result.current.tap();
      });

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should trigger haptics when enabled', async () => {
      const { result } = renderHook(() => useHaptics(true));

      await act(async () => {
        await result.current.tap();
      });

      expect(Haptics.impactAsync).toHaveBeenCalled();
    });

    it('should default to enabled', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.tap();
      });

      expect(Haptics.impactAsync).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle haptic errors gracefully', async () => {
      Haptics.impactAsync.mockRejectedValueOnce(new Error('Haptic error'));

      const { result } = renderHook(() => useHaptics());

      // Should not throw
      await expect(async () => {
        await act(async () => {
          await result.current.tap();
        });
      }).not.toThrow();
    });
  });
});
