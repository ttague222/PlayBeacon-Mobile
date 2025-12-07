import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../styles/colors';
import { getLevelProgress } from '../utils/xpSystem';

export default function XPProgressBar({ currentXP, showDetails = true, compact = false }) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const levelProgress = getLevelProgress(currentXP);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: levelProgress.progressPercentage,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [levelProgress.progressPercentage]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactLevel}>Level {levelProgress.currentLevel}</Text>
          <Text style={styles.compactXP}>{currentXP} XP</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showDetails && (
        <View style={styles.header}>
          <View style={styles.levelContainer}>
            <Text style={styles.levelLabel}>Level</Text>
            <Text style={styles.levelNumber}>{levelProgress.currentLevel}</Text>
          </View>
          <View style={styles.xpContainer}>
            <Text style={styles.xpLabel}>Total XP</Text>
            <Text style={styles.xpNumber}>{currentXP}</Text>
          </View>
        </View>
      )}

      <View style={styles.progressSection}>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>

        {showDetails && (
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {levelProgress.xpIntoCurrentLevel} / {levelProgress.xpNeededForNextLevel} XP
            </Text>
            <Text style={styles.nextLevelText}>
              to Level {levelProgress.nextLevel}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  levelContainer: {
    alignItems: 'flex-start',
  },
  levelLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  levelNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.accent.primary,
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xpLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  xpNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
  },
  progressSection: {
    gap: 8,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.background.tertiary,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: 6,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  nextLevelText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  // Compact styles
  compactContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: 12,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  compactXP: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
});
