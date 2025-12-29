/**
 * BadgeTile Component
 *
 * Displays a single badge in a grid layout.
 * Shows locked/unlocked states with kid-friendly styling.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BadgeDefinition } from '../../types/badges';
import { useCollection } from '../../context/CollectionContext';
import { colors } from '../../styles/colors';
import SoundManager from '../../services/SoundManager';

export const HORIZONTAL_PADDING = 20;
export const TILE_GAP = 12;

// Calculate responsive columns based on screen width
export const getNumColumns = (width: number) => {
  if (width >= 1024) return 4; // Large tablets
  if (width >= 768) return 3;  // iPad
  return 2; // Phone
};

export const getTileSize = (width: number) => {
  const numColumns = getNumColumns(width);
  return Math.floor((width - (HORIZONTAL_PADDING * 2) - (TILE_GAP * (numColumns - 1))) / numColumns);
};

interface BadgeTileProps {
  badge: BadgeDefinition;
  onPress?: (badge: BadgeDefinition) => void;
}

export default function BadgeTile({ badge, onPress }: BadgeTileProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { getBadgeProgress, isBadgeUnlocked } = useCollection();
  const progress = getBadgeProgress(badge.id);
  const isUnlocked = isBadgeUnlocked(badge.id);
  const isNew = isUnlocked && progress && !progress.seen;

  const tileSize = getTileSize(screenWidth);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    SoundManager.play('ui.tap');
    onPress?.(badge);
  }, [badge, onPress]);

  // Calculate progress percentage
  const progressPercent = progress
    ? Math.min(100, (progress.progress / badge.requirementValue) * 100)
    : 0;

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ width: tileSize, marginBottom: TILE_GAP }}
    >
      <Animated.View
        style={[
          styles.container,
          { transform: [{ scale: scaleAnim }] },
          isUnlocked ? styles.unlocked : styles.locked,
          isNew && styles.newBadge,
        ]}
      >
        {/* Badge emoji */}
        <View style={[styles.emojiContainer, !isUnlocked && styles.lockedEmoji]}>
          <Text style={styles.emoji}>{badge.icon}</Text>
        </View>

        {/* Badge name */}
        <Text
          style={[styles.name, !isUnlocked && styles.lockedName]}
          numberOfLines={1}
        >
          {badge.name}
        </Text>

        {/* Progress bar for locked badges */}
        {!isUnlocked && progressPercent > 0 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        )}

        {/* Lock icon for locked badges */}
        {!isUnlocked && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={12} color={colors.text.tertiary} />
          </View>
        )}

        {/* New badge indicator */}
        {isNew && (
          <View style={styles.newIndicator}>
            <Text style={styles.newText}>NEW</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlocked: {
    backgroundColor: colors.background.secondary,
  },
  locked: {
    backgroundColor: colors.background.tertiary,
    opacity: 0.8,
  },
  newBadge: {
    borderWidth: 2,
    borderColor: colors.accent.primary,
  },
  emojiContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  lockedEmoji: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 44,
    textAlign: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  lockedName: {
    color: colors.text.tertiary,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.background.primary,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: 2,
  },
  lockBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.background.primary + 'DD',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
