/**
 * CollectablesScreen
 *
 * Displays all animal collectables in a gallery grid.
 * Kid-friendly design with rarity indicators.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useCollection } from '../context/CollectionContext';
import SoundManager from '../services/SoundManager';
import { AnimalDefinition, RARITY_CONFIG } from '../types/badges';
import { AnimalTile, AnimalCardModal } from '../components/badges';
import { TILE_GAP, getNumColumns } from '../components/badges/BadgeTile';
import { colors } from '../styles/colors';
import { typography, radii } from '../styles/kidTheme';

const HORIZONTAL_PADDING = 20;

type CollectablesRouteParams = {
  Collectables: { animalId?: string };
};

export default function CollectablesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<CollectablesRouteParams, 'Collectables'>>();
  const initialAnimalId = route.params?.animalId;
  const { width: screenWidth } = useWindowDimensions();
  const numColumns = getNumColumns(screenWidth);

  const {
    animals,
    getUnlockedAnimalCount,
    getTotalAnimals,
    isAnimalUnlocked,
  } = useCollection();

  const [selectedAnimal, setSelectedAnimal] = useState<AnimalDefinition | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterRarity, setFilterRarity] = useState<string | null>(null);

  // Handle initial animal from navigation params
  useEffect(() => {
    if (initialAnimalId) {
      const animal = animals.find(a => a.id === initialAnimalId);
      if (animal) {
        setSelectedAnimal(animal);
        setModalVisible(true);
      }
    }
  }, [initialAnimalId, animals]);

  // Sort animals by rarity and unlock status
  const sortedAnimals = useMemo(() => {
    let filtered = [...animals];

    // Apply rarity filter
    if (filterRarity) {
      filtered = filtered.filter(a => a.rarity === filterRarity);
    }

    // Sort: unlocked first, then by order
    return filtered.sort((a, b) => {
      const aUnlocked = isAnimalUnlocked(a.id);
      const bUnlocked = isAnimalUnlocked(b.id);

      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;
      return a.order - b.order;
    });
  }, [animals, filterRarity, isAnimalUnlocked]);

  // Stats
  const unlockedCount = getUnlockedAnimalCount();
  const totalCount = getTotalAnimals();
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Rarity counts
  const rarityCounts = useMemo(() => {
    const counts = { common: 0, rare: 0, special: 0, total: 0 };
    animals.forEach(animal => {
      if (isAnimalUnlocked(animal.id)) {
        counts[animal.rarity]++;
        counts.total++;
      }
    });
    return counts;
  }, [animals, isAnimalUnlocked]);

  const handleAnimalPress = useCallback((animal: AnimalDefinition) => {
    setSelectedAnimal(animal);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedAnimal(null);
  }, []);

  const handleFilterPress = useCallback((rarity: string | null) => {
    SoundManager.play('ui.tap');
    setFilterRarity(prev => (prev === rarity ? null : rarity));
  }, []);

  const handleGoBack = useCallback(() => {
    SoundManager.play('ui.tap');
    navigation.goBack();
  }, [navigation]);

  const handleClearFilter = useCallback(() => {
    SoundManager.play('ui.tap');
    setFilterRarity(null);
  }, []);

  // Get encouragement message based on progress
  const getEncouragement = () => {
    if (progressPercent === 100) return { emoji: '🎊', text: t('collectables.encouragement100') };
    if (rarityCounts.special > 0) return { emoji: '✨', text: t('collectables.encouragementSpecial') };
    if (progressPercent >= 50) return { emoji: '🌟', text: t('collectables.encouragement50') };
    if (progressPercent >= 25) return { emoji: '🚀', text: t('collectables.encouragement25') };
    return { emoji: '🎯', text: t('collectables.encouragementDefault') };
  };

  const encouragement = getEncouragement();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />

      {/* Header with back button */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{t('collectables.title')}</Text>
          <Text style={styles.subtitle}>{t('collectables.subtitle')}</Text>
        </View>
        <View style={styles.headerRight} />
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
            {/* Total collected */}
            <View style={styles.statItem}>
              <View style={[styles.statIconBadge, { backgroundColor: colors.accent.tertiary + '40' }]}>
                <Text style={styles.miniEmoji}>🐾</Text>
              </View>
              <View>
                <Text style={styles.statNumber}>
                  {unlockedCount}
                  <Text style={styles.statDivider}>/{totalCount}</Text>
                </Text>
                <Text style={styles.statLabel}>Animals</Text>
              </View>
            </View>

            {/* Progress circle in center */}
            <View style={styles.progressCircle}>
              <Text style={styles.progressEmoji}>{encouragement.emoji}</Text>
              <Text style={styles.progressPercentLarge}>{progressPercent}%</Text>
            </View>

            {/* Rare + Special count */}
            <View style={styles.statItem}>
              <View style={[styles.statIconBadge, { backgroundColor: RARITY_CONFIG.special.bgColor }]}>
                <Ionicons name="star" size={16} color={RARITY_CONFIG.special.color} />
              </View>
              <View>
                <Text style={styles.statNumber}>
                  {rarityCounts.rare + rarityCounts.special}
                  <Text style={styles.statDivider}>
                    /{animals.filter(a => a.rarity === 'rare' || a.rarity === 'special').length}
                  </Text>
                </Text>
                <Text style={styles.statLabel}>Rare+</Text>
              </View>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
          </View>

          {/* Encouragement in a bubble */}
          <View style={styles.encouragementBubble}>
            <Text style={styles.encouragementText}>{encouragement.text}</Text>
          </View>
        </View>

        {/* Rarity filter pills */}
        <View style={styles.filterRow}>
          {(['common', 'rare', 'special'] as const).map(rarity => (
            <Pressable
              key={rarity}
              style={[
                styles.filterPill,
                {
                  backgroundColor: filterRarity === rarity
                    ? RARITY_CONFIG[rarity].color
                    : RARITY_CONFIG[rarity].bgColor,
                },
              ]}
              onPress={() => handleFilterPress(rarity)}
            >
              <Ionicons
                name="star"
                size={12}
                color={filterRarity === rarity ? '#FFF' : RARITY_CONFIG[rarity].color}
              />
              <Text
                style={[
                  styles.filterPillText,
                  {
                    color: filterRarity === rarity ? '#FFF' : RARITY_CONFIG[rarity].color,
                  },
                ]}
              >
                {RARITY_CONFIG[rarity].label}
              </Text>
            </Pressable>
          ))}
          {filterRarity && (
            <Pressable style={styles.clearFilter} onPress={handleClearFilter}>
              <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
            </Pressable>
          )}
        </View>

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('collectables.sectionAnimals')}</Text>
          <Text style={styles.sectionCount}>{unlockedCount} {t('collected')}</Text>
        </View>

        {/* Animals Grid */}
        <View style={styles.animalsGrid}>
          {sortedAnimals.map((animal, index) => {
            // Add right margin for all except the last column
            const isLastColumn = (index + 1) % numColumns === 0;
            return (
              <View
                key={animal.id}
                style={[
                  styles.animalTileWrapper,
                  !isLastColumn && { marginRight: TILE_GAP }
                ]}
              >
                <AnimalTile
                  animal={animal}
                  onPress={handleAnimalPress}
                  size="medium"
                />
              </View>
            );
          })}
        </View>

        {/* Empty state */}
        {sortedAnimals.length === 0 && filterRarity && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>
              {t('collectables.emptyNoAnimals', { rarity: RARITY_CONFIG[filterRarity as keyof typeof RARITY_CONFIG].label.toLowerCase() })}
            </Text>
            <Pressable
              style={styles.clearFilterButton}
              onPress={handleClearFilter}
            >
              <Text style={styles.clearFilterText}>{t('collectables.buttonShowAll')}</Text>
            </Pressable>
          </View>
        )}

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Animal Card Modal */}
      <AnimalCardModal
        animal={selectedAnimal}
        visible={modalVisible}
        onClose={handleCloseModal}
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
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.l,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerRight: {
    width: 40,
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
    marginBottom: 16,
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
    borderColor: colors.accent.tertiary,
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
    color: colors.accent.tertiary,
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
    backgroundColor: colors.accent.tertiary,
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.l,
    gap: 4,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clearFilter: {
    marginLeft: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
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
  animalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  animalTileWrapper: {
    // Width is calculated in AnimalTile component
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: typography.sizes.body,
    color: colors.text.tertiary,
    marginBottom: 16,
  },
  clearFilterButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radii.l,
  },
  clearFilterText: {
    color: '#FFF',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 120,
  },
});
