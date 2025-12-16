/**
 * EmptyState Component
 *
 * Displays a friendly empty state with icons and messages.
 * Use this when lists are empty, searches return no results, etc.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  return (
    <EmptyState
      title="No games found"
      subtitle="Try a different search term"
      emoji="🔍"
      actionLabel={onRetry ? "Try Again" : undefined}
      onAction={onRetry}
    />
  );
}

// Empty favorites/collections
export function EmptyFavoritesState({ onExplore }) {
  return (
    <EmptyState
      title="No favorites yet"
      subtitle="Start exploring games to save your favorites!"
      emoji="💜"
      actionLabel="Explore Games"
      onAction={onExplore}
    />
  );
}

// Empty collections list
export function EmptyCollectionsState({ onCreate }) {
  return (
    <EmptyState
      title="No collections"
      subtitle="Create your first collection to organize games!"
      emoji="📁"
      actionLabel="Create Collection"
      onAction={onCreate}
    />
  );
}

// Empty queue (no games to show)
export function EmptyQueueState({ onRefresh }) {
  return (
    <EmptyState
      title="All caught up!"
      subtitle="Check back later for new game recommendations"
      emoji="✨"
      actionLabel={onRefresh ? "Refresh" : undefined}
      onAction={onRefresh}
    />
  );
}

// Error state
export function ErrorState({ message, onRetry }) {
  return (
    <EmptyState
      title="Oops!"
      subtitle={message || "Something went wrong. Please try again."}
      emoji="😕"
      actionLabel="Try Again"
      onAction={onRetry}
    />
  );
}

// Loading state
export function LoadingState({ message }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⏳</Text>
      <Text style={styles.loadingText}>{message || "Loading..."}</Text>
    </View>
  );
}

// Welcome state for new users
export function WelcomeState({ onGetStarted }) {
  return (
    <EmptyState
      title="Welcome to PlayBeacon!"
      subtitle="Let's find some awesome Roblox games for you"
      emoji="🎮"
      actionLabel="Get Started"
      onAction={onGetStarted}
    />
  );
}

// No internet connection
export function OfflineState({ onRetry }) {
  return (
    <EmptyState
      title="No connection"
      subtitle="Check your internet and try again"
      emoji="📡"
      actionLabel="Retry"
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
