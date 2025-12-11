/**
 * KidModal Component
 *
 * Kid-friendly modal with:
 * - Rounded top corners (40-50px)
 * - Large content spacing
 * - Clear close button
 * - Smooth animations
 * - Safe area handling
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { kidTheme } from '../../styles/kidTheme';
import SoundManager from '../../services/SoundManager';

const {
  radii,
  spacing,
  typography,
  colors,
  shadows,
  animations,
} = kidTheme;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Main Modal Component
 */
export default function KidModal({
  visible = false,
  onClose,
  title,
  emoji,
  icon,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  fullHeight = false,
  scrollable = true,
  footer,
  style,
  contentStyle,
}) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  /**
   * Animate in/out
   */
  useEffect(() => {
    if (visible) {
      // Play sound on open
      SoundManager.play('ui.modal_open');

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animations.duration.normal,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: animations.spring.gentle.tension,
          friction: animations.spring.gentle.friction,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: animations.duration.fast,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: animations.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  /**
   * Handle close
   */
  const handleClose = useCallback(() => {
    SoundManager.play('ui.modal_close');
    onClose?.();
  }, [onClose]);

  /**
   * Handle backdrop press
   */
  const handleBackdropPress = useCallback(() => {
    if (closeOnBackdrop) {
      handleClose();
    }
  }, [closeOnBackdrop, handleClose]);

  /**
   * Render header
   */
  const renderHeader = () => {
    if (!title && !showCloseButton) return null;

    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {emoji && <Text style={styles.headerEmoji}>{emoji}</Text>}
          {icon && !emoji && (
            <Ionicons
              name={icon}
              size={28}
              color={colors.primary.purple}
              style={styles.headerIcon}
            />
          )}
          {title && <Text style={styles.headerTitle}>{title}</Text>}
        </View>
        {showCloseButton && (
          <Pressable
            onPress={handleClose}
            hitSlop={12}
            style={styles.closeButton}
          >
            <View style={styles.closeCircle}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </View>
          </Pressable>
        )}
      </View>
    );
  };

  /**
   * Render content
   */
  const renderContent = () => {
    const content = (
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    );

    if (scrollable) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {content}
        </ScrollView>
      );
    }

    return content;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable
            style={styles.backdropPressable}
            onPress={handleBackdropPress}
          />
        </Animated.View>

        {/* Modal container */}
        <Animated.View
          style={[
            styles.container,
            fullHeight && { maxHeight: SCREEN_HEIGHT - insets.top - spacing.xl },
            { transform: [{ translateY: slideAnim }] },
            shadows.xlarge,
            style,
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {renderHeader()}
          {renderContent()}

          {/* Footer */}
          {footer && (
            <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.m }]}>
              {footer}
            </View>
          )}

          {/* Bottom safe area padding if no footer */}
          {!footer && <View style={{ height: insets.bottom + spacing.m }} />}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/**
 * Alert-style modal for confirmations
 */
