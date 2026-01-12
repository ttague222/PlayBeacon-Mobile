/**
 * EmptyState Component
 *
 * Displays a friendly empty state with icons and messages.
 * Use this when lists are empty, searches return no results, etc.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../styles/colors';

/**
 * @param {Object} props
 * @param {string} props.title - Main message
 * @param {string} props.subtitle - Secondary message
 * @param {string} props.emoji - Emoji to display (default: 😢)
 * @param {string} props.actionLabel - Button text (optional)
 * @param {Function} props.onAction - Button callback (optional)
 * @param {Object} props.style - Additional container style
 */
export default function EmptyState({
  title,
  subtitle,
  emoji = '😢',
  actionLabel,
  onAction,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.emoji}>{emoji}</Text>

      <Text style={styles.title}>{title}</Text>

      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}

      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Pre-configured empty state variants
 */

// No search results
export function EmptySearchState({ onRetry }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      title={t('components.emptySearchTitle')}
      subtitle={t('components.emptySearchSubtitle')}
      emoji="🔍"
      actionLabel={onRetry ? t('common.tryAgain') : undefined}
      onAction={onRetry}
    />
  );
}

// Empty favorites/collections
export function EmptyFavoritesState({ onExplore }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      title={t('components.emptyFavoritesTitle')}
      subtitle={t('components.emptyFavoritesSubtitle')}
      emoji="💜"
      actionLabel={t('components.emptyFavoritesButton')}
      onAction={onExplore}
    />
  );
}

// Empty collections list
export function EmptyCollectionsState({ onCreate }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      title={t('components.emptyCollectionsTitle')}
      subtitle={t('components.emptyCollectionsSubtitle')}
      emoji="📁"
      actionLabel={t('collections.createButton')}
      onAction={onCreate}
    />
  );
}

// Empty queue (no games to show)
export function EmptyQueueState({ onRefresh }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      title={t('components.emptyQueueTitle')}
      subtitle={t('components.emptyQueueSubtitle')}
      emoji="✨"
      actionLabel={onRefresh ? t('common.refresh') : undefined}
      onAction={onRefresh}
    />
  );
}

// Error state
export function ErrorState({ message, onRetry }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      title={t('components.errorStateTitle')}
      subtitle={message || t('components.errorStateSubtitle')}
      emoji="😕"
      actionLabel={t('common.tryAgain')}
      onAction={onRetry}
    />
  );
}

// Loading state
export function LoadingState({ message }) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⏳</Text>
      <Text style={styles.loadingText}>{message || t('common.loading')}</Text>
    </View>
  );
}

// Welcome state for new users
export function WelcomeState({ onGetStarted }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      title={t('components.welcomeTitle')}
      subtitle={t('components.welcomeSubtitle')}
      emoji="🎮"
      actionLabel={t('onboarding.getStarted')}
      onAction={onGetStarted}
    />
  );
}

// No internet connection
export function OfflineState({ onRetry }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      title={t('components.offlineStateTitle')}
      subtitle={t('components.offlineStateSubtitle')}
      emoji="📡"
      actionLabel={t('components.offlineStateButton')}
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
  },
  actionButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
  },
});
