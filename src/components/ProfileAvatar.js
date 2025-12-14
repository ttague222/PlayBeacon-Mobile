/**
 * ProfileAvatar Component
 *
 * Displays user's selected animal avatar or a default icon.
 * Can be tappable to trigger animal selection.
 */

import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { radii } from '../styles/kidTheme';

// Animal image mapping - must match the animals in the collection system
const ANIMAL_IMAGES = {
  bear: require('../../assets/images/animals/bear.png'),
  fox: require('../../assets/images/animals/fox.png'),
  penguin: require('../../assets/images/animals/penguin.png'),
  owl: require('../../assets/images/animals/owl.png'),
  turtle: require('../../assets/images/animals/turtle.png'),
  raccoon: require('../../assets/images/animals/raccoon.png'),
  cat: require('../../assets/images/animals/cat.png'),
  dog: require('../../assets/images/animals/dog.png'),
  hedgehog: require('../../assets/images/animals/hedgehog.png'),
  parrot: require('../../assets/images/animals/parrot.png'),
  panda: require('../../assets/images/animals/panda.png'),
  lion: require('../../assets/images/animals/lion.png'),
  elephant: require('../../assets/images/animals/elephant.png'),
  dolphin: require('../../assets/images/animals/dolphin.png'),
  koala: require('../../assets/images/animals/koala.png'),
  frog: require('../../assets/images/animals/frog.png'),
};

export default function ProfileAvatar({
  animalId = null,
  size = 64,
  onPress = null,
  showEditBadge = false,
  isGoogleLinked = false,
}) {
  const hasAnimal = animalId && ANIMAL_IMAGES[animalId];
  const imageSize = size * 0.7; // Image takes 70% of container

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const renderContent = () => (
    <View style={[styles.container, containerStyle, hasAnimal && styles.hasAnimalContainer]}>
      {hasAnimal ? (
        <Image
          source={ANIMAL_IMAGES[animalId]}
          style={{ width: imageSize, height: imageSize }}
          resizeMode="contain"
        />
      ) : (
        <Ionicons
          name={isGoogleLinked ? 'person-circle' : 'person-circle-outline'}
          size={size}
          color={isGoogleLinked ? colors.accent.primary : colors.text.tertiary}
        />
      )}

      {/* Edit badge */}
      {showEditBadge && (
        <View style={[styles.editBadge, { right: size * 0.02, bottom: size * 0.02 }]}>
          <Ionicons name="pencil" size={12} color={colors.text.primary} />
        </View>
      )}

      {/* Google verified badge */}
      {isGoogleLinked && !showEditBadge && (
        <View style={[styles.verifiedBadge, { right: 0, bottom: 0 }]}>
          <Ionicons name="checkmark-circle" size={size * 0.3} color={colors.success} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  hasAnimalContainer: {
    backgroundColor: colors.background.tertiary,
  },
  editBadge: {
    position: 'absolute',
    backgroundColor: colors.accent.primary,
    borderRadius: radii.circle,
    padding: 4,
  },
  verifiedBadge: {
    position: 'absolute',
    backgroundColor: colors.background.secondary,
    borderRadius: radii.circle,
  },
});
