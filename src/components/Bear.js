/**
 * Bear Mascot Component
 *
 * Bear the Bernese Mountain Dog - PlayBeacon's friendly mascot!
 * Acts as a guide for children, reward companion, and brand anchor.
 *
 * Features:
 * - Auto-blink: Randomly blinks every 2-6 seconds
 * - Random idle behaviors: earWiggle, tapBounce, surprise every 10-25 seconds
 * - State machine: Automatic transitions back to idle
 * - Interactive: Responds to taps with pawPop
 * - Sleep timeout: Goes to sleep after prolonged inactivity
 */

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import SoundManager from '../services/SoundManager';

// Bear mascot animations are disabled - return null for all
const MASCOT_ANIMATIONS = {
  idle: null,
  blink: null,
  sleep: null,
  point_left: null,
  point_right: null,
  wave: null,
  celebrate: null,
  sad: null,
  think: null,
  surprise: null,
  jump: null,
  yes: null,
  no: null,
  tail_wag: null,
  ear_wiggle: null,
  tap_bounce: null,
  paw_pop: null,
};

/**
 * Bear animation states
 */
export const BearState = {
  IDLE: 'idle',
  BLINK: 'blink',
  CELEBRATE: 'celebrate',
  SAD: 'sad',
  THINK: 'think',
  POINT_LEFT: 'pointLeft',
  POINT_RIGHT: 'pointRight',
  WAVE: 'wave',
  SLEEP: 'sleep',
  JUMP: 'jump',
  PAW_POP: 'pawPop',
  NO: 'no',
  YES: 'yes',
  TAP_BOUNCE: 'tapBounce',
  SURPRISE: 'surprise',
  EAR_WIGGLE: 'earWiggle',
  TAIL_WAG: 'tailWag',
};

/**
 * Maps state names to animation sources
 * Note: All animations are currently disabled
 */
const STATE_TO_ANIMATION = {
  [BearState.IDLE]: MASCOT_ANIMATIONS.idle,
  [BearState.BLINK]: MASCOT_ANIMATIONS.blink,
  [BearState.CELEBRATE]: MASCOT_ANIMATIONS.celebrate,
  [BearState.SAD]: MASCOT_ANIMATIONS.sad,
  [BearState.THINK]: MASCOT_ANIMATIONS.think,
  [BearState.POINT_LEFT]: MASCOT_ANIMATIONS.point_left,
  [BearState.POINT_RIGHT]: MASCOT_ANIMATIONS.point_right,
  [BearState.WAVE]: MASCOT_ANIMATIONS.wave,
  [BearState.SLEEP]: MASCOT_ANIMATIONS.sleep,
  [BearState.JUMP]: MASCOT_ANIMATIONS.jump,
  [BearState.PAW_POP]: MASCOT_ANIMATIONS.paw_pop,
  [BearState.NO]: MASCOT_ANIMATIONS.no,
  [BearState.YES]: MASCOT_ANIMATIONS.yes,
  [BearState.TAP_BOUNCE]: MASCOT_ANIMATIONS.tap_bounce,
  [BearState.SURPRISE]: MASCOT_ANIMATIONS.surprise,
  [BearState.EAR_WIGGLE]: MASCOT_ANIMATIONS.ear_wiggle,
  [BearState.TAIL_WAG]: MASCOT_ANIMATIONS.tail_wag,
};

/**
 * States that should loop
 */
const LOOPING_STATES = [
  BearState.IDLE,
  BearState.BLINK,
  BearState.SLEEP,
  BearState.THINK,
  BearState.SAD,
  BearState.TAIL_WAG,
  BearState.EAR_WIGGLE,
];

/**
 * States that auto-return to idle after playing
 */
const TRANSIENT_STATES = [
  BearState.BLINK,
  BearState.WAVE,
  BearState.CELEBRATE,
  BearState.SURPRISE,
  BearState.JUMP,
  BearState.YES,
  BearState.NO,
  BearState.POINT_LEFT,
  BearState.POINT_RIGHT,
  BearState.TAP_BOUNCE,
  BearState.PAW_POP,
];

/**
 * Random idle behaviors (played occasionally during idle)
 */
const RANDOM_IDLE_BEHAVIORS = [
  BearState.EAR_WIGGLE,
  BearState.TAP_BOUNCE,
  BearState.SURPRISE,
];

/**
 * Maps Bear states to sound keys (using new category.sound format)
 */
const STATE_TO_SOUND = {
  [BearState.CELEBRATE]: 'bear.celebrate',
  [BearState.SAD]: 'bear.sad',
  [BearState.THINK]: 'bear.sniff',
  [BearState.SLEEP]: 'bear.sleep',
  [BearState.SURPRISE]: 'bear.surprise',
  [BearState.PAW_POP]: 'bear.pawpop',
  [BearState.TAP_BOUNCE]: 'bear.pawpop',
  [BearState.TAIL_WAG]: 'bear.tailwag',
  [BearState.EAR_WIGGLE]: 'bear.earwiggle',
  [BearState.JUMP]: 'bear.celebrate',
  [BearState.YES]: 'bear.pawpop',
  [BearState.NO]: 'bear.sad',
  [BearState.WAVE]: 'bear.pawpop',
};

