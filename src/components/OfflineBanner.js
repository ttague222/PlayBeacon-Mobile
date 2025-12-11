/**
 * Banner component shown when the device is offline
 * Enhanced with queue indicator and reconnection feedback
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { useNetwork } from '../context/NetworkContext';

export default function OfflineBanner() {
  const { isOffline, offlineQueueCount, checkConnection } = useNetwork();
  const [showReconnected, setShowReconnected] = useState(false);
  const wasOfflineRef = useRef(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Track when we come back online
  useEffect(() => {
    if (wasOfflineRef.current && !isOffline) {
      // Show "Back online!" message briefly
      setShowReconnected(true);
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowReconnected(false);
        fadeAnim.setValue(1);
      });
    }
    wasOfflineRef.current = isOffline;
  }, [isOffline, fadeAnim]);

  // Show reconnected message
  if (showReconnected) {
    return (
      <Animated.View style={[styles.banner, styles.successBanner, { opacity: fadeAnim }]}>
        <Ionicons name="checkmark-circle" size={18} color={colors.text.primary} />
        <Text style={styles.text}>Back online!</Text>
      </Animated.View>
    );
  }

  // Don't show anything if online
  if (!isOffline) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.banner} onPress={checkConnection} activeOpacity={0.8}>
      <Ionicons name="cloud-offline" size={18} color={colors.text.primary} />
      <Text style={styles.text}>You're offline</Text>
      {offlineQueueCount > 0 && (
        <View style={styles.queueBadge}>
          <Text style={styles.queueText}>{offlineQueueCount} pending</Text>
        </View>
      )}
      <Ionicons name="refresh" size={16} color={colors.text.primary} style={styles.refreshIcon} />
    </TouchableOpacity>
  );
}

/**
 * Compact offline indicator for headers
 */
export function OfflineIndicator() {
  const { isOffline } = useNetwork();

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.indicator}>
      <Ionicons name="cloud-offline" size={16} color={colors.warning} />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warning,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  successBanner: {
    backgroundColor: colors.success,
  },
  text: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  queueBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  queueText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  refreshIcon: {
    marginLeft: 4,
    opacity: 0.8,
  },
  indicator: {
    padding: 4,
  },
});
