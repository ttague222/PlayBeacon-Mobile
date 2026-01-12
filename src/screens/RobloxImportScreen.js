import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { colors } from '../styles/colors';
import { radii, shadows } from '../styles/kidTheme';
import { validateRobloxUsername, sanitizeRobloxUsername } from '../utils/validation';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import logger from '../utils/logger';

export default function RobloxImportScreen({ navigation, onImportComplete }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('input'); // 'input', 'loading', 'success'
  const [importResult, setImportResult] = useState(null);

  const handleImport = async () => {
    // Validate username
    const validation = validateRobloxUsername(username);
    if (!validation.valid) {
      Alert.alert(t('robloxImport.errorInvalid'), validation.error);
      return;
    }

    try {
      setLoading(true);
      setStep('loading');

      // Sanitize username before sending to API
      const sanitizedUsername = sanitizeRobloxUsername(username);

      // Step 1: Resolve username to user ID
      const userData = await api.resolveRobloxUsername(sanitizedUsername);

      if (!userData) {
        Alert.alert(t('common.error'), t('robloxImport.errorNotFound'));
        setStep('input');
        return;
      }

      // Step 2: Get import data (favorites + badges)
      const importData = await api.getRobloxImportData(userData.userId);

      // Step 3: Import selected games (for MVP, we auto-import top favorites)
      const gamesToImport = importData.aggregated_games
        .slice(0, 50) // Take top 50 games
        .map(game => ({
          universeId: game.universeId,
          score: game.score,
          source: game.source,
        }));

      if (gamesToImport.length === 0) {
        Alert.alert(
          t('robloxImport.errorNoGames'),
          t('robloxImport.errorNoGamesMsg')
        );
        setStep('input');
        return;
      }

      // Step 4: Send import request to backend
      const result = await api.importRobloxGames({
        robloxUsername: userData.username,
        robloxUserId: userData.userId,
        selectedGames: gamesToImport,
      });

      setImportResult({
        gamesImported: result.games_imported,
        username: userData.username,
      });
      setStep('success');
    } catch (error) {
      logger.error('Import error:', error);
      Alert.alert(t('robloxImport.errorImportFailed'), t('robloxImport.errorImportFailedMsg'));
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setLoading(true);

      // Ensure user is authenticated before making the API call
      const currentUser = auth.currentUser;
      if (!currentUser) {
        logger.error('No authenticated user found');
        Alert.alert(t('robloxImport.errorAuth'), t('robloxImport.errorAuthMsg'));
        return;
      }

      // Force refresh the token to ensure it's valid
      await currentUser.getIdToken(true);

      await api.skipRobloxImport();
      // Trigger AppNavigator re-render to show Main tabs
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      logger.error('Error skipping import:', error);
      Alert.alert(
        t('robloxImport.errorConnection'),
        t('robloxImport.errorConnectionMsg'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // Trigger AppNavigator re-render to show Main tabs
    if (onImportComplete) {
      onImportComplete();
    }
  };

  if (step === 'loading') {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={styles.loadingText}>{t('robloxImport.loadingText')}</Text>
        <Text style={styles.loadingSubtext}>{t('robloxImport.loadingSubtext')}</Text>
      </View>
    );
  }

  if (step === 'success') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>{t('robloxImport.successTitle')}</Text>
          <Text style={styles.successMessage}>
            {t('robloxImport.successMessage', { count: importResult.gamesImported, username: importResult.username })}
          </Text>
          <Text style={styles.successSubtext}>
            {t('robloxImport.successSubtext')}
          </Text>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>{t('robloxImport.buttonContinue')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('robloxImport.title')}</Text>
        <Text style={styles.description}>
          {t('robloxImport.description')}
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('robloxImport.labelUsername')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('robloxImport.placeholderUsername')}
            placeholderTextColor="#666"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.importButton, loading && styles.importButtonDisabled]}
          onPress={handleImport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.importButtonText}>{t('robloxImport.buttonImport')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>{t('robloxImport.buttonSkip')}</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{t('robloxImport.infoTitle')}</Text>
          <Text style={styles.infoText}>• {t('robloxImport.infoFavorites')}</Text>
          <Text style={styles.infoText}>• {t('robloxImport.infoBadges')}</Text>
          <Text style={styles.infoText}>• {t('robloxImport.infoSecurity')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radii.s,
    fontSize: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  importButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: 16,
    borderRadius: radii.s,
    alignItems: 'center',
    marginBottom: 16,
    ...shadows.medium,
  },
  importButtonDisabled: {
    opacity: 0.6,
  },
  importButtonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  skipButtonText: {
    color: colors.text.tertiary,
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: colors.background.secondary,
    padding: 20,
    borderRadius: radii.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 6,
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 18,
    color: colors.text.primary,
    marginTop: 20,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 8,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    fontSize: 80,
    color: colors.success,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  successSubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: radii.s,
    minWidth: 200,
    alignItems: 'center',
    ...shadows.medium,
  },
  continueButtonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});
