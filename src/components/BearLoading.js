/**
 * BearLoading Component
 *
 * A fun loading indicator featuring Bear the mascot.
 * Shows Bear thinking/searching while content loads.
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import BearMascot, { BEAR_STATES } from './BearMascot';
import { colors } from '../styles/colors';

/**
 * @param {Object} props
 * @param {string} props.message - Loading message (optional)
 * @param {number} props.size - Bear size (default: 150)
 * @param {boolean} props.showSpinner - Show activity indicator (default: false)
 * @param {Object} props.style - Additional styles
 */
export default function BearLoading({
  message = "Loading...",
  size = 150,
  showSpinner = false,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <BearMascot
        state={BEAR_STATES.THINK}
        size={size}
        interactive={false}
        autoIdle={false}
      />

      {message && (
        <Text style={styles.message}>{message}</Text>
      )}

      {showSpinner && (
        <ActivityIndicator
          size="small"
          color={colors.accent.primary}
          style={styles.spinner}
        />
      )}
    </View>
  );
}

/**
 * Full screen loading overlay with Bear
 */
export function BearLoadingOverlay({ visible, message }) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <BearLoading message={message} size={180} />
    </View>
  );
}

/**
 * Inline loading indicator with small Bear
 */
export function BearLoadingInline({ message }) {
  return (
    <View style={styles.inline}>
      <BearMascot
        state={BEAR_STATES.THINK}
        size={60}
        interactive={false}
        autoIdle={false}
      />
      {message && (
        <Text style={styles.inlineMessage}>{message}</Text>
      )}
    </View>
  );
}

/**
 * Loading placeholder with sleeping Bear (for lazy-loaded content)
 */
export function BearLoadingPlaceholder({ height = 200 }) {
  return (
    <View style={[styles.placeholder, { height }]}>
      <BearMascot
        state={BEAR_STATES.SLEEP}
        size={80}
        interactive={false}
        autoIdle={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 12,
    textAlign: 'center',
  },
  spinner: {
    marginTop: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  inlineMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
  },
});
