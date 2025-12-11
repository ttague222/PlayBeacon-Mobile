/**
 * EmptyState Component
 *
 * Displays a friendly empty state with Bear the mascot.
 * Use this when lists are empty, searches return no results, etc.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BearMascot, { BEAR_STATES, BearSad, BearThinking, BearSleeping } from './BearMascot';
import { colors } from '../styles/colors';

/**
 * @param {Object} props
 * @param {string} props.title - Main message
 * @param {string} props.subtitle - Secondary message
 * @param {string} props.bearState - Bear emotional state (default: SAD)
 * @param {string} props.actionLabel - Button text (optional)
 * @param {Function} props.onAction - Button callback (optional)
 * @param {number} props.bearSize - Size of Bear (default: 180)
 * @param {Object} props.style - Additional container style
 */
export default function EmptyState({
  title,
  subtitle,
  bearState = BEAR_STATES.SAD,
  actionLabel,
  onAction,
  bearSize = 180,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <BearMascot
        state={bearState}
        size={bearSize}
        interactive={true}
        autoIdle={false}
      />

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
      bearState={BEAR_STATES.THINK}
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
      bearState={BEAR_STATES.SAD}
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
      bearState={BEAR_STATES.BLINK}
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
      bearState={BEAR_STATES.SLEEP}
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
      bearState={BEAR_STATES.SAD}
      actionLabel="Try Again"
      onAction={onRetry}
    />
  );
}

// Loading state with thinking Bear
export function LoadingState({ message }) {
  return (
    <View style={styles.container}>
      <BearMascot
        state={BEAR_STATES.THINK}
        size={150}
        interactive={false}
        autoIdle={false}
      />
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
      bearState={BEAR_STATES.WAVE}
      actionLabel="Get Started"
      onAction={onGetStarted}
      bearSize={200}
    />
  );
}

// No internet connection
export function OfflineState({ onRetry }) {
  return (
    <EmptyState
      title="No connection"
      subtitle="Check your internet and try again"
      bearState={BEAR_STATES.SAD}
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
