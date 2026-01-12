/**
 * Confirmation Gate Component
 *
 * Simple confirmation dialog for account-related actions.
 * Uses a hold-to-confirm mechanism (2 seconds) to prevent accidental taps.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../styles/colors';

const HOLD_DURATION = 2000; // 2 seconds

export default function ConfirmationGate({ visible, onPass, onCancel }) {
  const { t } = useTranslation();
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef(null);
  const startTime = useRef(null);

  const handlePressIn = useCallback(() => {
    setIsHolding(true);
    startTime.current = Date.now();

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: HOLD_DURATION,
      useNativeDriver: false,
    }).start();

    // Update progress text
    holdTimer.current = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / HOLD_DURATION, 1);
      setHoldProgress(progress);

      if (progress >= 1) {
        clearInterval(holdTimer.current);
        setIsHolding(false);
        setHoldProgress(0);
        progressAnim.setValue(0);
        onPass();
      }
    }, 50);
  }, [onPass, progressAnim]);

  const handlePressOut = useCallback(() => {
    // User released before completion
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
    }
    progressAnim.stopAnimation();
    progressAnim.setValue(0);
    setIsHolding(false);
    setHoldProgress(0);
  }, [progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const remainingSeconds = Math.ceil((1 - holdProgress) * 2);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{t('components.confirmationTitle')}</Text>
          <Text style={styles.description}>
            {t('components.confirmationDescription')}
          </Text>

          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={({ pressed }) => [
              styles.holdButton,
              isHolding && styles.holdButtonActive,
            ]}
          >
            <Animated.View
              style={[
                styles.progressBar,
                { width: progressWidth },
              ]}
            />
            <Text style={styles.holdButtonText}>
              {isHolding
                ? t('components.confirmationHolding', { seconds: remainingSeconds })
                : t('components.confirmationHold')}
            </Text>
          </Pressable>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  holdButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  holdButtonActive: {
    backgroundColor: colors.accent.secondary,
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.success,
    opacity: 0.3,
  },
  holdButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    zIndex: 1,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text.tertiary,
  },
});
