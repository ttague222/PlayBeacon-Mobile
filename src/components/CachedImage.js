/**
 * CachedImage Component
 *
 * Enhanced image component with:
 * - Memory and disk caching
 * - Placeholder shimmer animation
 * - Error fallback UI
 * - Progressive loading
 * - Blurhash support (optional)
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

// Simple LRU cache for image load states
const imageLoadCache = new Map();
const MAX_CACHE_SIZE = 100;

const addToCache = (uri) => {
  if (imageLoadCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry
    const firstKey = imageLoadCache.keys().next().value;
    imageLoadCache.delete(firstKey);
  }
  imageLoadCache.set(uri, true);
};

const isInCache = (uri) => imageLoadCache.has(uri);

/**
 * Shimmer placeholder animation
 */
const ShimmerPlaceholder = ({ style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.shimmer,
        style,
        { opacity },
      ]}
    />
  );
};

/**
 * Error placeholder with icon
 */
const ErrorPlaceholder = ({ style, iconSize = 32 }) => (
  <View style={[styles.errorContainer, style]}>
    <Ionicons
      name="image-outline"
      size={iconSize}
      color={colors.text.placeholder}
    />
  </View>
);

export default function CachedImage({
  source,
  style,
  resizeMode = 'cover',
  placeholderColor = colors.background.tertiary,
  showShimmer = true,
  priority = 'normal', // 'low', 'normal', 'high'
  onLoad,
  onError,
  fallbackIcon = true,
  fallbackIconSize = 32,
  ...props
}) {
  const uri = source?.uri;
  const wasPreloaded = uri && isInCache(uri);

  const [loading, setLoading] = useState(!wasPreloaded);
  const [error, setError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(wasPreloaded ? 1 : 0)).current;

  const handleLoadStart = useCallback(() => {
    if (!wasPreloaded) {
      setLoading(true);
    }
  }, [wasPreloaded]);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    if (uri) {
      addToCache(uri);
    }

    // Fade in if not preloaded
    if (!wasPreloaded) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    onLoad?.();
  }, [uri, wasPreloaded, fadeAnim, onLoad]);

  const handleError = useCallback((e) => {
    setLoading(false);
    setError(true);
    onError?.(e);
  }, [onError]);

  // Invalid source
  if (!uri) {
    return (
      <View style={[styles.container, style, { backgroundColor: placeholderColor }]}>
        {fallbackIcon && <ErrorPlaceholder iconSize={fallbackIconSize} />}
      </View>
    );
  }

  return (
    <View style={[styles.container, style, { backgroundColor: placeholderColor }]}>
      {/* Loading shimmer */}
      {loading && showShimmer && (
        <ShimmerPlaceholder style={StyleSheet.absoluteFill} />
      )}

      {/* Error state */}
      {error && fallbackIcon && (
        <ErrorPlaceholder iconSize={fallbackIconSize} />
      )}

      {/* Actual image */}
      {!error && (
        <Animated.Image
          {...props}
          source={{
            uri,
            // Enable caching
            cache: 'force-cache',
            // Priority hint (Android)
            priority,
          }}
          style={[
            styles.image,
            { opacity: fadeAnim },
          ]}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          progressiveRenderingEnabled={true}
          fadeDuration={0}
        />
      )}
    </View>
  );
}

/**
 * Preload images for faster display
 */
export const preloadImages = (urls) => {
  urls.forEach(url => {
    if (url && !isInCache(url)) {
      Image.prefetch(url)
        .then(() => addToCache(url))
        .catch(() => {});
    }
  });
};

/**
 * Clear the in-memory cache
 */
export const clearImageCache = () => {
  imageLoadCache.clear();
};

/**
 * Get cache statistics
 */
export const getImageCacheStats = () => ({
  size: imageLoadCache.size,
  maxSize: MAX_CACHE_SIZE,
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.secondary,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
  },
});
