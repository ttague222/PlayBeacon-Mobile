import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../styles/colors';

export default function SkeletonLoader({ variant = 'card', count = 1 }) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderQueueCard = () => (
    <View style={styles.queueCard}>
      <Animated.View style={[styles.queueThumbnail, { opacity }]} />
      <View style={styles.queueInfo}>
        <Animated.View style={[styles.queueTitle, { opacity }]} />
        <Animated.View style={[styles.queueCreator, { opacity }]} />
        <Animated.View style={[styles.queueStats, { opacity }]} />
      </View>
      <View style={styles.queueButtons}>
        <Animated.View style={[styles.queueButton, { opacity }]} />
        <Animated.View style={[styles.queueButton, { opacity }]} />
        <Animated.View style={[styles.queueButton, { opacity }]} />
      </View>
    </View>
  );

  const renderGridCard = () => (
    <View style={styles.gridCard}>
      <Animated.View style={[styles.gridThumbnail, { opacity }]} />
      <View style={styles.gridInfo}>
        <Animated.View style={[styles.gridTitle, { opacity }]} />
        <Animated.View style={[styles.gridGenre, { opacity }]} />
        <Animated.View style={[styles.gridStats, { opacity }]} />
      </View>
    </View>
  );

  const renderListItem = () => (
    <View style={styles.listItem}>
      <View style={styles.listContent}>
        <Animated.View style={[styles.listTitle, { opacity }]} />
        <Animated.View style={[styles.listDescription, { opacity }]} />
        <Animated.View style={[styles.listCount, { opacity }]} />
      </View>
    </View>
  );

  const renderGameItem = () => (
    <View style={styles.gameItem}>
      <Animated.View style={[styles.gameThumbnail, { opacity }]} />
      <View style={styles.gameInfo}>
        <Animated.View style={[styles.gameTitle, { opacity }]} />
        <Animated.View style={[styles.gameCreator, { opacity }]} />
        <Animated.View style={[styles.gameStats, { opacity }]} />
      </View>
      <View style={styles.gameActions}>
        <Animated.View style={[styles.gameButton, { opacity }]} />
        <Animated.View style={[styles.gameButton, { opacity }]} />
      </View>
    </View>
  );

  const renderBadgeCard = () => (
    <View style={styles.badgeCard}>
      <Animated.View style={[styles.badgeIcon, { opacity }]} />
      <View style={styles.badgeInfo}>
        <Animated.View style={[styles.badgeName, { opacity }]} />
        <Animated.View style={[styles.badgeProgress, { opacity }]} />
      </View>
    </View>
  );

  const renderTaskItem = () => (
    <View style={styles.taskItem}>
      <Animated.View style={[styles.taskCheckbox, { opacity }]} />
      <View style={styles.taskContent}>
        <Animated.View style={[styles.taskTitle, { opacity }]} />
        <Animated.View style={[styles.taskDescription, { opacity }]} />
      </View>
    </View>
  );

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <Animated.View style={[styles.profileAvatar, { opacity }]} />
      <View style={styles.profileInfo}>
        <Animated.View style={[styles.profileName, { opacity }]} />
        <Animated.View style={[styles.profileStats, { opacity }]} />
      </View>
    </View>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'queue':
        return renderQueueCard();
      case 'grid':
        return renderGridCard();
      case 'list':
        return renderListItem();
      case 'game':
        return renderGameItem();
      case 'badge':
        return renderBadgeCard();
      case 'task':
        return renderTaskItem();
      case 'profile':
        return renderProfileHeader();
      default:
        return renderGridCard();
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index}>{renderSkeleton()}</View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  // Queue Card Skeleton (for QueueScreen)
  queueCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  queueThumbnail: {
    width: '100%',
    height: 300,
    backgroundColor: colors.background.tertiary,
  },
  queueInfo: {
    padding: 20,
  },
  queueTitle: {
    height: 24,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    marginBottom: 12,
    width: '80%',
  },
  queueCreator: {
    height: 16,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    marginBottom: 16,
    width: '50%',
  },
  queueStats: {
    height: 14,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    width: '60%',
  },
  queueButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  queueButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
  },

  // Grid Card Skeleton (for grid layouts)
  gridCard: {
    width: '48%',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  gridThumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: colors.background.tertiary,
  },
  gridInfo: {
    padding: 12,
  },
  gridTitle: {
    height: 16,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    marginBottom: 8,
    width: '90%',
  },
  gridGenre: {
    height: 12,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    marginBottom: 8,
    width: '50%',
  },
  gridStats: {
    height: 12,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    width: '70%',
  },

  // List Item Skeleton (for CollectionsScreen)
  listItem: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    height: 18,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  listDescription: {
    height: 14,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    marginBottom: 8,
    width: '90%',
  },
  listCount: {
    height: 12,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    width: '40%',
  },

  // Game Item Skeleton (for CollectionDetailScreen)
  gameItem: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  gameThumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: colors.background.tertiary,
  },
  gameInfo: {
    padding: 16,
  },
  gameTitle: {
    height: 18,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  gameCreator: {
    height: 14,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
  },
  gameStats: {
    height: 12,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    width: '70%',
  },
  gameActions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  gameButton: {
    flex: 1,
    height: 40,
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
  },

  // Badge Card Skeleton
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.tertiary,
    marginRight: 12,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    height: 16,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
  },
  badgeProgress: {
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    width: '100%',
  },

  // Task Item Skeleton
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.background.tertiary,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    height: 16,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  taskDescription: {
    height: 12,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    width: '90%',
  },

  // Profile Header Skeleton
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background.tertiary,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    height: 20,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    marginBottom: 8,
    width: '50%',
  },
  profileStats: {
    height: 14,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    width: '80%',
  },
});
