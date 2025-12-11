/**
 * LoadingOverlay Component
 *
 * Full-screen loading overlay for blocking operations.
 * Kid-friendly with Bear mascot animation.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../styles/colors';

export default function LoadingOverlay({
  visible,
  message = 'Loading...',
  showBear = true,
  transparent = true,
}) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={transparent}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {showBear && <Text style={styles.bear}>🐻</Text>}
          <ActivityIndicator size="large" color={colors.accent.primary} />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
}

/**
 * Inline loading indicator with optional message
 */
export function InlineLoader({ message, size = 'small' }) {
  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size={size} color={colors.accent.primary} />
      {message && <Text style={styles.inlineMessage}>{message}</Text>}
    </View>
  );
}

/**
 * Button loading state indicator
 */
export function ButtonLoader({ color = colors.text.primary }) {
  return <ActivityIndicator size="small" color={color} />;
}

/**
 * Full screen centered loader
 */
export function FullScreenLoader({ message }) {
  return (
    <View style={styles.fullScreen}>
      <Text style={styles.fullScreenBear}>🐻</Text>
      <ActivityIndicator size="large" color={colors.accent.primary} />
      {message && <Text style={styles.fullScreenMessage}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  bear: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  inlineMessage: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenBear: {
    fontSize: 64,
    marginBottom: 24,
  },
  fullScreenMessage: {
    marginTop: 24,
    fontSize: 18,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
