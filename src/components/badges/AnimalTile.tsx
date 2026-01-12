/**
 * AnimalTile Component
 *
 * Displays a single animal collectable in a grid.
 * Shows locked silhouettes and unlocked animals with rarity styling.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Image,
  ImageSourcePropType,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AnimalDefinition, RARITY_CONFIG, RARITY_STARS } from '../../types/badges';
import { useCollection } from '../../context/CollectionContext';
import { colors } from '../../styles/colors';
import { radii } from '../../styles/kidTheme';
import SoundManager from '../../services/SoundManager';
import { TILE_GAP, getTileSize } from './BadgeTile';

interface AnimalTileProps {
  animal: AnimalDefinition;
  onPress?: (animal: AnimalDefinition) => void;
  size?: 'small' | 'medium' | 'large';
}

// Small size is used for horizontal scroll previews
const getSizes = (tileSize: number) => ({
  small: { tile: 100, image: 56, name: 11 },
  medium: { tile: tileSize, image: Math.min(90, tileSize * 0.5), name: 14 },
  large: { tile: 160, image: 100, name: 15 },
});

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

export default function AnimalTile({ animal, onPress, size = 'medium' }: AnimalTileProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const { isAnimalUnlocked, getAnimalProgress } = useCollection();
  const isUnlocked = isAnimalUnlocked(animal.id);
  const progress = getAnimalProgress(animal.id);
  const isNew = isUnlocked && progress && !progress.seen;

  const tileSize = getTileSize(screenWidth);
  const SIZES = getSizes(tileSize);
  const dimensions = SIZES[size];
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const rarityConfig = RARITY_CONFIG[animal.rarity];
  const stars = RARITY_STARS[animal.rarity];

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
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
    onPress?.(animal);
  }, [animal, onPress]);

  const animalImage = ANIMAL_IMAGES[animal.id];

  // For medium size, use the grid-based layout
  const isGridTile = size === 'medium';

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={isGridTile ? { width: tileSize, marginBottom: TILE_GAP } : undefined}
    >
      <Animated.View
        style={[
          styles.container,
          isGridTile ? styles.gridContainer : {
            width: dimensions.tile,
            height: dimensions.tile + 32,
          },
          { transform: [{ scale: scaleAnim }] },
          isUnlocked && {
            borderColor: rarityConfig.color,
            borderWidth: 2,
          },
          isNew && styles.newAnimal,
        ]}
      >
        {/* Rarity indicator */}
        {isUnlocked && (
          <View style={[styles.rarityBanner, { backgroundColor: rarityConfig.bgColor }]}>
            <View style={styles.starsContainer}>
              {Array.from({ length: stars }).map((_, i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={10}
                  color={rarityConfig.color}
                  style={styles.star}
                />
              ))}
            </View>
          </View>
        )}

        {/* Animal display */}
        <View
          style={[
            styles.animalContainer,
            isGridTile ? styles.gridAnimalContainer : {
              width: dimensions.tile - 24,
              height: dimensions.tile - 24,
            },
            isUnlocked
              ? { backgroundColor: rarityConfig.bgColor }
              : styles.lockedContainer,
          ]}
        >
          {isUnlocked ? (
            <Image
              source={animalImage}
              style={{
                width: dimensions.image,
                height: dimensions.image,
              }}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.silhouette}>
              <Image
                source={animalImage}
                style={[
                  styles.silhouetteImage,
                  {
                    width: dimensions.image,
                    height: dimensions.image,
                  },
                ]}
                resizeMode="contain"
              />
              <View style={styles.questionMark}>
                <Ionicons name="help" size={24} color={colors.text.tertiary} />
              </View>
            </View>
          )}

          {/* New indicator */}
          {isNew && (
            <View style={[styles.newIndicator, { backgroundColor: rarityConfig.color }]}>
              <Text style={styles.newText}>{t('animalTile.new')}</Text>
            </View>
          )}
        </View>

        {/* Animal name */}
        <Text
          style={[
            styles.name,
            { fontSize: dimensions.name },
            !isUnlocked && styles.lockedName,
          ]}
          numberOfLines={1}
        >
          {isUnlocked ? animal.name : '???'}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    margin: 6,
    backgroundColor: colors.background.secondary,
  },
  gridContainer: {
    width: '100%',
    aspectRatio: 1,
    margin: 0,
    padding: 16,
  },
  newAnimal: {
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  rarityBanner: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
    zIndex: 10,
    elevation: 10,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    marginHorizontal: 1,
  },
  animalContainer: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gridAnimalContainer: {
    flex: 1,
    width: '100%',
  },
  lockedContainer: {
    backgroundColor: colors.background.tertiary,
  },
  silhouette: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  silhouetteImage: {
    opacity: 0.15,
    tintColor: colors.text.tertiary,
  },
  questionMark: {
    position: 'absolute',
    backgroundColor: colors.background.primary + 'DD',
    borderRadius: radii.circle,
    padding: 4,
  },
  newIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  newText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  name: {
    marginTop: 8,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  lockedName: {
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
});
