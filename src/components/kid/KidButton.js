/**
 * KidButton Component
 *
 * Large, friendly button designed for children:
 * - Big tap targets (min 56dp)
 * - Rounded pill shape
 * - Bounce animation on press
 * - Icon + text support
 * - Multiple variants and sizes
 */

import React, { useCallback, useRef } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { kidTheme } from '../../styles/kidTheme';
import SoundManager from '../../services/SoundManager';
import { triggerHaptic, HapticType } from '../../hooks/useHaptics';

const {
  radii,
  spacing,
  typography,
  colors,
  shadows,
  animations,
  componentSizes,
} = kidTheme;

/**
 * Button variants with their colors
 */
const VARIANTS = {
  primary: {
    background: colors.gradients.primary,
    text: colors.text.light,
    shadow: colors.primary.blue,
  },
  secondary: {
    background: colors.gradients.secondary,
    text: colors.text.light,
    shadow: colors.secondary.orange,
  },
  success: {
    background: colors.gradients.success,
    text: colors.text.light,
    shadow: colors.feedback.success,
  },
  warning: {
    background: colors.gradients.warm,
    text: colors.text.primary,
    shadow: colors.secondary.yellow,
  },
  bear: {
    background: colors.gradients.bear,
    text: colors.text.light,
    shadow: colors.bear.bandana,
  },
  outline: {
    background: null,
    border: colors.primary.blue,
    text: colors.primary.blue,
    shadow: null,
  },
  ghost: {
    background: null,
    text: colors.primary.blue,
    shadow: null,
  },
  white: {
    background: ['#FFFFFF', '#F8F6FF'],
    text: colors.text.primary,
    shadow: '#2D2A3E',
  },
};

/**
 * Size configurations
 */
const SIZES = {
  small: {
    height: componentSizes.button.small,
    paddingHorizontal: spacing.m,
    fontSize: typography.fontSize.body,
    iconSize: componentSizes.icon.small,
    borderRadius: radii.xl,
  },
  medium: {
    height: componentSizes.button.medium,
    paddingHorizontal: spacing.l,
    fontSize: typography.fontSize.button,
    iconSize: componentSizes.icon.medium,
    borderRadius: radii.xl,
  },
  large: {
    height: componentSizes.button.large,
    paddingHorizontal: spacing.xl,
    fontSize: typography.fontSize.button,
    iconSize: componentSizes.icon.large,
    borderRadius: radii.xl,
  },
  xlarge: {
    height: componentSizes.button.xlarge,
    paddingHorizontal: spacing.xxl,
    fontSize: typography.fontSize.subtitle,
    iconSize: componentSizes.icon.large,
    borderRadius: radii.xxl,
  },
};

