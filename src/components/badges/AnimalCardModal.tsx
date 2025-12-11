/**
 * AnimalCardModal Component
 *
 * Full-screen modal showing animal card details.
 * Includes fun fact, rarity, and Bear reaction.
 */

import React, { useEffect, useRef } from 'react';
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
import { AnimalDefinition, RARITY_CONFIG, RARITY_STARS } from '../../types/badges';
import { useCollection } from '../../context/CollectionContext';
import { colors } from '../../styles/colors';
import { radii, spacing, typography } from '../../styles/kidTheme';
import SoundManager from '../../services/SoundManager';
import Bear, { BearState } from '../Bear';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AnimalCardModalProps {
  animal: AnimalDefinition | null;
  visible: boolean;
  onClose: () => void;
}

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

export default function AnimalCardModal({
  animal,
  visible,
  onClose,
}: AnimalCardModalProps) {
  const { isAnimalUnlocked, markAnimalSeen, getAnimalProgress } = useCollection();

  const isUnlocked = animal ? isAnimalUnlocked(animal.id) : false;
  const progress = animal ? getAnimalProgress(animal.id) : undefined;

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && animal) {
      // Reset animations
      scaleAnim.setValue(0.5);
      rotateAnim.setValue(0);
      fadeAnim.setValue(0);
      sparkleAnim.setValue(0);

      // Card flip and scale animation
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 6,
            tension: 50,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Sparkle loop animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Mark as seen
      if (isUnlocked && progress && !progress.seen) {
        markAnimalSeen(animal.id);
      }

      // Play sound
      SoundManager.play('ui.modal_open');
    }
  }, [visible, animal, isUnlocked, progress, markAnimalSeen, scaleAnim, rotateAnim, fadeAnim, sparkleAnim]);

  const handleClose = () => {
    SoundManager.play('ui.modal_close');
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.5,
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

  if (!animal) return null;

  const rarityConfig = RARITY_CONFIG[animal.rarity];
  const stars = RARITY_STARS[animal.rarity];
  const animalImage = ANIMAL_IMAGES[animal.id];

  const rotateY = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

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
            styles.card,
            {
              transform: [
                { scale: scaleAnim },
                { perspective: 1000 },
                { rotateY: isUnlocked ? rotateY : '0deg' },
              ],
              borderColor: isUnlocked ? rarityConfig.color : '#CCC',
            },
          ]}
        >
          {/* Sparkle border effect */}
          {isUnlocked && (
            <Animated.View
              style={[
                styles.sparkleBorder,
                {
                  borderColor: rarityConfig.color,
                  opacity: sparkleOpacity,
                },
              ]}
            />
          )}

          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close-circle" size={40} color={colors.text.tertiary} />
          </Pressable>

          {/* Rarity stars */}
          {isUnlocked && (
            <View style={[styles.rarityBadge, { backgroundColor: rarityConfig.bgColor }]}>
              <View style={styles.starsRow}>
                {Array.from({ length: stars }).map((_, i) => (
                  <Ionicons
                    key={i}
                    name="star"
                    size={16}
                    color={rarityConfig.color}
                    style={styles.starIcon}
                  />
                ))}
              </View>
              <Text style={[styles.rarityLabel, { color: rarityConfig.color }]}>
                {rarityConfig.label}
              </Text>
            </View>
          )}

          {/* Animal art */}
          <View
            style={[
              styles.animalArt,
              { backgroundColor: isUnlocked ? rarityConfig.bgColor : colors.background.tertiary },
            ]}
          >
            {isUnlocked ? (
              <Image
                source={animalImage}
                style={styles.animalImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.lockedArt}>
                <Image
                  source={animalImage}
                  style={[styles.animalImage, styles.lockedImage]}
                  resizeMode="contain"
                />
                <View style={styles.lockIcon}>
                  <Ionicons name="lock-closed" size={32} color={colors.text.tertiary} />
                </View>
              </View>
            )}
          </View>

          {/* Animal name */}
          <Text style={styles.animalName}>
            {isUnlocked ? animal.name : '???'}
          </Text>

          {/* Fun fact */}
          {isUnlocked ? (
            <View style={styles.funFactContainer}>
              <Ionicons name="bulb" size={20} color={colors.accent.secondary} />
              <Text style={styles.funFact}>{animal.funFact}</Text>
            </View>
          ) : (
            <Text style={styles.lockedHint}>
              Earn the "{animal.badgeId.replace(/_/g, ' ')}" badge to unlock!
            </Text>
          )}

          {/* Bear reaction */}
          <View style={styles.bearContainer}>
            <Bear
              state={isUnlocked ? BearState.TAIL_WAG : BearState.THINK}
              size={70}
              interactive={false}
              autoBlink={true}
              soundEnabled={false}
            />
          </View>
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
  card: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 360,
    backgroundColor: colors.background.secondary,
    borderRadius: 28,
    padding: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sparkleBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 30,
    borderWidth: 3,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    marginBottom: spacing.l,
  },
  starsRow: {
    flexDirection: 'row',
    marginRight: 6,
  },
  starIcon: {
    marginHorizontal: 1,
  },
  rarityLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  animalArt: {
    width: 160,
    height: 160,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  animalImage: {
    width: 130,
    height: 130,
  },
  lockedArt: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedImage: {
    opacity: 0.15,
    tintColor: colors.text.tertiary,
  },
  lockIcon: {
    position: 'absolute',
    backgroundColor: colors.background.primary + 'DD',
    borderRadius: radii.circle,
    padding: 8,
  },
  animalName: {
    fontSize: typography.sizes.title,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  funFactContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.tertiary,
    padding: spacing.m,
    borderRadius: radii.m,
    marginBottom: spacing.m,
    width: '100%',
  },
  funFact: {
    flex: 1,
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
    marginLeft: spacing.s,
    lineHeight: 22,
  },
  lockedHint: {
    fontSize: typography.sizes.body,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.m,
    paddingHorizontal: spacing.m,
  },
  bearContainer: {
    marginTop: spacing.s,
  },
});
