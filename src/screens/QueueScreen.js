import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { api } from '../services/api';
import CollectionPickerModal from '../components/CollectionPickerModal';
import SkeletonLoader from '../components/SkeletonLoader';
import OptimizedImage from '../components/OptimizedImage';
import { PlayBeaconBannerAd } from '../components/ads';
import { colors } from '../styles/colors';

export default function QueueScreen() {
  const [games, setGames] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getQueue(10);
      setGames(data.games || []);

      // Track game views for achievements
      if (data.games && data.games.length > 0) {
        try {
          await api.incrementGamesViewed();
        } catch (trackError) {
          // Silently fail - don't block game loading
          console.log('Game view tracking failed:', trackError.message);
        }
      }
    } catch (error) {
      console.error('Error loading queue:', error);
      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'Failed to load games. Please check your connection.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (feedback) => {
    const currentGame = games[currentIndex];
    if (!currentGame || submittingFeedback) return;

    try {
      setSubmittingFeedback(true);
      await api.submitFeedback(currentGame.universe_id, feedback);

      if (currentIndex < games.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        loadQueue();
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert(
        'Error',
        'Failed to submit feedback. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const openRobloxGame = async () => {
    const currentGame = games[currentIndex];
    if (!currentGame || !currentGame.root_place_id) return;

    const url = `https://www.roblox.com/games/${currentGame.root_place_id}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open Roblox game link');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Failed to open game');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SkeletonLoader variant="queue" count={1} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={loadQueue}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentGame = games[currentIndex];

  if (!currentGame) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No games in queue</Text>
        <TouchableOpacity style={styles.button} onPress={loadQueue}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity activeOpacity={0.8} onPress={openRobloxGame}>
          <OptimizedImage
            source={{ uri: currentGame.thumbnail_url }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addToCollectionButton}
          onPress={() => setCollectionModalVisible(true)}
        >
          <Text style={styles.addToCollectionIcon}>+</Text>
        </TouchableOpacity>
        <View style={styles.info}>
          <Text style={styles.title}>{currentGame.title}</Text>
          <Text style={styles.genre}>{currentGame.genre}</Text>
          <Text style={styles.description} numberOfLines={3}>
            {currentGame.description}
          </Text>
          <Text style={styles.stats}>
            {currentGame.visits?.toLocaleString()} visits • {currentGame.active_players} playing
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={() => handleFeedback(-1)}
        >
          <Text style={styles.actionText}>✗</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.skipButton]}
          onPress={() => handleFeedback(0)}
        >
          <Text style={styles.actionText}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleFeedback(1)}
        >
          <Text style={styles.actionText}>✓</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.counter}>{currentIndex + 1} / {games.length}</Text>

      <CollectionPickerModal
        visible={collectionModalVisible}
        onClose={() => setCollectionModalVisible(false)}
        gameId={currentGame.universe_id}
        gameName={currentGame.title}
      />

      {/* Banner Ad at bottom */}
      <View style={styles.adContainer}>
        <PlayBeaconBannerAd />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: 20,
    paddingTop: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  card: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: colors.background.tertiary,
  },
  info: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  genre: {
    fontSize: 14,
    color: colors.accent.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  stats: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  dislikeButton: {
    backgroundColor: colors.action.dislike,
  },
  skipButton: {
    backgroundColor: colors.action.skip,
  },
  likeButton: {
    backgroundColor: colors.action.like,
  },
  actionText: {
    fontSize: 38,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  counter: {
    textAlign: 'center',
    color: colors.text.tertiary,
    marginTop: 12,
    fontSize: 14,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text.tertiary,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  addToCollectionButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.action.info,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addToCollectionIcon: {
    fontSize: 28,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  adContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
});
