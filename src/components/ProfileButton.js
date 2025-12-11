import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { radii } from '../styles/kidTheme';
import SoundManager from '../services/SoundManager';

export default function ProfileButton() {
  const navigation = useNavigation();

  const handlePress = () => {
    SoundManager.play('ui.tap');
    navigation.navigate('Profile');
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="person-circle-outline" size={26} color={colors.text.primary} />
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
});