/**
 * Random idle sounds (played occasionally with behaviors)
 * Maps idle behaviors to their sounds
 */
const IDLE_BEHAVIOR_SOUNDS = {
  [BearState.EAR_WIGGLE]: 'bear.earwiggle',
  [BearState.TAP_BOUNCE]: 'bear.pawpop',
  [BearState.SURPRISE]: 'bear.surprise',
};

/**
 * Random idle sound interval range (ms)
 * Bear will emit random sounds every 20-35 seconds during idle
 */
const IDLE_SOUND_MIN_INTERVAL = 20000;
const IDLE_SOUND_MAX_INTERVAL = 35000;

/**
 * Random idle sounds that can play without visual animation
 */
const RANDOM_IDLE_SOUNDS = [
  'bear.sniff',
  'bear.tailwag',
  'bear.earwiggle',
  'bear.happy',
];

/**
 * Bear Component
 *
 * @param {Object} props
 * @param {string} props.state - Animation state to play
 * @param {number} props.size - Size in pixels (default: 140)
 * @param {boolean} props.loop - Override loop behavior
 * @param {boolean} props.autoBlink - Enable random blinking (default: true)
 * @param {boolean} props.autoIdleBehaviors - Enable random idle behaviors (default: true)
 * @param {number} props.sleepTimeout - Seconds before sleep (0 to disable, default: 0)
 * @param {Object} props.style - Additional container styles
 * @param {Function} props.onPress - Tap handler (default: plays pawPop)
 * @param {boolean} props.interactive - Enable tap interactions (default: true)
 * @param {number} props.opacity - Opacity level (default: 0.95)
 * @param {boolean} props.soundEnabled - Enable sound effects (default: true)
 */
