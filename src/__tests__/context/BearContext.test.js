/**
 * BearContext Tests
 *
 * Tests for Bear mascot state management, event-to-animation mapping,
 * and auto-return behavior.
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';

// Mock Bear component
jest.mock('../../components/Bear', () => ({
  BearState: {
    IDLE: 'idle',
    CELEBRATE: 'celebrate',
    SAD: 'sad',
    WAVE: 'wave',
    JUMP: 'jump',
    YES: 'yes',
    NO: 'no',
    THINK: 'think',
    SLEEP: 'sleep',
    SURPRISE: 'surprise',
    TAP_BOUNCE: 'tap_bounce',
    PAW_POP: 'paw_pop',
    TAIL_WAG: 'tail_wag',
    POINT_LEFT: 'point_left',
    POINT_RIGHT: 'point_right',
  },
}));

import {
  BearProvider,
  useBear,
  useBearEvent,
  useBearLoading,
  BEAR_EVENT_MAP,
} from '../../context/BearContext';
import { BearState } from '../../components/Bear';

const wrapper = ({ children }) => <BearProvider>{children}</BearProvider>;

describe('BearContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('should start with idle state', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      expect(result.current.currentState).toBe(BearState.IDLE);
    });

    it('should be visible by default', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      expect(result.current.isVisible).toBe(true);
    });

    it('should have default position', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      expect(result.current.position).toBe('bottom-right');
    });

    it('should expose event map for reference', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      expect(result.current.eventMap).toBe(BEAR_EVENT_MAP);
    });
  });

  describe('Event Triggering', () => {
    it('should map ADD_TO_WISHLIST to celebrate state', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      act(() => {
        result.current.triggerEvent('ADD_TO_WISHLIST', { immediate: true });
      });

      expect(result.current.currentState).toBe(BearState.CELEBRATE);
    });

    it('should map REMOVE_FROM_WISHLIST to sad state', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      act(() => {
        result.current.triggerEvent('REMOVE_FROM_WISHLIST', { immediate: true });
      });

      expect(result.current.currentState).toBe(BearState.SAD);
    });

    it('should map ERROR to no state', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      act(() => {
        result.current.triggerEvent('ERROR', { immediate: true });
      });

      expect(result.current.currentState).toBe(BearState.NO);
    });

    it('should map LOADING to think state', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      act(() => {
        result.current.triggerEvent('LOADING', { immediate: true });
      });

      expect(result.current.currentState).toBe(BearState.THINK);
    });

    it('should map WELCOME to wave state (onboarding)', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      act(() => {
        result.current.triggerEvent('WELCOME', { immediate: true });
      });

      expect(result.current.currentState).toBe(BearState.WAVE);
    });

    it('should map ACHIEVEMENT_UNLOCK to celebrate state', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      act(() => {
        result.current.triggerEvent('ACHIEVEMENT_UNLOCK', { immediate: true });
      });

      expect(result.current.currentState).toBe(BearState.CELEBRATE);
    });

    it('should fall back to idle for unknown events', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      act(() => {
        result.current.triggerEvent('UNKNOWN_EVENT', { immediate: true });
      });

      expect(result.current.currentState).toBe(BearState.IDLE);
    });
  });

  describe('Auto Return to Idle', () => {
    it('should auto-return to idle after celebration', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      act(() => {
        result.current.triggerEvent('ADD_TO_WISHLIST', { immediate: true });
      });

      expect(result.current.currentState).toBe(BearState.CELEBRATE);

      // Fast forward past auto-return delay (2500ms)
      act(() => {
        jest.advanceTimersByTime(2500);
      });

      expect(result.current.currentState).toBe(BearState.IDLE);
    });

    it('should auto-return to idle after sad state', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      act(() => {
        result.current.triggerEvent('REMOVE_FROM_WISHLIST', { immediate: true });
      });

      expect(result.current.currentState).toBe(BearState.SAD);

      act(() => {
        jest.advanceTimersByTime(2500);
      });

      expect(result.current.currentState).toBe(BearState.IDLE);
    });

    it('should NOT auto-return from think state (loading)', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      act(() => {
        result.current.setState(BearState.THINK, false);
      });

      expect(result.current.currentState).toBe(BearState.THINK);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should still be thinking (loading doesn't auto-return)
      expect(result.current.currentState).toBe(BearState.THINK);
    });
  });

  describe('Direct State Setting', () => {
    it('should set state directly', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      act(() => {
        result.current.setState(BearState.JUMP);
      });

      expect(result.current.currentState).toBe(BearState.JUMP);
    });

    it('should disable auto-return when specified', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      act(() => {
        result.current.setState(BearState.CELEBRATE, false);
      });

      expect(result.current.currentState).toBe(BearState.CELEBRATE);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should NOT return to idle since autoReturn is false
      expect(result.current.currentState).toBe(BearState.CELEBRATE);
    });
  });

  describe('Visibility Control', () => {
    it('should show Bear', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      act(() => {
        result.current.hide();
      });

      expect(result.current.isVisible).toBe(false);

      act(() => {
        result.current.show();
      });

      expect(result.current.isVisible).toBe(true);
    });

    it('should hide Bear', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      act(() => {
        result.current.hide();
      });

      expect(result.current.isVisible).toBe(false);
    });
  });

  describe('Position Control', () => {
    it('should set Bear position', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      act(() => {
        result.current.setPosition('bottom-left');
      });

      expect(result.current.position).toBe('bottom-left');
    });
  });

  describe('Reset', () => {
    it('should reset to idle immediately', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      act(() => {
        result.current.setState(BearState.CELEBRATE, false);
      });

      expect(result.current.currentState).toBe(BearState.CELEBRATE);

      act(() => {
        result.current.reset();
      });

      expect(result.current.currentState).toBe(BearState.IDLE);
    });

    it('should clear event queue on reset', () => {
      const { result } = renderHook(() => useBear(), { wrapper });

      // Queue up multiple events
      act(() => {
        result.current.triggerEvent('ADD_TO_WISHLIST', { queue: true });
        result.current.triggerEvent('ACHIEVEMENT_UNLOCK', { queue: true });
        result.current.triggerEvent('WELCOME', { queue: true });
      });

      // Reset should clear queue
      act(() => {
        result.current.reset();
      });

      expect(result.current.currentState).toBe(BearState.IDLE);
    });
  });

  describe('useBearEvent Hook', () => {
    it('should create a trigger function for specific event', () => {
      const { result } = renderHook(
        () => {
          const bear = useBear();
          const triggerCelebrate = useBearEvent('ADD_TO_WISHLIST');
          return { bear, triggerCelebrate };
        },
        { wrapper }
      );

      act(() => {
        result.current.triggerCelebrate({ immediate: true });
      });

      expect(result.current.bear.currentState).toBe(BearState.CELEBRATE);
    });
  });

  describe('useBearLoading Hook', () => {
    it('should provide startLoading and stopLoading functions', () => {
      const { result } = renderHook(
        () => {
          const bear = useBear();
          const loading = useBearLoading();
          return { bear, loading };
        },
        { wrapper }
      );

      expect(result.current.loading.startLoading).toBeDefined();
      expect(result.current.loading.stopLoading).toBeDefined();
    });

    it('should set think state on startLoading', () => {
      const { result } = renderHook(
        () => {
          const bear = useBear();
          const loading = useBearLoading();
          return { bear, loading };
        },
        { wrapper }
      );

      act(() => {
        result.current.loading.startLoading();
      });

      expect(result.current.bear.currentState).toBe(BearState.THINK);
    });

    it('should return to idle on successful stopLoading', () => {
      const { result } = renderHook(
        () => {
          const bear = useBear();
          const loading = useBearLoading();
          return { bear, loading };
        },
        { wrapper }
      );

      act(() => {
        result.current.loading.startLoading();
      });

      expect(result.current.bear.currentState).toBe(BearState.THINK);

      act(() => {
        result.current.loading.stopLoading(true);
      });

      expect(result.current.bear.currentState).toBe(BearState.IDLE);
    });

    it('should show sad state on failed stopLoading', () => {
      const { result } = renderHook(
        () => {
          const bear = useBear();
          const loading = useBearLoading();
          return { bear, loading };
        },
        { wrapper }
      );

      act(() => {
        result.current.loading.startLoading();
      });

      act(() => {
        result.current.loading.stopLoading(false);
      });

      expect(result.current.bear.currentState).toBe(BearState.SAD);
    });
  });

  describe('Event Map Coverage', () => {
    it('should have mappings for all wishlist actions', () => {
      expect(BEAR_EVENT_MAP.ADD_TO_WISHLIST).toBeDefined();
      expect(BEAR_EVENT_MAP.REMOVE_FROM_WISHLIST).toBeDefined();
      expect(BEAR_EVENT_MAP.ADD_TO_COLLECTION).toBeDefined();
    });

    it('should have mappings for user interactions', () => {
      expect(BEAR_EVENT_MAP.TAP).toBeDefined();
      expect(BEAR_EVENT_MAP.SWIPE_LEFT).toBeDefined();
      expect(BEAR_EVENT_MAP.SWIPE_RIGHT).toBeDefined();
    });

    it('should have mappings for loading states', () => {
      expect(BEAR_EVENT_MAP.LOADING).toBeDefined();
      expect(BEAR_EVENT_MAP.LOADING_COMPLETE).toBeDefined();
    });

    it('should have mappings for achievements', () => {
      expect(BEAR_EVENT_MAP.ACHIEVEMENT_UNLOCK).toBeDefined();
      expect(BEAR_EVENT_MAP.STREAK_CONTINUE).toBeDefined();
      expect(BEAR_EVENT_MAP.LEVEL_UP).toBeDefined();
      expect(BEAR_EVENT_MAP.XP_GAINED).toBeDefined();
    });

    it('should have mappings for error states', () => {
      expect(BEAR_EVENT_MAP.ERROR).toBeDefined();
      expect(BEAR_EVENT_MAP.NETWORK_ERROR).toBeDefined();
      expect(BEAR_EVENT_MAP.TRY_AGAIN).toBeDefined();
    });

    it('should have mappings for onboarding', () => {
      expect(BEAR_EVENT_MAP.WELCOME).toBeDefined();
      expect(BEAR_EVENT_MAP.NEXT_STEP).toBeDefined();
      expect(BEAR_EVENT_MAP.COMPLETE).toBeDefined();
    });

    it('should have mappings for authentication', () => {
      expect(BEAR_EVENT_MAP.LOGGED_IN).toBeDefined();
      expect(BEAR_EVENT_MAP.LOGGED_OUT).toBeDefined();
      expect(BEAR_EVENT_MAP.LOGIN_SUCCESS).toBeDefined();
      expect(BEAR_EVENT_MAP.LOGIN_FAILED).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useBear is used outside provider', () => {
      expect(() => {
        renderHook(() => useBear());
      }).toThrow('useBear must be used within a BearProvider');
    });
  });
});
