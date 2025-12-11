/**
 * TouchableWithSound
 *
 * Wrapper components that add sound effects to touchable elements.
 * Provides consistent UI sounds across the app.
 */

import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  TouchableHighlight,
  Pressable,
} from 'react-native';
import SoundManager from '../services/SoundManager';

/**
 * TouchableOpacity with tap sound
 */
export function TouchableOpacityWithSound({
  onPress,
  onPressIn,
  soundKey = 'ui.tap',
  soundOnPressIn = false,
  disabled,
  children,
  ...props
}) {
  const handlePress = useCallback(
    (event) => {
      if (!disabled && !soundOnPressIn) {
        SoundManager.play(soundKey);
      }
      onPress?.(event);
    },
    [onPress, soundKey, disabled, soundOnPressIn]
  );

  const handlePressIn = useCallback(
    (event) => {
      if (!disabled && soundOnPressIn) {
        SoundManager.play(soundKey);
      }
      onPressIn?.(event);
    },
    [onPressIn, soundKey, disabled, soundOnPressIn]
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      disabled={disabled}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

/**
 * TouchableHighlight with tap sound
 */
export function TouchableHighlightWithSound({
  onPress,
  soundKey = 'ui.tap',
  disabled,
  children,
  ...props
}) {
  const handlePress = useCallback(
    (event) => {
      if (!disabled) {
        SoundManager.play(soundKey);
      }
      onPress?.(event);
    },
    [onPress, soundKey, disabled]
  );

  return (
    <TouchableHighlight onPress={handlePress} disabled={disabled} {...props}>
      {children}
    </TouchableHighlight>
  );
}

/**
 * Pressable with tap sound
 */
export function PressableWithSound({
  onPress,
  onPressIn,
  soundKey = 'ui.tap',
  soundOnPressIn = false,
  disabled,
  children,
  ...props
}) {
  const handlePress = useCallback(
    (event) => {
      if (!disabled && !soundOnPressIn) {
        SoundManager.play(soundKey);
      }
      onPress?.(event);
    },
    [onPress, soundKey, disabled, soundOnPressIn]
  );

  const handlePressIn = useCallback(
    (event) => {
      if (!disabled && soundOnPressIn) {
        SoundManager.play(soundKey);
      }
      onPressIn?.(event);
    },
    [onPressIn, soundKey, disabled, soundOnPressIn]
  );

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      disabled={disabled}
      {...props}
    >
      {children}
    </Pressable>
  );
}

/**
 * Button with sound - plays tap on press
 */
export function ButtonWithSound({
  onPress,
  soundKey = 'ui.tap',
  children,
  ...props
}) {
  return (
    <TouchableOpacityWithSound onPress={onPress} soundKey={soundKey} {...props}>
      {children}
    </TouchableOpacityWithSound>
  );
}

/**
 * Card with swipe sound - for swipeable cards
 */
export function CardWithSound({
  onSwipeLeft,
  onSwipeRight,
  children,
  ...props
}) {
  const handleSwipeLeft = useCallback(
    (event) => {
      SoundManager.play('ui.swipe');
      onSwipeLeft?.(event);
    },
    [onSwipeLeft]
  );

  const handleSwipeRight = useCallback(
    (event) => {
      SoundManager.play('ui.swipe');
      onSwipeRight?.(event);
    },
    [onSwipeRight]
  );

  return (
    <TouchableOpacity
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

/**
 * Tab button with sound
 */
export function TabButtonWithSound({
  onPress,
  isActive,
  children,
  ...props
}) {
  const handlePress = useCallback(
    (event) => {
      if (!isActive) {
        SoundManager.play('ui.tab_change');
      }
      onPress?.(event);
    },
    [onPress, isActive]
  );

  return (
    <TouchableOpacity onPress={handlePress} {...props}>
      {children}
    </TouchableOpacity>
  );
}

/**
 * Favorite toggle button with sound
 */
export function FavoriteButtonWithSound({
  onPress,
  isFavorite,
  children,
  ...props
}) {
  const handlePress = useCallback(
    (event) => {
      if (isFavorite) {
        SoundManager.play('ui.remove');
      } else {
        SoundManager.play('ui.favorite');
      }
      onPress?.(event);
    },
    [onPress, isFavorite]
  );

  return (
    <TouchableOpacity onPress={handlePress} {...props}>
      {children}
    </TouchableOpacity>
  );
}

/**
 * Modal trigger with sound
 */
export function ModalTriggerWithSound({
  onPress,
  children,
  ...props
}) {
  const handlePress = useCallback(
    (event) => {
      SoundManager.play('ui.modal_open');
      onPress?.(event);
    },
    [onPress]
  );

  return (
    <TouchableOpacity onPress={handlePress} {...props}>
      {children}
    </TouchableOpacity>
  );
}

/**
 * Higher-order component to add sound to any touchable
 */
export function withSound(WrappedComponent, defaultSoundKey = 'ui.tap') {
  return function WithSoundComponent({ onPress, soundKey = defaultSoundKey, ...props }) {
    const handlePress = useCallback(
      (event) => {
        SoundManager.play(soundKey);
        onPress?.(event);
      },
      [onPress, soundKey]
    );

    return <WrappedComponent onPress={handlePress} {...props} />;
  };
}

// Default export
export default TouchableOpacityWithSound;