export default function Bear({
  state = BearState.IDLE,
  size = 140,
  loop,
  autoBlink = true,
  autoIdleBehaviors = true,
  sleepTimeout = 0,
  style,
  onPress,
  interactive = true,
  opacity = 0.95,
  soundEnabled = true,
}) {
  const animationRef = useRef(null);
  const [currentState, setCurrentState] = useState(state);
  const [internalState, setInternalState] = useState(null); // For auto-behaviors

  // Timers
  const blinkTimerRef = useRef(null);
  const idleBehaviorTimerRef = useRef(null);
  const idleSoundTimerRef = useRef(null);
  const sleepTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Scale animation for entrance
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Track previous state for sound triggering
  const prevActiveStateRef = useRef(null);

  // Determine actual state (internal overrides external for auto-behaviors)
  const activeState = internalState || currentState;

  /**
   * Play sound for state change
   */
  const playStateSound = useCallback((newState) => {
    if (!soundEnabled) return;
    const soundKey = STATE_TO_SOUND[newState];
    if (soundKey) {
      SoundManager.play(soundKey);
    }
  }, [soundEnabled]);

  // Play sound when active state changes
  useEffect(() => {
    if (activeState !== prevActiveStateRef.current && activeState !== BearState.IDLE && activeState !== BearState.BLINK) {
      playStateSound(activeState);
    }
    prevActiveStateRef.current = activeState;
  }, [activeState, playStateSound]);

  // Get animation source
  const animationSource = useMemo(() => {
    return STATE_TO_ANIMATION[activeState] || STATE_TO_ANIMATION[BearState.IDLE];
  }, [activeState]);

  // Determine if should loop
  const shouldLoop = useMemo(() => {
    if (loop !== undefined) return loop;
    return LOOPING_STATES.includes(activeState);
  }, [activeState, loop]);

  // Update state when prop changes
  useEffect(() => {
    setCurrentState(state);
    setInternalState(null);
    lastActivityRef.current = Date.now();
  }, [state]);

  // Random blink timer
  useEffect(() => {
    if (!autoBlink || currentState !== BearState.IDLE) {
      return;
    }

    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 4000; // 2-6 seconds
      blinkTimerRef.current = setTimeout(() => {
        if (currentState === BearState.IDLE && !internalState) {
          setInternalState(BearState.BLINK);
        }
        scheduleBlink();
      }, delay);
    };

    scheduleBlink();

    return () => {
      if (blinkTimerRef.current) {
        clearTimeout(blinkTimerRef.current);
      }
    };
  }, [autoBlink, currentState, internalState]);

  // Random idle behavior timer
  useEffect(() => {
    if (!autoIdleBehaviors || currentState !== BearState.IDLE) {
      return;
    }

    const scheduleIdleBehavior = () => {
      const delay = 10000 + Math.random() * 15000; // 10-25 seconds
      idleBehaviorTimerRef.current = setTimeout(() => {
        if (currentState === BearState.IDLE && !internalState) {
          const randomBehavior = RANDOM_IDLE_BEHAVIORS[
            Math.floor(Math.random() * RANDOM_IDLE_BEHAVIORS.length)
          ];
          setInternalState(randomBehavior);
        }
        scheduleIdleBehavior();
      }, delay);
    };

    scheduleIdleBehavior();

    return () => {
      if (idleBehaviorTimerRef.current) {
        clearTimeout(idleBehaviorTimerRef.current);
      }
    };
  }, [autoIdleBehaviors, currentState, internalState]);

  // Random idle sound timer (20-35 seconds)
  useEffect(() => {
    if (!soundEnabled || currentState !== BearState.IDLE || activeState === BearState.SLEEP) {
      return;
    }

    const scheduleIdleSound = () => {
      const delay = IDLE_SOUND_MIN_INTERVAL + Math.random() * (IDLE_SOUND_MAX_INTERVAL - IDLE_SOUND_MIN_INTERVAL);
      idleSoundTimerRef.current = setTimeout(() => {
        if (currentState === BearState.IDLE && activeState !== BearState.SLEEP) {
          const randomSound = RANDOM_IDLE_SOUNDS[
            Math.floor(Math.random() * RANDOM_IDLE_SOUNDS.length)
          ];
          SoundManager.play(randomSound);
        }
        scheduleIdleSound();
      }, delay);
    };

    scheduleIdleSound();

    return () => {
      if (idleSoundTimerRef.current) {
        clearTimeout(idleSoundTimerRef.current);
      }
    };
  }, [soundEnabled, currentState, activeState]);

  // Sleep timeout
  useEffect(() => {
    if (sleepTimeout <= 0 || currentState === BearState.SLEEP) {
      return;
    }

    const checkSleep = () => {
      const elapsed = (Date.now() - lastActivityRef.current) / 1000;
      if (elapsed >= sleepTimeout && currentState === BearState.IDLE) {
        setInternalState(BearState.SLEEP);
      }
    };

    sleepTimerRef.current = setInterval(checkSleep, 1000);

    return () => {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
      }
    };
  }, [sleepTimeout, currentState]);

  // Handle animation finish
  const handleAnimationFinish = useCallback((isCancelled) => {
    if (isCancelled) return;

    // If this was an internal/transient state, return to idle
    if (internalState && TRANSIENT_STATES.includes(internalState)) {
      setInternalState(null);
    }
  }, [internalState]);

  // Handle tap
  const handlePress = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Wake up if sleeping
    if (activeState === BearState.SLEEP) {
      setInternalState(null);
      // Play surprise sound when waking up
      if (soundEnabled) {
        SoundManager.play('bear.surprise');
      }
      return;
    }

    if (onPress) {
      onPress();
    } else if (interactive) {
      // Default: play pawPop then return to idle
      setInternalState(BearState.PAW_POP);
      // Sound will be triggered by state change effect
    }
  }, [activeState, onPress, interactive, soundEnabled]);

  // Entrance animation
  useEffect(() => {
    const animation = Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    });
    animation.start();

    return () => {
      animation.stop();
    };
  }, [scaleAnim]);

  if (!animationSource) {
    return <View style={[styles.placeholder, { width: size, height: size }, style]} />;
  }

  const content = (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size, opacity, transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <LottieView
        ref={animationRef}
        source={animationSource}
        autoPlay
        loop={shouldLoop}
        speed={0.8}
        style={{ width: size, height: size }}
        onAnimationFinish={handleAnimationFinish}
      />
    </Animated.View>
  );

  if (interactive) {
    return (
      <Pressable onPress={handlePress} style={styles.pressable}>
        {content}
      </Pressable>
    );
  }

  return content;
}

/**
 * Bear positioned in a safe area corner
 */
export function BearPositioned({
  position = 'bottom-right',
  offset = { x: 16, y: 16 },
  ...props
}) {
  const insets = useSafeAreaInsets();

  const positionStyle = useMemo(() => {
    const base = { position: 'absolute', zIndex: 1000, elevation: 1000 };

    switch (position) {
      case 'bottom-left':
        return {
          ...base,
          bottom: insets.bottom + offset.y,
          left: offset.x,
        };
      case 'bottom-right':
        return {
          ...base,
          bottom: insets.bottom + offset.y,
          right: offset.x,
        };
      case 'top-left':
        return {
          ...base,
          top: insets.top + offset.y,
          left: offset.x,
        };
      case 'top-right':
        return {
          ...base,
          top: insets.top + offset.y,
          right: offset.x,
        };
      default:
        return {
          ...base,
          bottom: insets.bottom + offset.y,
          right: offset.x,
        };
    }
  }, [position, offset, insets]);

  return (
    <View style={positionStyle} pointerEvents="box-none">
      <Bear {...props} />
    </View>
  );
}

/**
 * Bear that reacts to events
 */
export function BearReactive({ events = {}, defaultState = BearState.IDLE, ...props }) {
  const [state, setState] = useState(defaultState);

  // Event handler
  const handleEvent = useCallback((eventName) => {
    const newState = events[eventName];
    if (newState) {
      setState(newState);
      // Return to default after transient states
      if (TRANSIENT_STATES.includes(newState)) {
        setTimeout(() => setState(defaultState), 2000);
      }
    }
  }, [events, defaultState]);

  return <Bear state={state} {...props} />;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    backgroundColor: 'transparent',
  },
  pressable: {
    // Allow touch events
  },
});
