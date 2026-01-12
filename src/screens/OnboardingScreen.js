import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';
import { radii, shadows } from '../styles/kidTheme';
import logger from '../utils/logger';

export default function OnboardingScreen({ navigation }) {
  const { t } = useTranslation();
  const { loginAnonymously } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      await loginAnonymously();
      // Navigation will happen automatically via AuthContext
    } catch (error) {
      logger.error('Guest login error:', error);
      Alert.alert(t('common.error'), t('onboarding.errorGuestLogin'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>{t('onboarding.logo')}</Text>
        <Text style={styles.tagline}>{t('onboarding.tagline')}</Text>
        <Text style={styles.description}>
          {t('onboarding.description')}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{t('onboarding.getStarted')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guestButton}
          onPress={handleGuestLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.tertiary} />
          ) : (
            <Text style={styles.guestButtonText}>{t('onboarding.continueAsGuest')}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.guestNote}>
          {t('onboarding.guestNote')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.accent.primary,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: colors.accent.primary,
    paddingVertical: 16,
    borderRadius: radii.s,
    alignItems: 'center',
    marginBottom: 12,
    ...shadows.medium,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  guestButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: radii.s,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.divider,
    marginBottom: 16,
  },
  guestButtonText: {
    color: colors.text.tertiary,
    fontSize: 16,
    fontWeight: '600',
  },
  guestNote: {
    fontSize: 12,
    color: colors.text.placeholder,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
});
