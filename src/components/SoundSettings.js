/**
 * Sound Settings Component
 *
 * UI component for managing sound preferences.
 * Integrates with SoundContext for persistent settings.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';
import { useSoundSettings } from '../context/SoundContext';
import { colors } from '../styles/colors';

/**
 * Full sound settings panel
 */
export default function SoundSettings() {
  const { t } = useTranslation();
  const {
    soundEnabled,
    masterVolume,
    reduceLoudSounds,
    toggleSound,
    toggleReduceLoudSounds,
    setMasterVolume,
    resetSettings,
  } = useSoundSettings();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('soundSettings.title')}</Text>

      {/* Master Sound Toggle */}
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>{t('soundSettings.soundEffects')}</Text>
          <Text style={styles.settingDescription}>
            {t('soundSettings.soundEffectsDesc')}
          </Text>
        </View>
        <Switch
          value={soundEnabled}
          onValueChange={toggleSound}
          trackColor={{ false: colors.background.tertiary, true: colors.accent.primary }}
          thumbColor={soundEnabled ? colors.text.primary : colors.text.secondary}
        />
      </View>

      {/* Reduce Loud Sounds Toggle */}
      <View style={[styles.settingRow, !soundEnabled && styles.disabled]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, !soundEnabled && styles.disabledText]}>
            {t('soundSettings.reduceLoudSounds')}
          </Text>
          <Text style={[styles.settingDescription, !soundEnabled && styles.disabledText]}>
            {t('soundSettings.reduceLoudSoundsDesc')}
          </Text>
        </View>
        <Switch
          value={reduceLoudSounds}
          onValueChange={toggleReduceLoudSounds}
          disabled={!soundEnabled}
          trackColor={{ false: colors.background.tertiary, true: colors.accent.tertiary }}
          thumbColor={reduceLoudSounds ? colors.text.primary : colors.text.secondary}
        />
      </View>

      {/* Volume Slider */}
      <View style={[styles.volumeContainer, !soundEnabled && styles.disabled]}>
        <View style={styles.volumeHeader}>
          <Text style={[styles.settingLabel, !soundEnabled && styles.disabledText]}>
            {t('soundSettings.masterVolume')}
          </Text>
          <Text style={[styles.volumeValue, !soundEnabled && styles.disabledText]}>
            {Math.round(masterVolume * 100)}%
          </Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={masterVolume}
          onValueChange={setMasterVolume}
          disabled={!soundEnabled}
          minimumTrackTintColor={soundEnabled ? colors.accent.primary : colors.background.tertiary}
          maximumTrackTintColor={colors.background.tertiary}
          thumbTintColor={soundEnabled ? colors.text.primary : colors.text.secondary}
        />
        <View style={styles.volumeLabels}>
          <Text style={[styles.volumeLabelText, !soundEnabled && styles.disabledText]}>
            {t('soundSettings.quiet')}
          </Text>
          <Text style={[styles.volumeLabelText, !soundEnabled && styles.disabledText]}>
            {t('soundSettings.loud')}
          </Text>
        </View>
      </View>

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
        <Text style={styles.resetButtonText}>{t('soundSettings.resetToDefaults')}</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Compact sound toggle for settings list
 */
export function SoundToggle({ label = 'Sound Effects' }) {
  const { soundEnabled, toggleSound } = useSoundSettings();

  return (
    <View style={styles.compactRow}>
      <Text style={styles.compactLabel}>{label}</Text>
      <Switch
        value={soundEnabled}
        onValueChange={toggleSound}
        trackColor={{ false: colors.background.tertiary, true: colors.accent.primary }}
        thumbColor={soundEnabled ? colors.text.primary : colors.text.secondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.text.tertiary,
  },
  volumeContainer: {
    paddingVertical: 16,
  },
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  volumeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  volumeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  volumeLabelText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  resetButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.background.tertiary,
  },
  resetButtonText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  compactLabel: {
    fontSize: 16,
    color: colors.text.primary,
  },
});
