/**
 * Bear Mascot Component
 *
 * Bear the Bernese Mountain Dog - PlayBeacon's friendly mascot!
 * Provides various emotional states and helpful animations
 * to guide and engage kids throughout the app.
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import LottieView from 'lottie-react-native';
import { ANIMATIONS } from '../config/animations';

/**
 * Bear emotional/action states
 */
export const BEAR_STATES = {
  // Idle states (looping)
  IDLE: 'idle',
  BLINK: 'blink',
  SLEEP: 'sleep',

  // Helpful animations
  WAVE: 'wave',
  POINT_LEFT: 'point_left',
  POINT_RIGHT: 'point_right',

  // Emotional animations
  CELEBRATE: 'celebrate',
  SAD: 'sad',
  THINK: 'think',
  SURPRISE: 'surprise',
  JUMP: 'jump',

  // Reaction animations
  YES: 'yes',
  NO: 'no',
  TAIL_WAG: 'tail_wag',
  EAR_WIGGLE: 'ear_wiggle',

  // Micro-interactions
  TAP_BOUNCE: 'tap_bounce',
  PAW_POP: 'paw_pop',
};

/**
 * Maps states to animation sources
 */
const STATE_TO_ANIMATION = {
  [BEAR_STATES.IDLE]: ANIMATIONS.mascot.idle,
  [BEAR_STATES.BLINK]: ANIMATIONS.mascot.blink,
  [BEAR_STATES.SLEEP]: ANIMATIONS.mascot.sleep,
  [BEAR_STATES.WAVE]: ANIMATIONS.mascot.wave,
  [BEAR_STATES.CELEBRATE]: ANIMATIONS.mascot.celebrate,
  [BEAR_STATES.SAD]: ANIMATIONS.mascot.sad,
  [BEAR_STATES.THINK]: ANIMATIONS.mascot.think,
  [BEAR_STATES.SURPRISE]: ANIMATIONS.mascot.surprise,
  [BEAR_STATES.JUMP]: ANIMATIONS.mascot.jump,
  [BEAR_STATES.YES]: ANIMATIONS.mascot.yes,
  [BEAR_STATES.NO]: ANIMATIONS.mascot.no,
  [BEAR_STATES.TAIL_WAG]: ANIMATIONS.mascot.tail_wag,
  [BEAR_STATES.EAR_WIGGLE]: ANIMATIONS.mascot.ear_wiggle,
  [BEAR_STATES.POINT_LEFT]: ANIMATIONS.mascot.point_left,
  [BEAR_STATES.POINT_RIGHT]: ANIMATIONS.mascot.point_right,
  [BEAR_STATES.TAP_BOUNCE]: ANIMATIONS.mascot.tap_bounce,
  [BEAR_STATES.PAW_POP]: ANIMATIONS.mascot.paw_pop,
};

/**
 * @param {Object} props
 * @param {string} props.state - Current Bear state (from BEAR_STATES)
 * @param {number} props.size - Size of Bear (default: 150)
 * @param {Object} props.style - Additional styles
 * @param {boolean} props.interactive - Whether Bear responds to taps (default: true)
 * @param {Function} props.onTap - Callback when Bear is tapped
 * @param {boolean} props.autoIdle - Auto-switch to idle after non-idle animations (default: true)
 */
