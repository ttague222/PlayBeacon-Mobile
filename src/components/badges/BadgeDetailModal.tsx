/**
 * BadgeDetailModal Component
 *
 * Full-screen modal showing badge details and associated animal.
 * Kid-friendly design.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BadgeDefinition, RARITY_CONFIG } from '../../types/badges';
import { useCollection } from '../../context/CollectionContext';
import { colors } from '../../styles/colors';
import { radii, spacing, typography } from '../../styles/kidTheme';
import SoundManager from '../../services/SoundManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animal image mapping - custom artwork
const ANIMAL_IMAGES: Record<string, ImageSourcePropType> = {
  bear: require('../../../assets/images/animals/bear.png'),
  fox: require('../../../assets/images/animals/fox.png'),
  penguin: require('../../../assets/images/animals/penguin.png'),
  owl: require('../../../assets/images/animals/owl.png'),
  turtle: require('../../../assets/images/animals/turtle.png'),
  raccoon: require('../../../assets/images/animals/raccoon.png'),
  cat: require('../../../assets/images/animals/cat.png'),
  dog: require('../../../assets/images/animals/dog.png'),
  hedgehog: require('../../../assets/images/animals/hedgehog.png'),
  parrot: require('../../../assets/images/animals/parrot.png'),
  panda: require('../../../assets/images/animals/panda.png'),
  lion: require('../../../assets/images/animals/lion.png'),
  elephant: require('../../../assets/images/animals/elephant.png'),
  dolphin: require('../../../assets/images/animals/dolphin.png'),
  koala: require('../../../assets/images/animals/koala.png'),
  frog: require('../../../assets/images/animals/frog.png'),
};

interface BadgeDetailModalProps {
  badge: BadgeDefinition | null;
  visible: boolean;
  onClose: () => void;
  onViewAnimal?: (animalId: string) => void;
}

export default function BadgeDetailModal({
  badge,
  visible,
  onClose,
  onViewAnimal,
}: BadgeDetailModalProps) {
  const { getBadgeProgress, isBadgeUnlocked, animals, markBadgeSeen } = useCollection();

  const isUnlocked = badge ? isBadgeUnlocked(badge.id) : false;
  const progress = badge ? getBadgeProgress(badge.id) : undefined;
  const animal = badge ? animals.find(a => a.badgeId === badge.id) : undefined;

  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && badge) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Mark badge as seen
      if (isUnlocked && progress && !progress.seen) {
        markBadgeSeen(badge.id);
      }

      // Play sound
      SoundManager.play('ui.modal_open');
    } else {
      scaleAnim.setValue(0.8);
      fadeAnim.setValue(0);
    }
  }, [visible, badge, isUnlocked, progress, markBadgeSeen, scaleAnim, fadeAnim]);

  const handleClose = () => {
    SoundManager.play('ui.modal_close');
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const handleViewAnimal = () => {
    if (animal && onViewAnimal) {
      SoundManager.play('ui.tap');
      onViewAnimal(animal.id);
      onClose();
    }
  };

  if (!badge) return null;

  const progressPercent = progress
    ? Math.min(100, Math.round((progress.progress / badge.requirementValue) * 100))
    : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <Animated.View
          style={[
            styles.modal,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close-circle" size={36} color={colors.text.tertiary} />
          </Pressable>

          {/* Badge icon */}
          <View style={[styles.badgeIcon, isUnlocked ? styles.unlockedIcon : styles.lockedIcon]}>
            <Text style={styles.badgeEmoji}>{badge.icon}</Text>
            {!isUnlocked && (
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={20} color={colors.text.tertiary} />
              </View>
            )}
          </View>

          {/* Badge name */}
          <Text style={styles.badgeName}>{badge.name}</Text>

          {/* Description or hint */}
          <Text style={styles.description}>
            {isUnlocked ? badge.description : badge.hint}
          </Text>

          {/* Progress section */}
          {!isUnlocked && (
            <View style={styles.progressSection}>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {progress?.progress || 0} / {badge.requirementValue}
              </Text>
            </View>
          )}

          {/* Unlocked date */}
          {isUnlocked && progress?.unlockedAt && (
            <Text style={styles.unlockedDate}>
              Unlocked {new Date(progress.unlockedAt).toLocaleDateString()}
            </Text>
          )}

          {/* Animal preview (if unlocked) */}
          {isUnlocked && animal && (
            <Pressable style={styles.animalSection} onPress={handleViewAnimal}>
              <View style={[styles.animalPreview, { backgroundColor: RARITY_CONFIG[animal.rarity].bgColor }]}>
                {ANIMAL_IMAGES[animal.id] ? (
                  <Image
                    source={ANIMAL_IMAGES[animal.id]}
                    style={styles.animalImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.animalEmoji}>🐾</Text>
                )}
              </View>
              <View style={styles.animalInfo}>
                <Text style={styles.animalLabel}>You unlocked:</Text>
                <Text style={styles.animalName}>{animal.name}</Text>
                <View style={[styles.rarityBadge, { backgroundColor: RARITY_CONFIG[animal.rarity].bgColor }]}>
                  <Text style={[styles.rarityText, { color: RARITY_CONFIG[animal.rarity].color }]}>
                    {RARITY_CONFIG[animal.rarity].label}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
            </Pressable>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.modalOverlay,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    width: SCREEN_WIDTH - 40,
    maxWidth: 380,
    backgroundColor: colors.background.secondary,
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    paddingTop: spacing.xxxl + 8,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  badgeIcon: {
    width: 110,
    height: 110,
    borderRadius: radii.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  unlockedIcon: {
    backgroundColor: colors.background.tertiary,
  },
  lockedIcon: {
    backgroundColor: colors.background.primary,
  },
  badgeEmoji: {
    fontSize: 56,
  },
  lockBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(46, 36, 64, 0.9)',
    borderRadius: radii.circle,
    padding: 6,
  },
  badgeName: {
    fontSize: typography.sizes.title,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  description: {
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.l,
    lineHeight: 24,
    paddingHorizontal: spacing.m,
  },
  progressSection: {
    width: '100%',
    marginBottom: spacing.md,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.background.primary,
    borderRadius: radii.pill,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: radii.pill,
  },
  progressText: {
    fontSize: typography.sizes.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  unlockedDate: {
    fontSize: typography.sizes.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.l,
  },
  animalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    padding: spacing.l,
    borderRadius: radii.l,
    width: '100%',
    marginTop: spacing.m,
  },
  animalPreview: {
    width: 64,
    height: 64,
    borderRadius: radii.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animalImage: {
    width: 48,
    height: 48,
  },
  animalEmoji: {
    fontSize: 32,
  },
  animalInfo: {
    flex: 1,
    marginLeft: spacing.l,
  },
  animalLabel: {
    fontSize: typography.sizes.caption,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  animalName: {
    fontSize: typography.sizes.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    marginTop: 4,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
