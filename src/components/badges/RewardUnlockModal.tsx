/**
 * RewardUnlockModal Component
 *
 * Full-screen celebratory modal for badge/animal unlocks.
 * Features confetti, animations, Bear celebration, and magical reveal.
 * Uses dark theme to match the rest of the app.
 */

import React, { useEffect, useRef, useCallback } from 'react';
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
import { UnlockEvent, RARITY_CONFIG, RARITY_STARS } from '../../types/badges';
import { useCollection } from '../../context/CollectionContext';
import { radii, spacing, typography } from '../../styles/kidTheme';
import { colors } from '../../styles/colors';
import SoundManager from '../../services/SoundManager';
import Bear, { BearState } from '../Bear';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

// Confetti colors
const CONFETTI_COLORS = [
  '#FF6B9D', '#FF8C42', '#845EC2', '#FFC75F', '#FF5E78',
  '#AA96DA', '#FCBAD3', '#A8D8EA', '#FFC93C', '#6BCB77',
];

interface RewardUnlockModalProps {
  visible: boolean;
  onClose: () => void;
  onViewCollection?: () => void;
}

// Confetti particle component
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const startX = Math.random() * SCREEN_WIDTH;
  const endX = startX + (Math.random() - 0.5) * 200;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT + 50,
          duration: 2500 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: endX - startX,
          duration: 2500 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: Math.random() * 10,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(1500),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    animation.start();

    return () => animation.stop();
  }, [delay, translateY, translateX, rotate, opacity, endX, startX]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 10],
    outputRange: ['0deg', '3600deg'],
  });

  const size = 8 + Math.random() * 8;
  const shape = Math.random() > 0.5 ? 'square' : 'circle';

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          left: startX,
          backgroundColor: color,
          width: size,
          height: shape === 'square' ? size : size * 2,
          borderRadius: shape === 'circle' ? size / 2 : 2,
          opacity,
          transform: [
            { translateY },
            { translateX },
            { rotate: rotateInterpolate },
          ],
        },
      ]}
    />
  );
}

