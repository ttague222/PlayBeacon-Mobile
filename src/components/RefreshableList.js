/**
 * RefreshableList Component
 *
 * A FlatList wrapper with pull-to-refresh functionality
 * and kid-friendly loading indicators.
 */

import React, { useState, useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../styles/colors';
import { useNetwork } from '../context/NetworkContext';

/**
 * Custom refresh control with kid-friendly styling
 */
const KidRefreshControl = ({ refreshing, onRefresh, tintColor, title }) => (
  <RefreshControl
    refreshing={refreshing}
    onRefresh={onRefresh}
    tintColor={tintColor || colors.accent.primary}
    colors={[colors.accent.primary, colors.accent.secondary]}
    progressBackgroundColor={colors.background.secondary}
    title={title}
    titleColor={colors.text.secondary}
  />
);

/**
 * Empty list component
 */
const DefaultEmptyComponent = ({ message, isOffline }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyEmoji}>{isOffline ? '📶' : '🐻'}</Text>
    <Text style={styles.emptyText}>
      {isOffline ? "Can't load while offline" : message || 'Nothing here yet!'}
    </Text>
  </View>
);

/**
 * Footer loading indicator
 */
const FooterLoadingIndicator = ({ loading }) => {
  if (!loading) return null;

  return (
    <View style={styles.footerLoader}>
      <ActivityIndicator size="small" color={colors.accent.primary} />
      <Text style={styles.footerText}>Loading more...</Text>
    </View>
  );
};

export default function RefreshableList({
  data,
  renderItem,
  keyExtractor,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing = false,
  loadingMore = false,
  emptyMessage,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  refreshTitle,
  numColumns,
  columnWrapperStyle,
  ...props
}) {
  const { isOffline } = useNetwork();
  const [internalRefreshing, setInternalRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (isOffline) return;

    setInternalRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setInternalRefreshing(false);
    }
  }, [onRefresh, isOffline]);

  const handleEndReached = useCallback(() => {
    if (isOffline || loadingMore) return;
    onEndReached?.();
  }, [onEndReached, isOffline, loadingMore]);

  const isRefreshing = refreshing || internalRefreshing;

  // Default empty component with offline awareness
  const EmptyComponent = ListEmptyComponent || (
    <DefaultEmptyComponent message={emptyMessage} isOffline={isOffline} />
  );

  // Footer with loading indicator
  const Footer = ListFooterComponent || <FooterLoadingIndicator loading={loadingMore} />;

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      refreshControl={
        onRefresh && (
          <KidRefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            title={refreshTitle || (isOffline ? "You're offline" : 'Pull to refresh')}
          />
        )
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListEmptyComponent={EmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={Footer}
      contentContainerStyle={[
        data?.length === 0 && styles.emptyContentContainer,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      numColumns={numColumns}
      columnWrapperStyle={columnWrapperStyle}
      {...props}
    />
  );
}

/**
 * Simple scroll view with pull-to-refresh
 */
export function RefreshableScrollView({
  children,
  onRefresh,
  refreshing = false,
  refreshTitle,
  style,
  contentContainerStyle,
  ...props
}) {
  const { isOffline } = useNetwork();
  const [internalRefreshing, setInternalRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (isOffline) return;

    setInternalRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setInternalRefreshing(false);
    }
  }, [onRefresh, isOffline]);

  const isRefreshing = refreshing || internalRefreshing;

  // Import ScrollView inline to avoid circular deps
  const { ScrollView } = require('react-native');

  return (
    <ScrollView
      style={style}
      contentContainerStyle={contentContainerStyle}
      refreshControl={
        onRefresh && (
          <KidRefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            title={refreshTitle || (isOffline ? "You're offline" : 'Pull to refresh')}
          />
        )
      }
      {...props}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
});
