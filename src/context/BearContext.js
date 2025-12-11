/**
 * Bear Context Provider
 *
 * Global state management for Bear mascot.
 * Handles event-to-animation mapping and provides hooks
 * for triggering Bear reactions from anywhere in the app.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { BearState } from '../components/Bear';

/**
 * Event to animation mapping
 * Maps app events to Bear states
 */
export const BEAR_EVENT_MAP = {
  // Wishlist actions
  ADD_TO_WISHLIST: BearState.CELEBRATE,
  REMOVE_FROM_WISHLIST: BearState.SAD,
  ADD_TO_COLLECTION: BearState.TAP_BOUNCE,

  // User interactions
  TAP: BearState.PAW_POP,
  SWIPE_LEFT: BearState.POINT_LEFT,
  SWIPE_RIGHT: BearState.POINT_RIGHT,
  SCROLL_LEFT: BearState.POINT_LEFT,
  SCROLL_RIGHT: BearState.POINT_RIGHT,

  // Loading states
  LOADING: BearState.THINK,
  LOADING_COMPLETE: BearState.IDLE,

  // Results
  EMPTY_RESULTS: BearState.SAD,
  NEW_RECOMMENDATIONS: BearState.JUMP,
  GAME_FOUND: BearState.TAIL_WAG,

  // Authentication
  LOGGED_IN: BearState.YES,
  LOGGED_OUT: BearState.POINT_RIGHT,
  LOGIN_SUCCESS: BearState.CELEBRATE,
  LOGIN_FAILED: BearState.SAD,

  // Achievements
  ACHIEVEMENT_UNLOCK: BearState.CELEBRATE,
  STREAK_CONTINUE: BearState.JUMP,
  LEVEL_UP: BearState.CELEBRATE,
  XP_GAINED: BearState.TAP_BOUNCE,

  // Errors
  ERROR: BearState.NO,
  NETWORK_ERROR: BearState.SAD,
  TRY_AGAIN: BearState.WAVE,

  // Onboarding
  WELCOME: BearState.WAVE,
  NEXT_STEP: BearState.POINT_RIGHT,
  COMPLETE: BearState.CELEBRATE,

  // Misc
  IDLE: BearState.IDLE,
  WAKE_UP: BearState.SURPRISE,
  SLEEP: BearState.SLEEP,
  THINKING: BearState.THINK,
  HAPPY: BearState.TAIL_WAG,
};

/**
 * States that should auto-return to idle
 */
const AUTO_RETURN_STATES = [
  BearState.CELEBRATE,
  BearState.SAD,
  BearState.WAVE,
  BearState.JUMP,
  BearState.YES,
  BearState.NO,
  BearState.SURPRISE,
  BearState.TAP_BOUNCE,
  BearState.PAW_POP,
  BearState.POINT_LEFT,
  BearState.POINT_RIGHT,
];

/**
 * Duration before returning to idle (ms)
 */
const AUTO_RETURN_DELAY = 2500;

const BearContext = createContext(null);

export function BearProvider({ children }) {
  const [currentState, setCurrentState] = useState(BearState.IDLE);
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState('bottom-right');

  const returnTimerRef = useRef(null);
  const eventQueueRef = useRef([]);
  const isProcessingRef = useRef(false);

  /**
   * Clear any pending return timer
   */
  const clearReturnTimer = useCallback(() => {
    if (returnTimerRef.current) {
      clearTimeout(returnTimerRef.current);
      returnTimerRef.current = null;
    }
  }, []);

  /**
   * Schedule return to idle
   */
  const scheduleReturnToIdle = useCallback((delay = AUTO_RETURN_DELAY) => {
    clearReturnTimer();
    returnTimerRef.current = setTimeout(() => {
      setCurrentState(BearState.IDLE);
      // Process next event in queue if any
      processEventQueue();
    }, delay);
  }, [clearReturnTimer]);

  /**
   * Process event queue
   */
  const processEventQueue = useCallback(() => {
    if (isProcessingRef.current || eventQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    const nextEvent = eventQueueRef.current.shift();
    const newState = BEAR_EVENT_MAP[nextEvent] || BearState.IDLE;

    setCurrentState(newState);

    if (AUTO_RETURN_STATES.includes(newState)) {
      scheduleReturnToIdle();
    }

    isProcessingRef.current = false;
  }, [scheduleReturnToIdle]);

  /**
   * Trigger Bear reaction by event name
   */
  const triggerEvent = useCallback((eventName, options = {}) => {
    const { immediate = false, queue = true } = options;

    if (immediate) {
      clearReturnTimer();
      const newState = BEAR_EVENT_MAP[eventName] || BearState.IDLE;
      setCurrentState(newState);

      if (AUTO_RETURN_STATES.includes(newState)) {
        scheduleReturnToIdle();
      }
    } else if (queue) {
      eventQueueRef.current.push(eventName);
      if (!isProcessingRef.current && currentState === BearState.IDLE) {
        processEventQueue();
      }
    }
  }, [clearReturnTimer, scheduleReturnToIdle, processEventQueue, currentState]);

  /**
   * Directly set Bear state
   */
  const setState = useCallback((state, autoReturn = true) => {
    clearReturnTimer();
    setCurrentState(state);

    if (autoReturn && AUTO_RETURN_STATES.includes(state)) {
      scheduleReturnToIdle();
    }
  }, [clearReturnTimer, scheduleReturnToIdle]);

  /**
   * Show/hide Bear
   */
  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);

  /**
   * Set Bear position
   */
  const setPositionValue = useCallback((pos) => {
    setPosition(pos);
  }, []);

  /**
   * Reset to idle immediately
   */
  const reset = useCallback(() => {
    clearReturnTimer();
    eventQueueRef.current = [];
    setCurrentState(BearState.IDLE);
  }, [clearReturnTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearReturnTimer();
    };
  }, [clearReturnTimer]);

  const value = {
    // State
    currentState,
    isVisible,
    position,

    // Actions
    triggerEvent,
    setState,
    show,
    hide,
    setPosition: setPositionValue,
    reset,

    // Event map for reference
    eventMap: BEAR_EVENT_MAP,
  };

  return (
    <BearContext.Provider value={value}>
      {children}
    </BearContext.Provider>
  );
}

/**
 * Hook to access Bear context
 */
export function useBear() {
  const context = useContext(BearContext);
  if (!context) {
    throw new Error('useBear must be used within a BearProvider');
  }
  return context;
}

/**
 * Hook to trigger a specific Bear event
 *
 * Usage:
 *   const triggerCelebrate = useBearEvent('ADD_TO_WISHLIST');
 *   triggerCelebrate(); // Bear celebrates
 */
export function useBearEvent(eventName) {
  const { triggerEvent } = useBear();
  return useCallback(
    (options) => triggerEvent(eventName, options),
    [triggerEvent, eventName]
  );
}

/**
 * Hook to react to loading states
 *
 * Usage:
 *   const { startLoading, stopLoading } = useBearLoading();
 *   startLoading(); // Bear thinks
 *   // ... fetch data
 *   stopLoading(); // Bear returns to idle
 */
export function useBearLoading() {
  const { setState } = useBear();

  const startLoading = useCallback(() => {
    setState(BearState.THINK, false);
  }, [setState]);

  const stopLoading = useCallback((success = true) => {
    if (success) {
      setState(BearState.IDLE);
    } else {
      setState(BearState.SAD);
    }
  }, [setState]);

  return { startLoading, stopLoading };
}

export default BearContext;