export function KidAlertModal({
  visible = false,
  onClose,
  title,
  emoji,
  message,
  confirmLabel = 'Okay',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
  showCancel = true,
  destructive = false,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      SoundManager.play('ui.modal_open');
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animations.duration.fast,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: animations.duration.fast,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: animations.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const handleConfirm = useCallback(() => {
    SoundManager.play('ui.tap');
    onConfirm?.();
    onClose?.();
  }, [onConfirm, onClose]);

  const handleCancel = useCallback(() => {
    SoundManager.play('ui.modal_close');
    onCancel?.();
    onClose?.();
  }, [onCancel, onClose]);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.alertContainer}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={styles.backdropPressable} onPress={handleCancel} />
        </Animated.View>

        {/* Alert box */}
        <Animated.View
          style={[
            styles.alertBox,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
            shadows.xlarge,
          ]}
        >
          {emoji && <Text style={styles.alertEmoji}>{emoji}</Text>}
          {title && <Text style={styles.alertTitle}>{title}</Text>}
          {message && <Text style={styles.alertMessage}>{message}</Text>}

          <View style={styles.alertButtons}>
            {showCancel && (
              <Pressable
                onPress={handleCancel}
                style={[styles.alertButton, styles.alertButtonCancel]}
              >
                <Text style={styles.alertButtonCancelText}>{cancelLabel}</Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleConfirm}
              style={[
                styles.alertButton,
                styles.alertButtonConfirm,
                destructive && styles.alertButtonDestructive,
              ]}
            >
              <Text style={styles.alertButtonConfirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * Bottom sheet style modal
 */
export function KidBottomSheet({
  visible = false,
  onClose,
  title,
  emoji,
  children,
  snapPoints = ['50%'],
  style,
}) {
  return (
    <KidModal
      visible={visible}
      onClose={onClose}
      title={title}
      emoji={emoji}
      style={[{ maxHeight: snapPoints[0] }, style]}
    >
      {children}
    </KidModal>
  );
}

/**
 * Action sheet with options
 */
export function KidActionSheet({
  visible = false,
  onClose,
  title,
  options = [],
  cancelLabel = 'Cancel',
}) {
  const handleOption = useCallback((option) => {
    SoundManager.play('ui.tap');
    option.onPress?.();
    onClose?.();
  }, [onClose]);

  const handleCancel = useCallback(() => {
    SoundManager.play('ui.modal_close');
    onClose?.();
  }, [onClose]);

  return (
    <KidModal
      visible={visible}
      onClose={onClose}
      title={title}
      showCloseButton={false}
      scrollable={false}
    >
      <View style={styles.actionSheetOptions}>
        {options.map((option, index) => (
          <Pressable
            key={index}
            onPress={() => handleOption(option)}
            style={[
              styles.actionSheetOption,
              option.destructive && styles.actionSheetOptionDestructive,
            ]}
          >
            {option.icon && (
              <Ionicons
                name={option.icon}
                size={24}
                color={option.destructive ? colors.feedback.error : colors.text.primary}
                style={styles.actionSheetIcon}
              />
            )}
            <Text
              style={[
                styles.actionSheetLabel,
                option.destructive && styles.actionSheetLabelDestructive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={handleCancel} style={styles.actionSheetCancel}>
        <Text style={styles.actionSheetCancelText}>{cancelLabel}</Text>
      </Pressable>
    </KidModal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropPressable: {
    flex: 1,
  },
  container: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: radii.xxl + 10, // 50px
    borderTopRightRadius: radii.xxl + 10,
    maxHeight: SCREEN_HEIGHT * 0.9,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.s,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: colors.text.tertiary,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.elevated,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerEmoji: {
    fontSize: 28,
    marginRight: spacing.s,
  },
  headerIcon: {
    marginRight: spacing.s,
  },
  headerTitle: {
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
  },
  closeButton: {
    marginLeft: spacing.m,
  },
  closeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.background.elevated,
  },

  // Alert modal
  alertContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  alertBox: {
    backgroundColor: colors.background.card,
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  alertEmoji: {
    fontSize: 48,
    marginBottom: spacing.m,
  },
  alertTitle: {
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  alertMessage: {
    fontSize: typography.fontSize.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.fontSize.body * typography.lineHeight.relaxed,
  },
  alertButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.m,
  },
  alertButton: {
    flex: 1,
    height: 52,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonCancel: {
    backgroundColor: colors.background.elevated,
  },
  alertButtonCancelText: {
    fontSize: typography.fontSize.button,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  alertButtonConfirm: {
    backgroundColor: colors.primary.blue,
  },
  alertButtonDestructive: {
    backgroundColor: colors.feedback.error,
  },
  alertButtonConfirmText: {
    fontSize: typography.fontSize.button,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.light,
  },

  // Action sheet
  actionSheetOptions: {
    marginBottom: spacing.m,
  },
  actionSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderRadius: radii.l,
    marginBottom: spacing.xs,
  },
  actionSheetOptionDestructive: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  actionSheetIcon: {
    marginRight: spacing.m,
  },
  actionSheetLabel: {
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  actionSheetLabelDestructive: {
    color: colors.feedback.error,
  },
  actionSheetCancel: {
    paddingVertical: spacing.m,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.background.elevated,
    marginTop: spacing.s,
  },
  actionSheetCancelText: {
    fontSize: typography.fontSize.button,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
});
