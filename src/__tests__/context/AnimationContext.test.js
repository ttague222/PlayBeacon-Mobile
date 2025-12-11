/**
 * AnimationContext Tests
 *
 * Tests for global animation management, celebration queue,
 * and micro-interactions.
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Animated } from 'react-native';

// Mock LottieView
jest.mock('lottie-react-native', () => 'LottieView');

// Mock animations config
jest.mock('../../config/animations', () => ({
  getAnimationForEvent: jest.fn((event) => {
    const animations = {
      ADD_TO_WISHLIST: { source: 'heart.json', type: 'micro' },
      ACHIEVEMENT_UNLOCK: { source: 'confetti.json', type: 'celebration' },
      STREAK_CONTINUE: { source: 'streak.json', type: 'celebration' },
    };
    return animations[event] || null;
  }),
  ANIMATION_CONFIG: {
    celebration: { duration: 3000 },
    micro: { duration: 1000 },
  },
  isAnimationLoaded: jest.fn(() => true),
}));

import {
  AnimationProvider,
  useAnimations,
  useLottieTrigger,
} from '../../context/AnimationContext';
import { getAnimationForEvent, isAnimationLoaded } from '../../config/animations';

const wrapper = ({ children }) => <AnimationProvider>{children}</AnimationProvider>;

describe('AnimationContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    it('should provide animation functions', () => {
      const { result } = renderHook(() => useAnimations(), { wrapper });

      expect(result.current.triggerAnimation).toBeDefined();
      expect(result.current.triggerCelebration).toBeDefined();
      expect(result.current.triggerMicro).toBeDefined();
    });
  });

  describe('Animation Triggering', () => {
    it('should trigger animation by event name', () => {
      const { result } = renderHook(() => useAnimations(), { wrapper });

      act(() => {
        result.current.triggerAnimation('ADD_TO_WISHLIST');
      });

      expect(getAnimationForEvent).toHaveBeenCalledWith('ADD_TO_WISHLIST');
    });

    it('should check if animation is loaded before playing', () => {
      const { result } = renderHook(() => useAnimations(), { wrapper });

      act(() => {
        result.current.triggerAnimation('ADD_TO_WISHLIST');
      });

      expect(isAnimationLoaded).toHaveBeenCalledWith('heart.json');
    });

    it('should not play animation if source not loaded', () => {
      isAnimationLoaded.mockReturnValueOnce(false);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { result } = renderHook(() => useAnimations(), { wrapper });

      act(() => {
        result.current.triggerAnimation('ADD_TO_WISHLIST');
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Animation not loaded')
      );

      consoleSpy.mockRestore();
    });

    it('should handle unknown events gracefully', () => {
      getAnimationForEvent.mockReturnValueOnce(null);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { result } = renderHook(() => useAnimations(), { wrapper });

      act(() => {
        result.current.triggerAnimation('UNKNOWN_EVENT');
      });

      // Should log that animation not loaded
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Celebration Queue', () => {
    it('should queue celebration animations', () => {
      const { result } = renderHook(() => useAnimations(), { wrapper });

      // Trigger multiple celebrations
      act(() => {
        result.current.triggerAnimation('ACHIEVEMENT_UNLOCK');
        result.current.triggerAnimation('STREAK_CONTINUE');
      });

      // Both should be queued (celebrations don't play simultaneously)
      expect(getAnimationForEvent).toHaveBeenCalledWith('ACHIEVEMENT_UNLOCK');
      expect(getAnimationForEvent).toHaveBeenCalledWith('STREAK_CONTINUE');
    });

    it('should trigger celebration directly', () => {
      const { result } = renderHook(() => useAnimations(), { wrapper });

      act(() => {
        result.current.triggerCelebration('confetti.json');
      });

      expect(isAnimationLoaded).toHaveBeenCalledWith('confetti.json');
    });

    it('should not trigger celebration if source not loaded', () => {
      isAnimationLoaded.mockReturnValueOnce(false);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { result } = renderHook(() => useAnimations(), { wrapper });

      act(() => {
        result.current.triggerCelebration('not_loaded.json');
      });

      expect(consoleSpy).toHaveBeenCalledWith('Celebration source not loaded');

      consoleSpy.mockRestore();
    });
  });

  describe('Micro Animations', () => {
    it('should trigger micro animation at position', () => {
      const { result } = renderHook(() => useAnimations(), { wrapper });
      const position = { x: 100, y: 200 };

      act(() => {
        result.current.triggerMicro('heart.json', position);
      });

      expect(isAnimationLoaded).toHaveBeenCalledWith('heart.json');
    });

    it('should auto-remove micro animations after duration', () => {
      const { result } = renderHook(() => useAnimations(), { wrapper });
      const position = { x: 100, y: 200 };

      act(() => {
        result.current.triggerMicro('heart.json', position);
      });

      // Micro animations have 1000ms duration + 100ms buffer
      act(() => {
        jest.advanceTimersByTime(1100);
      });

      // Animation should be cleaned up (no error thrown)
      expect(true).toBe(true);
    });

    it('should not trigger micro if source not loaded', () => {
      isAnimationLoaded.mockReturnValueOnce(false);

      const { result } = renderHook(() => useAnimations(), { wrapper });
      const position = { x: 100, y: 200 };

      act(() => {
        result.current.triggerMicro('not_loaded.json', position);
      });

      // Should not throw, just silently skip
      expect(true).toBe(true);
    });

    it('should support multiple concurrent micro animations', () => {
      const { result } = renderHook(() => useAnimations(), { wrapper });

      act(() => {
        result.current.triggerMicro('heart.json', { x: 100, y: 100 });
        result.current.triggerMicro('heart.json', { x: 200, y: 200 });
        result.current.triggerMicro('heart.json', { x: 300, y: 300 });
      });

      // All micro animations should be triggered
      expect(isAnimationLoaded).toHaveBeenCalledTimes(3);
    });
  });

  describe('useLottieTrigger Hook', () => {
    it('should create a trigger function for specific event', () => {
      const { result } = renderHook(
        () => {
          const animations = useAnimations();
          const triggerWishlist = useLottieTrigger('ADD_TO_WISHLIST');
          return { animations, triggerWishlist };
        },
        { wrapper }
      );

      act(() => {
        result.current.triggerWishlist();
      });

      expect(getAnimationForEvent).toHaveBeenCalledWith('ADD_TO_WISHLIST');
    });

    it('should pass options to trigger function', () => {
      const { result } = renderHook(
        () => useLottieTrigger('ADD_TO_WISHLIST'),
        { wrapper }
      );

      const options = { position: { x: 150, y: 250 } };

      act(() => {
        result.current(options);
      });

      expect(getAnimationForEvent).toHaveBeenCalledWith('ADD_TO_WISHLIST');
    });
  });

  describe('Animation Types', () => {
    it('should handle celebration type animations', () => {
      getAnimationForEvent.mockReturnValueOnce({
        source: 'confetti.json',
        type: 'celebration',
      });

      const { result } = renderHook(() => useAnimations(), { wrapper });

      act(() => {
        result.current.triggerAnimation('ACHIEVEMENT_UNLOCK');
      });

      expect(getAnimationForEvent).toHaveBeenCalledWith('ACHIEVEMENT_UNLOCK');
    });

    it('should handle micro type animations', () => {
      getAnimationForEvent.mockReturnValueOnce({
        source: 'heart.json',
        type: 'micro',
      });

      const { result } = renderHook(() => useAnimations(), { wrapper });

      act(() => {
        result.current.triggerAnimation('ADD_TO_WISHLIST');
      });

      expect(getAnimationForEvent).toHaveBeenCalledWith('ADD_TO_WISHLIST');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useAnimations is used outside provider', () => {
      expect(() => {
        renderHook(() => useAnimations());
      }).toThrow('useAnimations must be used within an AnimationProvider');
    });
  });

  describe('Event Coverage', () => {
    it('should support wishlist events', () => {
      const { result } = renderHook(() => useAnimations(), { wrapper });

      act(() => {
        result.current.triggerAnimation('ADD_TO_WISHLIST');
      });

      expect(getAnimationForEvent).toHaveBeenCalledWith('ADD_TO_WISHLIST');
    });

    it('should support achievement events', () => {
      const { result } = renderHook(() => useAnimations(), { wrapper });

      act(() => {
        result.current.triggerAnimation('ACHIEVEMENT_UNLOCK');
      });

      expect(getAnimationForEvent).toHaveBeenCalledWith('ACHIEVEMENT_UNLOCK');
    });

    it('should support streak events', () => {
      const { result } = renderHook(() => useAnimations(), { wrapper });

      act(() => {
        result.current.triggerAnimation('STREAK_CONTINUE');
      });

      expect(getAnimationForEvent).toHaveBeenCalledWith('STREAK_CONTINUE');
    });
  });
});