export default function RewardUnlockModal({
  visible,
  onClose,
  onViewCollection,
}: RewardUnlockModalProps) {
  const { consumeUnlock, markBadgeSeen, markAnimalSeen } = useCollection();

  const [unlock, setUnlock] = React.useState<UnlockEvent | null>(null);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [animationPhase, setAnimationPhase] = React.useState<'badge' | 'animal' | 'complete'>('badge');

  // Animation refs
  const overlayFade = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const badgeRotate = useRef(new Animated.Value(0)).current;
  const animalSlide = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const animalRotate = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  // Get next unlock when modal becomes visible
  useEffect(() => {
    if (visible) {
      const nextUnlock = consumeUnlock();
      if (nextUnlock) {
        setUnlock(nextUnlock);
        setShowConfetti(true);
        setAnimationPhase('badge');
        startAnimationSequence(nextUnlock);

        // Play celebration sound
        SoundManager.play('rewards.confetti');
      } else {
        onClose();
      }
    } else {
      // Reset state
      setUnlock(null);
      setShowConfetti(false);
      resetAnimations();
    }
  }, [visible]);

  const resetAnimations = useCallback(() => {
    overlayFade.setValue(0);
    badgeScale.setValue(0);
    badgeRotate.setValue(0);
    animalSlide.setValue(SCREEN_WIDTH);
    animalRotate.setValue(0);
    titleFade.setValue(0);
    buttonFade.setValue(0);
  }, [overlayFade, badgeScale, badgeRotate, animalSlide, animalRotate, titleFade, buttonFade]);

  const startAnimationSequence = useCallback((unlockData: UnlockEvent) => {
    resetAnimations();

    // Phase 1: Overlay + Badge reveal (0-800ms)
    Animated.sequence([
      Animated.timing(overlayFade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(badgeScale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 50,
        }),
        Animated.timing(badgeRotate, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Phase 2: Animal slide in (after badge)
      setAnimationPhase('animal');

      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.spring(animalSlide, {
            toValue: 0,
            useNativeDriver: true,
            friction: 7,
            tension: 40,
          }),
          Animated.timing(animalRotate, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Phase 3: Show title and button
        setAnimationPhase('complete');

        Animated.stagger(150, [
          Animated.timing(titleFade, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(buttonFade, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        // Mark as seen
        markBadgeSeen(unlockData.badge.id);
        markAnimalSeen(unlockData.animal.id);
      });
    });
  }, [resetAnimations, overlayFade, badgeScale, badgeRotate, animalSlide, animalRotate, titleFade, buttonFade, markBadgeSeen, markAnimalSeen]);

  const handleClose = useCallback(() => {
    SoundManager.play('ui.tap');

    Animated.timing(overlayFade, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [overlayFade, onClose]);

  const handleViewCollection = useCallback(() => {
    SoundManager.play('ui.tap');
    onViewCollection?.();
    onClose();
  }, [onViewCollection, onClose]);

  if (!unlock) return null;

  const { badge, animal } = unlock;
  const rarityConfig = RARITY_CONFIG[animal.rarity];
  const stars = RARITY_STARS[animal.rarity];
  const animalImage = ANIMAL_IMAGES[animal.id];

  const badgeRotateInterpolate = badgeRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animalRotateInterpolate = animalRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: overlayFade }]}>
        {/* Confetti */}
        {showConfetti && (
          <View style={styles.confettiContainer} pointerEvents="none">
            {Array.from({ length: 50 }).map((_, i) => (
              <ConfettiParticle
                key={i}
                delay={Math.random() * 500}
                color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
              />
            ))}
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Badge reveal */}
          <Animated.View
            style={[
              styles.badgeContainer,
              {
                transform: [
                  { scale: badgeScale },
                  { rotate: badgeRotateInterpolate },
                ],
              },
            ]}
          >
            <View style={styles.badgeInner}>
              <Text style={styles.badgeEmoji}>{badge.icon}</Text>
            </View>
            <Text style={styles.badgeName}>{badge.name}</Text>
          </Animated.View>

          {/* Arrow between badge and animal */}
          {animationPhase !== 'badge' && (
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-down" size={32} color={colors.accent.primary} />
            </View>
          )}

          {/* Animal card reveal */}
          <Animated.View
            style={[
              styles.animalCard,
              {
                borderColor: rarityConfig.color,
                transform: [
                  { translateX: animalSlide },
                  { rotate: animalRotateInterpolate },
                ],
              },
            ]}
          >
            {/* Rarity badge */}
            <View style={[styles.rarityTag, { backgroundColor: rarityConfig.bgColor }]}>
              {Array.from({ length: stars }).map((_, i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={14}
                  color={rarityConfig.color}
                />
              ))}
            </View>

            <View style={[styles.animalArt, { backgroundColor: rarityConfig.bgColor }]}>
              <Image
                source={animalImage}
                style={styles.animalImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.animalName}>{animal.name}</Text>
          </Animated.View>

          {/* Title */}
          <Animated.Text style={[styles.title, { opacity: titleFade }]}>
            New Animal Unlocked!
          </Animated.Text>

          {/* Buttons */}
          <Animated.View style={[styles.buttonsContainer, { opacity: buttonFade }]}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleViewCollection}
            >
              <Text style={styles.primaryButtonText}>View Collection</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
              onPress={handleClose}
            >
              <Text style={styles.secondaryButtonText}>Keep Exploring</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    top: -50,
  },
  content: {
    alignItems: 'center',
    padding: spacing.xl,
    width: '100%',
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  badgeInner: {
    width: 100,
    height: 100,
    borderRadius: radii.xxl,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.accent.primary,
  },
  badgeEmoji: {
    fontSize: 56,
  },
  badgeName: {
    marginTop: spacing.s,
    fontSize: typography.sizes.bodyLarge,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  arrowContainer: {
    marginVertical: spacing.s,
  },
  animalCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.xxl,
    padding: spacing.l,
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: spacing.l,
    minWidth: 200,
  },
  rarityTag: {
    position: 'absolute',
    top: -10,
    right: 16,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    gap: 2,
  },
  animalArt: {
    width: 120,
    height: 120,
    borderRadius: radii.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  animalImage: {
    width: 88,
    height: 88,
  },
  animalName: {
    fontSize: typography.sizes.title,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  title: {
    fontSize: typography.sizes.header,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 280,
    gap: spacing.s,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radii.xl,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  primaryButton: {
    backgroundColor: colors.accent.primary,
  },
  primaryButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.button,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  secondaryButtonPressed: {
    backgroundColor: colors.background.secondary,
  },
  secondaryButtonText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.body,
    fontWeight: '600',
  },
});
