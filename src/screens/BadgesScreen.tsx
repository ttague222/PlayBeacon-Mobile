/**
 * BadgesScreen
 *
 * Displays all badges in a grid layout with progress tracking.
 * Kid-friendly design.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useCollection } from '../context/CollectionContext';
import SoundManager from '../services/SoundManager';
import { BadgeDefinition, AnimalDefinition, RARITY_CONFIG } from '../types/badges';
import { BadgeTile, BadgeDetailModal, AnimalTile, AnimalCardModal } from '../components/badges';
import { TILE_GAP, getNumColumns } from '../components/badges/BadgeTile';
import { colors } from '../styles/colors';
import { radii, spacing, typography } from '../styles/kidTheme';
import ProfileButton from '../components/ProfileButton';

const HORIZONTAL_PADDING = 20;

export default function BadgesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const numColumns = getNumColumns(screenWidth);
  const {
    badges,
    animals,
    getUnlockedBadgeCount,
    getTotalBadges,
    isBadgeUnlocked,
    getUnlockedAnimalCount,
    getTotalAnimals,
    isAnimalUnlocked,
  } = useCollection();

  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalDefinition | null>(null);
  const [animalModalVisible, setAnimalModalVisible] = useState(false);

  // Sort badges: unlocked first, then by order
  const sortedBadges = useMemo(() => {
    return [...badges].sort((a, b) => {
      const aUnlocked = isBadgeUnlocked(a.id);
      const bUnlocked = isBadgeUnlocked(b.id);

      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;
      return a.order - b.order;
    });
  }, [badges, isBadgeUnlocked]);

  // Stats
  const unlockedBadges = getUnlockedBadgeCount();
  const totalBadges = getTotalBadges();
  const badgePercent = totalBadges > 0 ? Math.round((unlockedBadges / totalBadges) * 100) : 0;

  const unlockedAnimals = getUnlockedAnimalCount();
  const totalAnimals = getTotalAnimals();

  // Get unlocked animals for preview (limit to 5)
  const previewAnimals = useMemo(() => {
    return animals
      .filter(animal => isAnimalUnlocked(animal.id))
      .sort((a, b) => a.order - b.order)
      .slice(0, 5);
  }, [animals, isAnimalUnlocked]);

  const handleBadgePress = useCallback((badge: BadgeDefinition) => {
    setSelectedBadge(badge);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedBadge(null);
  }, []);

  const handleViewAnimal = useCallback((animalId: string) => {
    SoundManager.play('ui.tap');
    navigation.navigate('Collectables' as never, { animalId } as never);
  }, [navigation]);

  const handleGoToCollectables = useCallback(() => {
    SoundManager.play('ui.tap');
    navigation.navigate('Collectables' as never);
  }, [navigation]);

  const handleAnimalPress = useCallback((animal: AnimalDefinition) => {
    setSelectedAnimal(animal);
    setAnimalModalVisible(true);
  }, []);

  const handleCloseAnimalModal = useCallback(() => {
    setAnimalModalVisible(false);
    setSelectedAnimal(null);
  }, []);

  // Get encouragement message based on progress
  const getEncouragement = () => {
    if (badgePercent === 100) return { emoji: '🎉', text: t('badges.encouragement100') };
    if (badgePercent >= 75) return { emoji: '🌟', text: t('badges.encouragement75') };
    if (badgePercent >= 50) return { emoji: '✨', text: t('badges.encouragement50') };
    if (badgePercent >= 25) return { emoji: '🚀', text: t('badges.encouragement25') };
    return { emoji: '🎯', text: t('badges.encouragementDefault') };
  };

  const encouragement = getEncouragement();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{t('badges.title')}</Text>
          <Text style={styles.subtitle}>{t('badges.subtitle')}</Text>
        </View>
        <ProfileButton />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Card */}
        <View style={styles.progressCard}>
          {/* Top row: Stats */}
          <View style={styles.statsRow}>
            {/* Badge count with icon */}
            <View style={styles.statItem}>
              <View style={styles.statIconBadge}>
                <Ionicons name="ribbon" size={18} color={colors.accent.primary} />
              </View>
              <View>
                <Text style={styles.statNumber}>{unlockedBadges}<Text style={styles.statDivider}>/{totalBadges}</Text></Text>
                <Text style={styles.statLabel}>{t('badges.title')}</Text>
              </View>
            </View>

            {/* Progress circle in center */}
            <View style={styles.progressCircle}>
              <Text style={styles.progressEmoji}>{encouragement.emoji}</Text>
              <Text style={styles.progressPercentLarge}>{badgePercent}%</Text>
            </View>

            {/* Animals link */}
            <Pressable style={styles.statItem} onPress={handleGoToCollectables}>
              <View style={[styles.statIconBadge, { backgroundColor: colors.accent.tertiary + '40' }]}>
                <Text style={styles.miniEmoji}>🐾</Text>
              </View>
              <View>
                <Text style={styles.statNumber}>{unlockedAnimals}<Text style={styles.statDivider}>/{totalAnimals}</Text></Text>
                <Text style={styles.statLabel}>{t('badges.sectionAnimals')}</Text>
              </View>
            </Pressable>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${badgePercent}%` }]} />
          </View>

          {/* Encouragement in a bubble */}
          <View style={styles.encouragementBubble}>
            <Text style={styles.encouragementText}>{encouragement.text}</Text>
          </View>
        </View>

        {/* Animals Preview Section */}
        {unlockedAnimals > 0 && (
          <View style={styles.animalsPreviewSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionEmoji}>🐾</Text>
                <Text style={styles.sectionTitle}>{t('badges.sectionAnimals')}</Text>
              </View>
              <Pressable style={styles.seeAllButton} onPress={handleGoToCollectables}>
                <Text style={styles.seeAllText}>{t('badges.buttonSeeAll')}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.accent.primary} />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.animalsPreviewScroll}
            >
              {previewAnimals.map(animal => (
                <AnimalTile
                  key={animal.id}
                  animal={animal}
                  onPress={handleAnimalPress}
                  size="small"
                />
              ))}

              {/* "More" button if there are more animals */}
              {unlockedAnimals > 5 && (
                <Pressable style={styles.moreAnimalsButton} onPress={handleGoToCollectables}>
                  <Text style={styles.moreAnimalsCount}>{t('badges.moreAnimals', { count: unlockedAnimals - 5 })}</Text>
                </Pressable>
              )}
            </ScrollView>
          </View>
        )}

        {/* Section header for badges */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('badges.sectionBadges')}</Text>
          <Text style={styles.sectionCount}>{unlockedBadges} {t('achievements.unlocked').toLowerCase()}</Text>
        </View>

        {/* Badges Grid */}
        <View style={styles.badgesGrid}>
          {sortedBadges.map((badge, index) => {
            // Add right margin for all except the last column
            const isLastColumn = (index + 1) % numColumns === 0;
            return (
              <View
                key={badge.id}
                style={[
                  styles.badgeTileWrapper,
                  !isLastColumn && { marginRight: TILE_GAP }
                ]}
              >
                <BadgeTile
                  badge={badge}
                  onPress={handleBadgePress}
                />
              </View>
            );
          })}
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Badge Detail Modal */}
      <BadgeDetailModal
        badge={selectedBadge}
        visible={modalVisible}
        onClose={handleCloseModal}
        onViewAnimal={handleViewAnimal}
      />

      {/* Animal Card Modal */}
      <AnimalCardModal
        animal={selectedAnimal}
        visible={animalModalVisible}
        onClose={handleCloseAnimalModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.header,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
  },
  progressCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.xl,
    padding: 20,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.s,
    backgroundColor: colors.accent.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  miniEmoji: {
    fontSize: 18,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statDivider: {
    fontSize: 14,
    fontWeight: 'normal',
    color: colors.text.tertiary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 1,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: radii.xxl,
    backgroundColor: colors.background.tertiary,
    borderWidth: 4,
    borderColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressEmoji: {
    fontSize: 22,
    marginBottom: -2,
  },
  progressPercentLarge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent.primary,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.xs,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: radii.xs,
  },
  encouragementBubble: {
    backgroundColor: colors.background.tertiary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radii.l,
    alignSelf: 'center',
  },
  encouragementText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  animalsPreviewSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: typography.sizes.bodyLarge,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionCount: {
    fontSize: typography.sizes.caption,
    color: colors.text.tertiary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: typography.sizes.body,
    fontWeight: '600',
    color: colors.accent.primary,
    marginRight: 2,
  },
  animalsPreviewScroll: {
    paddingRight: 16,
  },
  moreAnimalsButton: {
    width: 100,
    height: 132,
    borderRadius: radii.l,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    borderWidth: 2,
    borderColor: colors.accent.primary,
    borderStyle: 'dashed',
  },
  moreAnimalsCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent.primary,
    textAlign: 'center',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeTileWrapper: {
    // Width is calculated in BadgeTile component
  },
  bottomPadding: {
    height: 120,
  },
});
