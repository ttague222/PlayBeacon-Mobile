/**
 * LanguagePickerModal Component
 *
 * Modal for selecting app language.
 * Supports multiple languages with easy extension.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { radii, spacing, typography } from '../styles/kidTheme';
import { LANGUAGES } from '../services/i18n';
import SoundManager from '../services/SoundManager';

export default function LanguagePickerModal({
  visible,
  onClose,
  currentLanguage,
  onSelectLanguage,
}) {
  const { t } = useTranslation();

  const handleSelectLanguage = (langCode) => {
    SoundManager.play('ui.tap');
    onSelectLanguage(langCode);
  };

  const handleClose = () => {
    SoundManager.play('ui.modal_close');
    onClose();
  };

  // Get language display name based on language code
  const getLanguageDisplayName = (langCode) => {
    switch (langCode) {
      case 'en':
        return t('settings.languageEnglish');
      case 'es':
        return t('settings.languageSpanish');
      default:
        return LANGUAGES[langCode]?.name || langCode;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('settings.selectLanguage')}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          {/* Language Options */}
          <View style={styles.optionsContainer}>
            {Object.keys(LANGUAGES).map((langCode) => {
              const isSelected = currentLanguage === langCode;
              return (
                <TouchableOpacity
                  key={langCode}
                  style={[
                    styles.languageOption,
                    isSelected && styles.languageOptionSelected,
                  ]}
                  onPress={() => handleSelectLanguage(langCode)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageInfo}>
                    <Text
                      style={[
                        styles.languageName,
                        isSelected && styles.languageNameSelected,
                      ]}
                    >
                      {getLanguageDisplayName(langCode)}
                    </Text>
                    <Text style={styles.languageNative}>
                      {LANGUAGES[langCode].nativeName}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.accent.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.xl,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: typography.sizes.bodyLarge,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  optionsContainer: {
    padding: spacing.m,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    borderRadius: radii.m,
    marginBottom: spacing.s,
    backgroundColor: colors.background.tertiary,
  },
  languageOptionSelected: {
    backgroundColor: colors.accent.primary + '20',
    borderWidth: 2,
    borderColor: colors.accent.primary,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: typography.sizes.body,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  languageNameSelected: {
    color: colors.accent.primary,
    fontWeight: '600',
  },
  languageNative: {
    fontSize: typography.sizes.caption,
    color: colors.text.tertiary,
  },
});
