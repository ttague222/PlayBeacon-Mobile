/**
 * Animation Context Provider
 *
 * Global animation management system for PlayBeacon.
 * Handles triggering animations from anywhere in the app,
 * manages the celebration overlay layer, and provides
 * the useLottieTrigger hook for easy integration.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { getAnimationForEvent, ANIMATION_CONFIG, isAnimationLoaded } from '../config/animations';
import logger from '../utils/logger';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimationContext = createContext(null);

export function AnimationProvider({ children }) {
  // Queue for celebration animations
  const [celebrationQueue, setCelebrationQueue] = useState([]);
  const [currentCelebration, setCurrentCelebration] = useState(null);
  const isPlayingCelebration = useRef(false);

  // Micro-interaction state (can show multiple)
  const [microAnimations, setMicroAnimations] = useState([]);
  const microIdCounter = useRef(0);

  // Fade animation for celebration overlay
  const celebrationOpacity = useRef(new Animated.Value(0)).current;

  /**
   * Process the next celebration in the queue
   */
  const processNextCelebration = useCallback(() => {
    if (celebrationQueue.length === 0) {
      isPlayingCelebration.current = false;
      setCurrentCelebration(null);
      return;
    }

    isPlayingCelebration.current = true;
    const next = celebrationQueue[0];
    setCelebrationQueue((prev) => prev.slice(1));
    setCurrentCelebration(next);

    // Fade in
    Animated.timing(celebrationOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [celebrationQueue, celebrationOpacity]);

  /**
   * Handle celebration animation finish
   */
  const handleCelebrationFinish = useCallback(() => {
    // Fade out
    Animated.timing(celebrationOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Process next in queue after fade out
      setTimeout(() => {
        processNextCelebration();
      }, 200);
    });
  }, [celebrationOpacity, processNextCelebration]);

  /**
   * Trigger an animation by event name
   *
   * @param {string} eventName - Event from EVENT_ANIMATIONS
   * @param {Object} options - Optional position/style overrides
   */
  const triggerAnimation = useCallback(
    (eventName, options = {}) => {
      const animConfig = getAnimationForEvent(eventName);

      if (!animConfig || !isAnimationLoaded(animConfig.source)) {
        logger.log(`Animation not loaded for event: ${eventName}`);
        return;
      }

      const { source, type } = animConfig;
      const typeConfig = ANIMATION_CONFIG[type];

      if (type === 'celebration') {
        // Add to celebration queue
        setCelebrationQueue((prev) => [
          ...prev,
          { source, options, eventName },
        ]);

        // Start processing if not already
        if (!isPlayingCelebration.current) {
          setTimeout(() => processNextCelebration(), 50);
        }
      } else if (type === 'micro') {
        // Add micro animation with unique ID
        const id = ++microIdCounter.current;
        const position = options.position || { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 };

        setMicroAnimations((prev) => [
          ...prev,
          { id, source, position, options },
        ]);

        // Auto-remove after animation duration
        setTimeout(() => {
          setMicroAnimations((prev) => prev.filter((a) => a.id !== id));
        }, typeConfig.duration + 100);
      }
    },
    [processNextCelebration]
  );

  /**
   * Trigger a celebration animation directly
   */
  const triggerCelebration = useCallback(
    (source, options = {}) => {
      if (!isAnimationLoaded(source)) {
        logger.log('Celebration source not loaded');
        return;
      }

      setCelebrationQueue((prev) => [...prev, { source, options }]);

      if (!isPlayingCelebration.current) {
        setTimeout(() => processNextCelebration(), 50);
      }
    },
    [processNextCelebration]
  );

  /**
   * Trigger a micro-interaction at a specific position
   */
  const triggerMicro = useCallback((source, position, options = {}) => {
    if (!isAnimationLoaded(source)) {
      return;
    }

    const id = ++microIdCounter.current;
    const config = ANIMATION_CONFIG.micro;

    setMicroAnimations((prev) => [
      ...prev,
      { id, source, position, options },
    ]);

    setTimeout(() => {
      setMicroAnimations((prev) => prev.filter((a) => a.id !== id));
    }, config.duration + 100);
  }, []);

  const value = {
    triggerAnimation,
    triggerCelebration,
    triggerMicro,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}

      {/* Celebration Overlay Layer - renders above everything */}
      <LottieCelebrationLayer
        currentCelebration={currentCelebration}
        opacity={celebrationOpacity}
        onFinish={handleCelebrationFinish}
      />

      {/* Micro-animation Layer */}
      <MicroAnimationLayer animations={microAnimations} />
    </AnimationContext.Provider>
  );
}

/**
 * Celebration Overlay Component
 * Full-screen overlay for celebration animations (confetti, badges, etc.)
 */
function LottieCelebrationLayer({ currentCelebration, opacity, onFinish }) {
  if (!currentCelebration) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.celebrationOverlay, { opacity }]}
      pointerEvents="none"
    >
      <LottieView
        source={currentCelebration.source}
        autoPlay
        loop={false}
        speed={1}
        style={styles.celebrationAnimation}
        onAnimationFinish={onFinish}
      />
    </Animated.View>
  );
}

/**
 * Micro Animation Layer
 * Renders small animations at specific positions
 */
function MicroAnimationLayer({ animations }) {
  if (animations.length === 0) {
    return null;
  }

  return (
    <View style={styles.microLayer} pointerEvents="none">
      {animations.map((anim) => (
        <View
          key={anim.id}
          style={[
            styles.microAnimation,
            {
              left: anim.position.x - 50,
              top: anim.position.y - 50,
            },
          ]}
        >
          <LottieView
            source={anim.source}
            autoPlay
            loop={false}
            speed={1.2}
            style={styles.microLottie}
          />
        </View>
      ))}
    </View>
  );
}

/**
 * Hook to trigger animations from any component
 */
export function useAnimations() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimations must be used within an AnimationProvider');
  }
  return context;
}

/**
 * Hook to trigger a specific animation event
 *
 * Usage:
 *   const triggerHeartPop = useLottieTrigger('ADD_TO_WISHLIST');
 *   <TouchableOpacity onPress={() => triggerHeartPop({ position: { x, y } })}>
 */
export function useLottieTrigger(eventName) {
  const { triggerAnimation } = useAnimations();

  return useCallback(
    (options = {}) => {
      triggerAnimation(eventName, options);
    },
    [triggerAnimation, eventName]
  );
}

const styles = StyleSheet.create({
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  celebrationAnimation: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  microLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
    elevation: 9998,
  },
  microAnimation: {
    position: 'absolute',
    width: 100,
    height: 100,
  },
  microLottie: {
    width: 100,
    height: 100,
  },
});

export default AnimationContext;