export default function BearMascot({
  state = BEAR_STATES.IDLE,
  size = 150,
  style,
  interactive = true,
  onTap,
  autoIdle = true,
}) {
  const animationRef = useRef(null);
  const [currentState, setCurrentState] = useState(state);
  const [animationSource, setAnimationSource] = useState(null);

  // Update animation when state changes
  useEffect(() => {
    const source = STATE_TO_ANIMATION[state];
    if (source) {
      setAnimationSource(source);
      setCurrentState(state);
    }
  }, [state]);

  // Handle animation finish - return to idle for non-looping states
  const handleAnimationFinish = useCallback(() => {
    if (autoIdle && currentState !== BEAR_STATES.IDLE) {
      // Non-idle states that should return to idle after playing
      const transientStates = [
        BEAR_STATES.WAVE,
        BEAR_STATES.CELEBRATE,
        BEAR_STATES.SURPRISE,
        BEAR_STATES.JUMP,
        BEAR_STATES.YES,
        BEAR_STATES.NO,
        BEAR_STATES.POINT_LEFT,
        BEAR_STATES.POINT_RIGHT,
        BEAR_STATES.TAP_BOUNCE,
        BEAR_STATES.PAW_POP,
      ];

      if (transientStates.includes(currentState)) {
        setAnimationSource(STATE_TO_ANIMATION[BEAR_STATES.IDLE]);
        setCurrentState(BEAR_STATES.IDLE);
      }
    }
  }, [currentState, autoIdle]);

  // Handle tap on Bear
  const handleTap = useCallback(() => {
    if (onTap) {
      onTap();
    } else if (interactive) {
      // Default tap behavior: show tap bounce
      setAnimationSource(STATE_TO_ANIMATION[BEAR_STATES.TAP_BOUNCE]);
      setCurrentState(BEAR_STATES.TAP_BOUNCE);
    }
  }, [onTap, interactive]);

  // Determine if animation should loop
  const shouldLoop = [
    BEAR_STATES.IDLE,
    BEAR_STATES.BLINK,
    BEAR_STATES.SLEEP,
    BEAR_STATES.THINK,
    BEAR_STATES.SAD,
    BEAR_STATES.TAIL_WAG,
    BEAR_STATES.EAR_WIGGLE,
  ].includes(currentState);

  // If no animation source, render placeholder
  if (!animationSource) {
    return (
      <View
        style={[
          styles.placeholder,
          { width: size, height: size },
          style,
        ]}
      />
    );
  }

  const content = (
    <LottieView
      ref={animationRef}
      source={animationSource}
      autoPlay
      loop={shouldLoop}
      speed={0.8}
      style={{ width: size, height: size }}
      onAnimationFinish={handleAnimationFinish}
    />
  );

  if (interactive) {
    return (
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={[styles.container, style]}>{content}</View>
      </TouchableWithoutFeedback>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
}

/**
 * Pre-configured Bear variants for common use cases
 */

// Small Bear for inline use
export function BearSmall({ state, style, ...props }) {
  return (
    <BearMascot
      state={state}
      size={80}
      style={style}
      interactive={false}
      {...props}
    />
  );
}

// Medium Bear for cards/modals
export function BearMedium({ state, style, ...props }) {
  return (
    <BearMascot
      state={state}
      size={150}
      style={style}
      {...props}
    />
  );
}

// Large Bear for empty states/onboarding
export function BearLarge({ state, style, ...props }) {
  return (
    <BearMascot
      state={state}
      size={250}
      style={style}
      {...props}
    />
  );
}

// Thinking Bear for loading states
export function BearThinking({ size = 150, style, ...props }) {
  return (
    <BearMascot
      state={BEAR_STATES.THINK}
      size={size}
      style={style}
      interactive={false}
      autoIdle={false}
      {...props}
    />
  );
}

// Sad Bear for error/empty states
export function BearSad({ size = 150, style, ...props }) {
  return (
    <BearMascot
      state={BEAR_STATES.SAD}
      size={size}
      style={style}
      interactive={false}
      autoIdle={false}
      {...props}
    />
  );
}

// Celebrating Bear for achievements
export function BearCelebrating({ size = 200, style, onFinish, ...props }) {
  return (
    <BearMascot
      state={BEAR_STATES.CELEBRATE}
      size={size}
      style={style}
      interactive={false}
      autoIdle={false}
      {...props}
    />
  );
}

// Waving Bear for welcome screens
export function BearWaving({ size = 200, style, ...props }) {
  return (
    <BearMascot
      state={BEAR_STATES.WAVE}
      size={size}
      style={style}
      interactive={false}
      {...props}
    />
  );
}

// Jumping Bear for excitement
export function BearJumping({ size = 200, style, ...props }) {
  return (
    <BearMascot
      state={BEAR_STATES.JUMP}
      size={size}
      style={style}
      interactive={false}
      {...props}
    />
  );
}

// Sleeping Bear for inactive states
export function BearSleeping({ size = 150, style, ...props }) {
  return (
    <BearMascot
      state={BEAR_STATES.SLEEP}
      size={size}
      style={style}
      interactive={false}
      autoIdle={false}
      {...props}
    />
  );
}

// Yes/nodding Bear for confirmations
export function BearYes({ size = 150, style, ...props }) {
  return (
    <BearMascot
      state={BEAR_STATES.YES}
      size={size}
      style={style}
      interactive={false}
      {...props}
    />
  );
}

// No/shaking Bear for errors/denials
export function BearNo({ size = 150, style, ...props }) {
  return (
    <BearMascot
      state={BEAR_STATES.NO}
      size={size}
      style={style}
      interactive={false}
      {...props}
    />
  );
}

// Surprised Bear for reactions
export function BearSurprised({ size = 150, style, ...props }) {
  return (
    <BearMascot
      state={BEAR_STATES.SURPRISE}
      size={size}
      style={style}
      interactive={false}
      {...props}
    />
  );
}

// Happy tail wagging Bear
export function BearHappy({ size = 150, style, ...props }) {
  return (
    <BearMascot
      state={BEAR_STATES.TAIL_WAG}
      size={size}
      style={style}
      interactive={false}
      autoIdle={false}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    backgroundColor: 'transparent',
  },
});
