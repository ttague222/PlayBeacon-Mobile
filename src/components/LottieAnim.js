/**
 * LottieAnim Component
 *
 * Reusable Lottie animation wrapper with performance optimizations.
 * Supports auto-play, looping, and lazy loading for large animations.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

/**
 * @param {Object} props
 * @param {Object|number} props.source - Lottie JSON source (require or URI)
 * @param {Object} props.style - Container style
 * @param {boolean} props.autoPlay - Start playing automatically (default: true)
 * @param {boolean} props.loop - Loop animation (default: false)
 * @param {number} props.speed - Playback speed (default: 1)
 * @param {Function} props.onAnimationFinish - Callback when animation completes
 * @param {Function} props.onAnimationStart - Callback when animation starts
 * @param {boolean} props.lazyLoad - Delay loading until visible (default: false)
 * @param {string} props.colorFilters - Array of color filter objects
 */
export default function LottieAnim({
  source,
  style,
  autoPlay = true,
  loop = false,
  speed = 1,
  onAnimationFinish,
  onAnimationStart,
  lazyLoad = false,
  colorFilters,
  ...props
}) {
  const animationRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(!lazyLoad);
  const [isPlaying, setIsPlaying] = useState(false);

  // Lazy load support
  useEffect(() => {
    if (lazyLoad) {
      // Small delay to allow component to mount before loading
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [lazyLoad]);

  // Handle animation finish
  const handleAnimationFinish = useCallback((isCancelled) => {
    setIsPlaying(false);
    if (!isCancelled && onAnimationFinish) {
      onAnimationFinish();
    }
  }, [onAnimationFinish]);

  // Play animation imperatively
  const play = useCallback((startFrame, endFrame) => {
    if (animationRef.current) {
      setIsPlaying(true);
      if (onAnimationStart) {
        onAnimationStart();
      }
      animationRef.current.play(startFrame, endFrame);
    }
  }, [onAnimationStart]);

  // Reset animation to beginning
  const reset = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.reset();
      setIsPlaying(false);
    }
  }, []);

  // Pause animation
  const pause = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Resume animation
  const resume = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.resume();
      setIsPlaying(true);
    }
  }, []);

  // Expose methods via ref
  useEffect(() => {
    if (props.animationRef) {
      props.animationRef.current = {
        play,
        reset,
        pause,
        resume,
        isPlaying,
      };
    }
  }, [play, reset, pause, resume, isPlaying, props.animationRef]);

  if (!isLoaded || !source) {
    return <View style={[styles.placeholder, style]} />;
  }

  return (
    <LottieView
      ref={animationRef}
      source={source}
      style={[styles.animation, style]}
      autoPlay={autoPlay}
      loop={loop}
      speed={speed}
      onAnimationFinish={handleAnimationFinish}
      colorFilters={colorFilters}
      {...props}
    />
  );
}

/**
 * Pre-configured animation variants for common use cases
 */

// Micro-interaction animation (fast, no loop)
export function MicroAnim({ source, style, onFinish, ...props }) {
  return (
    <LottieAnim
      source={source}
      style={style}
      autoPlay
      loop={false}
      speed={1.2}
      onAnimationFinish={onFinish}
      {...props}
    />
  );
}

// Loading animation (loop forever)
export function LoadingAnim({ source, style, ...props }) {
  return (
    <LottieAnim
      source={source}
      style={[styles.loading, style]}
      autoPlay
      loop
      speed={1}
      {...props}
    />
  );
}

// Celebration animation (larger, centered, lazy loaded)
export function CelebrationAnim({ source, style, onFinish, ...props }) {
  return (
    <LottieAnim
      source={source}
      style={[styles.celebration, style]}
      autoPlay
      loop={false}
      speed={1}
      lazyLoad
      onAnimationFinish={onFinish}
      {...props}
    />
  );
}

// Mascot animation (can loop for idle states)
export function MascotAnim({ source, style, loop = true, ...props }) {
  return (
    <LottieAnim
      source={source}
      style={[styles.mascot, style]}
      autoPlay
      loop={loop}
      speed={0.8}
      {...props}
    />
  );
}

// Empty state animation (gentle loop)
export function EmptyStateAnim({ source, style, ...props }) {
  return (
    <LottieAnim
      source={source}
      style={[styles.emptyState, style]}
      autoPlay
      loop
      speed={0.6}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  animation: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: 'transparent',
  },
  loading: {
    width: 100,
    height: 100,
  },
  celebration: {
    width: 300,
    height: 300,
  },
  mascot: {
    width: 150,
    height: 150,
  },
  emptyState: {
    width: 200,
    height: 200,
  },
});
