/**
 * AnimatedDislikeButton
 *
 * A dislike button with Lottie animation support.
 * Plays a thumbs down animation when pressed.
 */
import React, { useRef, useCallback } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

// Try to load the dislike animation, fallback to null if not found
let dislikeAnimation = null;
try {
  dislikeAnimation = require('../../assets/lottie/ui/dislike.json');
} catch (e) {
  // Animation file not found, will use fallback icon
}

const AnimatedDislikeButton = ({
  onPress,
  disabled = false,
  size = 64,
  iconSize = 32,
}) => {
  const animationRef = useRef(null);

  const handlePress = useCallback(() => {
    // Play animation if available
    if (animationRef.current && dislikeAnimation) {
      animationRef.current.reset();
      animationRef.current.play();
    }

    // Call the onPress handler
    if (onPress) {
      onPress();
    }
  }, [onPress]);

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
    >
      {dislikeAnimation ? (
        <LottieView
          ref={animationRef}
          source={dislikeAnimation}
          style={styles.animation}
          autoPlay={false}
          loop={false}
          speed={1.5}
        />
      ) : (
        <Ionicons name="close" size={iconSize} color={colors.text.primary} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.action.dislike,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
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

export default AnimatedDislikeButton;
