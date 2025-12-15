/**
 * AnimatedLikeButton
 *
 * A like button with Lottie animation support.
 * Plays a heart animation when pressed with haptic feedback.
 */
import React, { useRef, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { triggerHaptic, HapticType } from '../hooks/useHaptics';

// Try to load the heart animation, fallback to null if not found
let heartAnimation = null;
try {
  heartAnimation = require('../../assets/lottie/ui/heart_like.json');
} catch (e) {
  // Animation file not found, will use fallback icon
}

const AnimatedLikeButton = ({
  onPress,
  disabled = false,
  size = 64,
  iconSize = 28,
  accessibilityLabel = 'Like this game',
  enableHaptics = true,
}) => {
  const animationRef = useRef(null);

  const handlePress = useCallback(() => {
    // Trigger haptic feedback
    if (enableHaptics) {
      triggerHaptic(HapticType.SUCCESS);
    }

    // Play animation if available
    if (animationRef.current && heartAnimation) {
      animationRef.current.reset();
      animationRef.current.play();
    }

    // Call the onPress handler
    if (onPress) {
      onPress();
    }
  }, [onPress, enableHaptics]);

  const buttonSize = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <TouchableOpacity
      style={[styles.button, buttonSize]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityHint="Double tap to like"
    >
      {heartAnimation ? (
        <LottieView
          ref={animationRef}
          source={heartAnimation}
          style={styles.animation}
          autoPlay={false}
          loop={false}
          speed={1.5}
        />
      ) : (
        <Ionicons name="heart" size={iconSize} color={colors.text.primary} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.action.like,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default AnimatedLikeButton;
