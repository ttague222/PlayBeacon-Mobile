import React, { useState } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { colors } from '../styles/colors';

export default function OptimizedImage({
  source,
  style,
  resizeMode = 'cover',
  placeholderColor = colors.background.tertiary,
  ...props
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const handleLoadEnd = () => {
    setLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Placeholder background */}
      <View style={[styles.placeholder, { backgroundColor: placeholderColor }]} />

      {/* Actual image */}
      {!error && source?.uri && (
        <Animated.Image
          {...props}
          source={source}
          style={[
            styles.image,
            style,
            { opacity: fadeAnim }
          ]}
          resizeMode={resizeMode}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          // Enable caching and optimizations
          cache="force-cache"
          progressiveRenderingEnabled={true}
          fadeDuration={0} // We handle fade with Animated
        />
      )}

      {/* Show placeholder if error or no source */}
      {(error || !source?.uri) && (
        <View style={[styles.errorPlaceholder, { backgroundColor: placeholderColor }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.background.tertiary,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  errorPlaceholder: {
    ...StyleSheet.absoluteFillObject,
  },
});
