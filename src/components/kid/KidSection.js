/**
 * KidSection Component
 *
 * Section wrapper with kid-friendly styling:
 * - Clear headers with icons
 * - Proper spacing
 * - Optional "See All" button
 * - Animated entrance
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { kidTheme } from '../../styles/kidTheme';
import SoundManager from '../../services/SoundManager';

const {
  radii,
  spacing,
  typography,
  colors,
} = kidTheme;

/**
 * Section header with title and optional action
 */
export function KidSectionHeader({
  title,
  icon,
  emoji,
  actionLabel = 'See All',
  onAction,
  style,
}) {
  const handleAction = () => {
    SoundManager.play('ui.tap');
    onAction?.();
  };

  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerLeft}>
        {emoji && <Text style={styles.headerEmoji}>{emoji}</Text>}
        {icon && !emoji && (
          <Ionicons
            name={icon}
            size={24}
            color={colors.primary.purple}
            style={styles.headerIcon}
          />
        )}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {onAction && (
        <Pressable onPress={handleAction} hitSlop={12}>
          <View style={styles.actionButton}>
            <Text style={styles.actionText}>{actionLabel}</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.primary.blue}
            />
          </View>
        </Pressable>
      )}
    </View>
  );
}

/**
 * Main section wrapper
 */
export default function KidSection({
  title,
  icon,
  emoji,
  actionLabel,
  onAction,
  children,
  style,
  contentStyle,
  animated = true,
}) {
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(animated ? 20 : 0)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      {title && (
        <KidSectionHeader
          title={title}
          icon={icon}
          emoji={emoji}
          actionLabel={actionLabel}
          onAction={onAction}
        />
      )}
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </Animated.View>
  );
}

/**
 * Card-style section with background
 */
export function KidSectionCard({
  title,
  icon,
  emoji,
  actionLabel,
  onAction,
  children,
  style,
  backgroundColor = colors.background.card,
}) {
  return (
    <View style={[styles.sectionCard, { backgroundColor }, style]}>
      {title && (
        <KidSectionHeader
          title={title}
          icon={icon}
          emoji={emoji}
          actionLabel={actionLabel}
          onAction={onAction}
          style={styles.cardHeader}
        />
      )}
      <View style={styles.cardContent}>
        {children}
      </View>
    </View>
  );
}

/**
 * Horizontal scroll section
 */
export function KidHorizontalSection({
  title,
  icon,
  emoji,
  actionLabel,
  onAction,
  children,
  style,
}) {
  return (
    <KidSection
      title={title}
      icon={icon}
      emoji={emoji}
      actionLabel={actionLabel}
      onAction={onAction}
      style={style}
      contentStyle={styles.horizontalContent}
    >
      {children}
    </KidSection>
  );
}

/**
 * Grid section for game cards
 */
export function KidGridSection({
  title,
  icon,
  emoji,
  actionLabel,
  onAction,
  columns = 2,
  children,
  style,
}) {
  return (
    <KidSection
      title={title}
      icon={icon}
      emoji={emoji}
      actionLabel={actionLabel}
      onAction={onAction}
      style={style}
    >
      <View style={[styles.grid, { gap: spacing.m }]}>
        {React.Children.map(children, (child, index) => (
          <View
            style={[
              styles.gridItem,
              { width: `${100 / columns - 2}%` },
            ]}
            key={index}
          >
            {child}
          </View>
        ))}
      </View>
    </KidSection>
  );
}

/**
 * Divider between sections
 */
export function KidSectionDivider({ style }) {
  return <View style={[styles.divider, style]} />;
}

/**
 * Empty state for sections
 */
export function KidSectionEmpty({
  emoji = '🔍',
  title = 'Nothing here yet',
  message,
  actionLabel,
  onAction,
  style,
}) {
  return (
    <View style={[styles.emptyContainer, style]}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message && <Text style={styles.emptyMessage}>{message}</Text>}
      {onAction && actionLabel && (
        <Pressable onPress={onAction} style={styles.emptyAction}>
          <Text style={styles.emptyActionText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.edgePadding,
    marginBottom: spacing.m,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerEmoji: {
    fontSize: 24,
    marginRight: spacing.s,
  },
  headerIcon: {
    marginRight: spacing.s,
  },
  headerTitle: {
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
  },
  actionText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.blue,
    marginRight: spacing.xxs,
  },
  content: {
    paddingHorizontal: spacing.edgePadding,
  },
  horizontalContent: {
    paddingHorizontal: 0,
  },

  // Card section
  sectionCard: {
    marginHorizontal: spacing.edgePadding,
    marginBottom: spacing.xl,
    borderRadius: radii.xxl,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: spacing.cardPadding,
    paddingTop: spacing.cardPadding,
    marginBottom: spacing.s,
  },
  cardContent: {
    padding: spacing.cardPadding,
    paddingTop: 0,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    marginBottom: spacing.m,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.background.elevated,
    marginHorizontal: spacing.edgePadding,
    marginVertical: spacing.l,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.m,
  },
  emptyTitle: {
    fontSize: typography.fontSize.subtitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptyMessage: {
    fontSize: typography.fontSize.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  emptyAction: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
  },
  emptyActionText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.blue,
  },
});
