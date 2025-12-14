/**
 * AnimatedDislikeButton
 *
 * A dislike button with Lottie animation support.
 * Shows an X icon by default, plays animation on press, then returns to X.
 */
import React, { useRef, useCallback, useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
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
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePress = useCallback(() => {
    // Play animation if available
    if (animationRef.current && dislikeAnimation) {
      setIsAnimating(true);
      animationRef.current.reset();
      animationRef.current.play();
    }

    // Call the onPress handler
    if (onPress) {
      onPress();
    }
  }, [onPress]);

  const handleAnimationFinish = useCallback(() => {
    setIsAnimating(false);
  }, []);

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
      {/* Static X icon - visible when not animating */}
      {!isAnimating && (
        <View style={styles.iconContainer}>
          <Ionicons name="close" size={iconSize} color={colors.text.primary} />
        </View>
      )}

      {/* Lottie animation - plays on press, hidden when complete */}
      {dislikeAnimation && (
        <LottieView
          ref={animationRef}
          source={dislikeAnimation}
          style={[styles.animation, !isAnimating && styles.hidden]}
          autoPlay={false}
          loop={false}
          speed={1.5}
          onAnimationFinish={handleAnimationFinish}
        />
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
  iconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  hidden: {
    opacity: 0,
  },
});

export default AnimatedDislikeButton;
