/**
 * KidGameCard Component
 *
 * Large, friendly game card designed for children:
 * - Big thumbnails with rounded corners
 * - Large tap targets
 * - Clear favorite button
 * - Lift animation on press
 * - Simple, scannable info
 */

import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

/**
 * Main Game Card Component
 */
export default function KidGameCard({
  game,
  onPress,
  onFavorite,
  isFavorite = false,
  size = 'medium',
  style,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const favoriteScale = useRef(new Animated.Value(1)).current;

  // Size configurations
  const sizeConfigs = {
    small: { width: 160, height: 200, imageHeight: 120 },
    medium: { width: 200, height: 240, imageHeight: 140 },
    large: { width: 280, height: 320, imageHeight: 200 },
  };
  const config = sizeConfigs[size] || sizeConfigs.medium;

  /**
   * Card press animation
   */
  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: animations.cardPress.scale,
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
    SoundManager.play('ui.tap');
    onPress?.(game);
  }, [game, onPress]);

  /**
   * Favorite button handler
   */
  const handleFavorite = useCallback((e) => {
    e?.stopPropagation?.();

    // Play appropriate sound
    if (isFavorite) {
      SoundManager.play('ui.remove');
    } else {
      SoundManager.play('ui.favorite');
    }

    // Bounce animation
    Animated.sequence([
      Animated.spring(favoriteScale, {
        toValue: 1.3,
        useNativeDriver: true,
        tension: 200,
        friction: 5,
      }),
      Animated.spring(favoriteScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }),
    ]).start();

    onFavorite?.(game);
  }, [game, isFavorite, onFavorite, favoriteScale]);

  /**
   * Format player count for kids
   */
  const formatPlayers = (count) => {
    if (!count) return null;
    if (count >= 1000000) return `${Math.floor(count / 1000000)}M+`;
    if (count >= 1000) return `${Math.floor(count / 1000)}K+`;
    return count.toString();
  };

  /**
   * Get rating emoji for kids
   */
  const getRatingEmoji = (rating) => {
    if (!rating) return null;
    if (rating >= 90) return { emoji: '🌟', label: 'Amazing!' };
    if (rating >= 80) return { emoji: '😍', label: 'Great!' };
    if (rating >= 70) return { emoji: '😊', label: 'Good' };
    if (rating >= 60) return { emoji: '🙂', label: 'Okay' };
    return { emoji: '😐', label: 'Meh' };
  };

  const playerCount = formatPlayers(game?.playing || game?.visits);
  const rating = getRatingEmoji(game?.rating);

  return (
    <Animated.View
      style={[
        styles.container,
        { width: config.width, transform: [{ scale: scaleAnim }] },
        shadows.large,
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        {/* Thumbnail */}
        <View style={[styles.imageContainer, { height: config.imageHeight }]}>
          <Image
            source={{ uri: game?.thumbnailUrl || game?.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Gradient overlay for better text visibility */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={styles.imageOverlay}
          />

          {/* Favorite button bubble */}
          <Animated.View
            style={[
              styles.favoriteButton,
              { transform: [{ scale: favoriteScale }] },
            ]}
          >
            <Pressable
              onPress={handleFavorite}
              hitSlop={12}
              style={styles.favoritePressable}
            >
              <View style={[
                styles.favoriteCircle,
                isFavorite && styles.favoriteCircleActive,
              ]}>
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? colors.action.like : colors.text.light}
                />
              </View>
            </Pressable>
          </Animated.View>

          {/* Player count badge */}
          {playerCount && (
            <View style={styles.playerBadge}>
              <Ionicons name="people" size={14} color={colors.text.light} />
              <Text style={styles.playerText}>{playerCount}</Text>
            </View>
          )}
        </View>

        {/* Card content */}
        <View style={styles.content}>
          {/* Game title */}
          <Text style={styles.title} numberOfLines={2}>
            {game?.name || 'Untitled Game'}
          </Text>

          {/* Rating with emoji */}
          {rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingEmoji}>{rating.emoji}</Text>
              <Text style={styles.ratingLabel}>{rating.label}</Text>
            </View>
          )}

          {/* Genre tags */}
          {game?.genre && (
            <View style={styles.genreContainer}>
              <View style={styles.genreTag}>
                <Text style={styles.genreText}>{game.genre}</Text>
              </View>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Compact card variant for lists
 */
export function KidGameCardCompact({
  game,
  onPress,
  onFavorite,
  isFavorite = false,
  style,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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
    SoundManager.play('ui.tap');
    onPress?.(game);
  }, [game, onPress]);

  const handleFavorite = useCallback(() => {
    SoundManager.play(isFavorite ? 'ui.remove' : 'ui.favorite');
    onFavorite?.(game);
  }, [game, isFavorite, onFavorite]);

  return (
    <Animated.View
      style={[
        styles.compactContainer,
        { transform: [{ scale: scaleAnim }] },
        shadows.medium,
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.compactPressable}
      >
        {/* Thumbnail */}
        <Image
          source={{ uri: game?.thumbnailUrl || game?.imageUrl }}
          style={styles.compactImage}
          resizeMode="cover"
        />

        {/* Content */}
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {game?.name || 'Untitled Game'}
          </Text>
          {game?.genre && (
            <Text style={styles.compactGenre} numberOfLines={1}>
              {game.genre}
            </Text>
          )}
        </View>

        {/* Favorite button */}
        <Pressable onPress={handleFavorite} hitSlop={12} style={styles.compactFavorite}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={28}
            color={isFavorite ? colors.action.like : colors.text.tertiary}
          />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Featured large card
 */
export function KidGameCardFeatured({
  game,
  onPress,
  onFavorite,
  isFavorite = false,
  style,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1.02,
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
    SoundManager.play('ui.tap');
    onPress?.(game);
  }, [game, onPress]);

  return (
    <Animated.View
      style={[
        styles.featuredContainer,
        { transform: [{ scale: scaleAnim }] },
        shadows.xlarge,
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.featuredPressable}
      >
        <Image
          source={{ uri: game?.thumbnailUrl || game?.imageUrl }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.featuredOverlay}
        >
          <View style={styles.featuredContent}>
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={16} color={colors.secondary.yellow} />
              <Text style={styles.featuredBadgeText}>Featured</Text>
            </View>
            <Text style={styles.featuredTitle} numberOfLines={2}>
              {game?.name || 'Untitled Game'}
            </Text>
            {game?.description && (
              <Text style={styles.featuredDescription} numberOfLines={2}>
                {game.description}
              </Text>
            )}
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Main card styles
  container: {
    backgroundColor: colors.background.card,
    borderRadius: radii.xxl,
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
  },
  favoritePressable: {
    padding: 4,
  },
  favoriteCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteCircleActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  playerBadge: {
    position: 'absolute',
    bottom: spacing.s,
    left: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs,
    borderRadius: radii.m,
  },
  playerText: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.light,
    marginLeft: spacing.xxs,
  },
  content: {
    padding: spacing.cardPadding,
  },
  title: {
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ratingEmoji: {
    fontSize: 18,
    marginRight: spacing.xxs,
  },
  ratingLabel: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs,
    borderRadius: radii.m,
  },
  genreText: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },

  // Compact card styles
  compactContainer: {
    backgroundColor: colors.background.card,
    borderRadius: radii.l,
    overflow: 'hidden',
  },
  compactPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
  },
  compactImage: {
    width: 80,
    height: 80,
    borderRadius: radii.m,
  },
  compactContent: {
    flex: 1,
    marginLeft: spacing.m,
    marginRight: spacing.s,
  },
  compactTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  compactGenre: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
  },
  compactFavorite: {
    padding: spacing.xs,
  },

  // Featured card styles
  featuredContainer: {
    height: 280,
    borderRadius: radii.xxl,
    overflow: 'hidden',
  },
  featuredPressable: {
    flex: 1,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingTop: 80,
  },
  featuredContent: {
    justifyContent: 'flex-end',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs,
    borderRadius: radii.m,
    marginBottom: spacing.s,
  },
  featuredBadgeText: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.light,
    marginLeft: spacing.xxs,
  },
  featuredTitle: {
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.light,
    marginBottom: spacing.xs,
  },
  featuredDescription: {
    fontSize: typography.fontSize.body,
    color: colors.text.lightSecondary,
    opacity: 0.9,
  },
});
