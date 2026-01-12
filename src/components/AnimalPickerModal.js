/**
 * AnimalPickerModal Component
 *
 * Modal for selecting an unlocked animal as profile picture.
 * Shows all unlocked animals in a grid with selection indicator.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useCollection } from '../context/CollectionContext';
import { RARITY_CONFIG } from '../types/badges';
import { colors } from '../styles/colors';
import { radii, spacing, typography } from '../styles/kidTheme';
import SoundManager from '../services/SoundManager';
import { api } from '../services/api';
import logger from '../utils/logger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 20;
const GRID_GAP = 12;
const COLUMNS = 3;
const ITEM_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * (COLUMNS - 1)) / COLUMNS;

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

export default function AnimalPickerModal({
  visible,
  onClose,
  selectedAnimalId,
  onSelect,
}) {
  const { t } = useTranslation();
  const { getUnlockedAnimals } = useCollection();
  const [saving, setSaving] = useState(false);
  const [localSelection, setLocalSelection] = useState(selectedAnimalId);

  const unlockedAnimals = getUnlockedAnimals();

  const handleSelect = useCallback((animalId) => {
    SoundManager.play('ui.tap');
    setLocalSelection(animalId);
  }, []);

  const handleSave = useCallback(async () => {
    if (!localSelection) return;

    SoundManager.play('ui.tap');
    setSaving(true);

    try {
      await api.updateProfileAnimal(localSelection);
      SoundManager.play('rewards.achievement');
      onSelect(localSelection);
      onClose();
    } catch (error) {
      logger.error('Failed to update profile animal:', error);
      SoundManager.play('ui.error');
    } finally {
      setSaving(false);
    }
  }, [localSelection, onSelect, onClose]);

  const handleClearSelection = useCallback(async () => {
    SoundManager.play('ui.tap');
    setLocalSelection(null);
    setSaving(true);

    try {
      // Send empty/null to clear the selection
      await api.updateProfileAnimal('none');
      onSelect(null);
      onClose();
    } catch (error) {
      logger.error('Failed to clear profile animal:', error);
    } finally {
      setSaving(false);
    }
  }, [onSelect, onClose]);

  const handleClose = useCallback(() => {
    SoundManager.play('ui.modal_close');
    setLocalSelection(selectedAnimalId); // Reset to original
    onClose();
  }, [selectedAnimalId, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('animalPicker.title')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        {unlockedAnimals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="paw" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>{t('animalPicker.emptyTitle')}</Text>
            <Text style={styles.emptyText}>
              {t('animalPicker.emptyText')}
            </Text>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={false}
            >
              {unlockedAnimals.map((animal) => {
                const isSelected = localSelection === animal.id;
                const rarityConfig = RARITY_CONFIG[animal.rarity];

                return (
                  <TouchableOpacity
                    key={animal.id}
                    style={[
                      styles.animalItem,
                      isSelected && styles.animalItemSelected,
                      { borderColor: isSelected ? rarityConfig.color : 'transparent' },
                    ]}
                    onPress={() => handleSelect(animal.id)}
                    activeOpacity={0.8}
                  >
                    {/* Rarity indicator */}
                    <View style={[styles.rarityDot, { backgroundColor: rarityConfig.color }]} />

                    {/* Animal image */}
                    <View style={[styles.animalImageContainer, { backgroundColor: rarityConfig.bgColor }]}>
                      {ANIMAL_IMAGES[animal.id] ? (
                        <Image
                          source={ANIMAL_IMAGES[animal.id]}
                          style={styles.animalImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <Ionicons name="paw" size={40} color={rarityConfig.color} />
                      )}
                    </View>

                    {/* Animal name */}
                    <Text style={styles.animalName} numberOfLines={1}>
                      {animal.name}
                    </Text>

                    {/* Selection checkmark */}
                    {isSelected && (
                      <View style={[styles.checkmark, { backgroundColor: rarityConfig.color }]}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Footer with Save button */}
            <View style={styles.footer}>
              {selectedAnimalId && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearSelection}
                  disabled={saving}
                >
                  <Text style={styles.clearButtonText}>{t('animalPicker.useDefault')}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!localSelection || localSelection === selectedAnimalId) && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={saving || !localSelection || localSelection === selectedAnimalId}
              >
                {saving ? (
                  <ActivityIndicator color={colors.text.primary} />
                ) : (
                  <Text style={styles.saveButtonText}>{t('animalPicker.save')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: typography.sizes.title,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  placeholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: GRID_PADDING,
    gap: GRID_GAP,
  },
  animalItem: {
    width: ITEM_SIZE,
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.background.secondary,
    borderRadius: radii.l,
    borderWidth: 3,
    position: 'relative',
  },
  animalItemSelected: {
    backgroundColor: colors.background.tertiary,
  },
  rarityDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  animalImageContainer: {
    width: ITEM_SIZE * 0.6,
    height: ITEM_SIZE * 0.6,
    borderRadius: radii.m,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  animalImage: {
    width: ITEM_SIZE * 0.45,
    height: ITEM_SIZE * 0.45,
  },
  animalName: {
    fontSize: typography.sizes.caption,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.sizes.title,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  emptyText: {
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.l,
    paddingBottom: spacing.xxl,
    gap: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  clearButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: radii.m,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  clearButtonText: {
    fontSize: typography.sizes.body,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radii.m,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: typography.sizes.button,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
});
