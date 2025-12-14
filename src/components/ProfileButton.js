import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { radii } from '../styles/kidTheme';
import SoundManager from '../services/SoundManager';
import { api } from '../services/api';
import logger from '../utils/logger';

// Animal image mapping
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

export default function ProfileButton() {
  const navigation = useNavigation();
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);

  // Fetch user stats to get selected animal
  const fetchSelectedAnimal = async () => {
    try {
      const data = await api.getUserStats();
      if (data.selected_animal_id) {
        setSelectedAnimalId(data.selected_animal_id);
      } else {
        setSelectedAnimalId(null);
      }
    } catch (error) {
      logger.warn('Failed to fetch profile animal:', error);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchSelectedAnimal();
  }, []);

  // Refetch when screen comes into focus (e.g., after changing avatar in ProfileScreen)
  useFocusEffect(
    React.useCallback(() => {
      fetchSelectedAnimal();
    }, [])
  );

  const handlePress = () => {
    SoundManager.play('ui.tap');
    navigation.navigate('Profile');
  };

  const hasAnimal = selectedAnimalId && ANIMAL_IMAGES[selectedAnimalId];

  return (
    <TouchableOpacity
      style={[styles.button, hasAnimal && styles.buttonWithAnimal]}
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {hasAnimal ? (
        <Image
          source={ANIMAL_IMAGES[selectedAnimalId]}
          style={styles.animalImage}
          resizeMode="contain"
        />
      ) : (
        <Ionicons name="person-circle-outline" size={26} color={colors.text.primary} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: radii.l,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWithAnimal: {
    backgroundColor: colors.background.tertiary,
  },
  animalImage: {
    width: 30,
    height: 30,
  },
});