export default function KidButton({
  label,
  icon,
  iconPosition = 'left',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  onPress,
  style,
  textStyle,
  soundKey = 'ui.tap',
  haptic = true,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const variantConfig = VARIANTS[variant] || VARIANTS.primary;
  const sizeConfig = SIZES[size] || SIZES.medium;

  /**
   * Handle press in - animate scale down
   */
  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: animations.buttonPress.scale,
      useNativeDriver: true,
      tension: animations.spring.bouncy.tension,
      friction: animations.spring.bouncy.friction,
    }).start();
  }, [scaleAnim]);

  /**
   * Handle press out - animate scale back
   */
  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: animations.spring.bouncy.tension,
      friction: animations.spring.bouncy.friction,
    }).start();
  }, [scaleAnim]);

  /**
   * Handle press - play sound, haptic feedback, and trigger callback
   */
  const handlePress = useCallback(() => {
    if (disabled || loading) return;

    // Trigger haptic feedback
    if (haptic) {
      triggerHaptic(HapticType.LIGHT);
    }

    // Play sound
    if (soundKey) {
      SoundManager.play(soundKey);
    }

    // Call onPress
    onPress?.();
  }, [disabled, loading, soundKey, haptic, onPress]);

  /**
   * Render icon
   */
  const renderIcon = () => {
    if (!icon) return null;

    const iconElement = typeof icon === 'string' ? (
      <Ionicons
        name={icon}
        size={sizeConfig.iconSize}
        color={variantConfig.text}
      />
    ) : (
      icon
    );

    return (
      <View style={[
        styles.iconContainer,
        iconPosition === 'right' && styles.iconRight,
        label && iconPosition === 'left' && { marginRight: spacing.xs },
        label && iconPosition === 'right' && { marginLeft: spacing.xs },
      ]}>
        {iconElement}
      </View>
    );
  };

  /**
   * Render button content
   */
  const renderContent = () => (
    <View style={styles.contentContainer}>
      {iconPosition === 'left' && renderIcon()}
      {label && (
        <Text
          style={[
            styles.label,
            {
              fontSize: sizeConfig.fontSize,
              color: variantConfig.text,
            },
            disabled && styles.disabledText,
            textStyle,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
      {iconPosition === 'right' && renderIcon()}
      {loading && (
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingDot,
              { backgroundColor: variantConfig.text },
            ]}
          />
        </View>
      )}
    </View>
  );

  /**
   * Render button with gradient or solid background
   */
  const renderButton = () => {
    const buttonStyle = [
      styles.button,
      {
        height: sizeConfig.height,
        paddingHorizontal: sizeConfig.paddingHorizontal,
        borderRadius: sizeConfig.borderRadius,
      },
      fullWidth && styles.fullWidth,
      variant === 'outline' && {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: variantConfig.border,
      },
      variant === 'ghost' && {
        backgroundColor: 'transparent',
      },
      disabled && styles.disabled,
    ];

    // Gradient background
    if (variantConfig.background && variant !== 'outline' && variant !== 'ghost') {
      return (
        <LinearGradient
          colors={variantConfig.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={buttonStyle}
        >
          {renderContent()}
        </LinearGradient>
      );
    }

    // Solid/transparent background
    return (
      <View style={buttonStyle}>
        {renderContent()}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        variantConfig.shadow && !disabled && shadows.coloredSmall(variantConfig.shadow),
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
        accessibilityHint={accessibilityHint}
        {...props}
      >
        {renderButton()}
      </Pressable>
    </Animated.View>
  );
}

/**
 * Icon-only button variant
 */
export function KidIconButton({
  icon,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onPress,
  style,
  soundKey = 'ui.tap',
  haptic = true,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const variantConfig = VARIANTS[variant] || VARIANTS.primary;

  const iconSizes = {
    small: 40,
    medium: 48,
    large: 56,
    xlarge: 64,
  };

  const iconInnerSizes = {
    small: 20,
    medium: 24,
    large: 28,
    xlarge: 32,
  };

  const buttonSize = iconSizes[size] || iconSizes.medium;
  const iconSize = iconInnerSizes[size] || iconInnerSizes.medium;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 100,
      friction: 7,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 7,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    if (haptic) triggerHaptic(HapticType.LIGHT);
    if (soundKey) SoundManager.play(soundKey);
    onPress?.();
  }, [disabled, soundKey, haptic, onPress]);

  const renderButton = () => {
    const buttonStyle = [
      styles.iconButton,
      {
        width: buttonSize,
        height: buttonSize,
        borderRadius: buttonSize / 2,
      },
      disabled && styles.disabled,
    ];

    if (variantConfig.background && variant !== 'outline' && variant !== 'ghost') {
      return (
        <LinearGradient
          colors={variantConfig.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={buttonStyle}
        >
          <Ionicons name={icon} size={iconSize} color={variantConfig.text} />
        </LinearGradient>
      );
    }

    return (
      <View style={[
        buttonStyle,
        variant === 'outline' && {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: variantConfig.border,
        },
        variant === 'ghost' && { backgroundColor: 'transparent' },
      ]}>
        <Ionicons
          name={icon}
          size={iconSize}
          color={variant === 'outline' || variant === 'ghost' ? variantConfig.text : variantConfig.text}
        />
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        variantConfig.shadow && !disabled && shadows.coloredSmall(variantConfig.shadow),
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        hitSlop={8}
        accessibilityLabel={accessibilityLabel || icon}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityHint={accessibilityHint}
        {...props}
      >
        {renderButton()}
      </Pressable>
    </Animated.View>
  );
}

/**
 * Floating Action Button for kids
 */
export function KidFAB({
  icon = 'add',
  variant = 'primary',
  onPress,
  style,
  soundKey = 'ui.tap',
  ...props
}) {
  return (
    <KidIconButton
      icon={icon}
      variant={variant}
      size="xlarge"
      onPress={onPress}
      soundKey={soundKey}
      style={[styles.fab, style]}
      {...props}
    />
  );
}

/**
 * Pill badge button (for tags, categories)
 */
export function KidPillButton({
  label,
  icon,
  selected = false,
  onPress,
  style,
  haptic = true,
  accessibilityHint,
  ...props
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (haptic) triggerHaptic(HapticType.SELECTION);
    SoundManager.play('ui.tap');
    onPress?.();
  }, [haptic, onPress]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityHint={accessibilityHint}
        {...props}
      >
        <View style={[
          styles.pill,
          selected && styles.pillSelected,
        ]}>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={selected ? colors.text.light : colors.text.secondary}
              style={{ marginRight: spacing.xxs }}
            />
          )}
          <Text style={[
            styles.pillText,
            selected && styles.pillTextSelected,
          ]}>
            {label}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRight: {
    order: 1,
  },
  label: {
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  loadingContainer: {
    marginLeft: spacing.xs,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.pill,
    backgroundColor: colors.background.elevated,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pillSelected: {
    backgroundColor: colors.primary.blue,
    borderColor: colors.primary.blue,
  },
  pillText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  pillTextSelected: {
    color: colors.text.light,
  },
});
