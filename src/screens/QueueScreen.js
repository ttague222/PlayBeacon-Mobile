import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Linking, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import SoundManager from '../services/SoundManager';
import logger from '../utils/logger';
import CollectionPickerModal from '../components/CollectionPickerModal';
import SkeletonLoader from '../components/SkeletonLoader';
import OptimizedImage from '../components/OptimizedImage';
import ProfileButton from '../components/ProfileButton';
import AnimatedLikeButton from '../components/AnimatedLikeButton';
import AnimatedDislikeButton from '../components/AnimatedDislikeButton';
import DailyBoxScreen from './DailyBoxScreen';
import { PlayBeaconBannerAd } from '../components/ads';
import { useInterstitial } from '../hooks/useInterstitial';
import { useCollection } from '../context/CollectionContext';
import { colors } from '../styles/colors';
import { typography, radii, spacing, shadows } from '../styles/kidTheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function QueueScreen() {
  const [games, setGames] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [dailyBoxModalVisible, setDailyBoxModalVisible] = useState(false);
  const [dailyBoxStatus, setDailyBoxStatus] = useState(null);

  // Interstitial ad hook - shows every 4 game views
  const { showInterstitialIfNeeded } = useInterstitial();

  // Badge collection hook for tracking progress
  const { triggerEvent, checkDailyLogin } = useCollection();

  useEffect(() => {
    loadQueue();
    fetchDailyBoxStatus();
    // Check for daily login badge
    checkDailyLogin();
  }, [checkDailyLogin]);

  const fetchDailyBoxStatus = async () => {
    try {
      const status = await api.getDailyBoxStatus();
      setDailyBoxStatus(status);
    } catch (error) {
      // Silently fail - daily box is optional feature
      logger.log('Failed to fetch daily box status:', error.message);
    }
  };

  const handleDailyBoxClose = () => {
    setDailyBoxModalVisible(false);
    // Refresh status after closing
    fetchDailyBoxStatus();
  };

  const loadQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getQueue(10);
      setGames(data.games || []);

      // Track game views for badges
      if (data.games && data.games.length > 0) {
        triggerEvent('VIEW_GAME', data.games.length);
      }
    } catch (error) {
      logger.error('Error loading queue:', error);
      setError('Failed to load games. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (feedback) => {
    const currentGame = games[currentIndex];
    if (!currentGame || submittingFeedback) return;

    // Play appropriate sound for feedback type
    if (feedback === 1) {
      SoundManager.playEvent('LIKE_GAME');
    } else if (feedback === -1) {
      SoundManager.playEvent('DISLIKE_GAME');
    } else {
      SoundManager.playEvent('SKIP_GAME');
    }

    // Track swipe for badge progress
    triggerEvent('SWIPE_DISCOVERY');

    // Track wishlist add if user liked the game
    if (feedback === 1) {
      triggerEvent('ADD_TO_WISHLIST');
    }

    try {
      setSubmittingFeedback(true);
      await api.submitFeedback(currentGame.universe_id, feedback);

      // Try to show interstitial ad (will only show every 4 views)
      showInterstitialIfNeeded();

      if (currentIndex < games.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        loadQueue();
        setCurrentIndex(0);
      }
    } catch (error) {
      logger.error('Error submitting feedback:', error);
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
      logger.error('Error opening URL:', error);
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
      {/* Header Row */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.headerRight}>
          {/* Daily Box Icon Button */}
          {dailyBoxStatus && (
            <TouchableOpacity
              style={[
                styles.dailyBoxButton,
                dailyBoxStatus.is_available && styles.dailyBoxButtonAvailable,
              ]}
              onPress={() => setDailyBoxModalVisible(true)}
            >
              <Text style={styles.dailyBoxButtonEmoji}>🎁</Text>
              {dailyBoxStatus.is_available && <View style={styles.dailyBoxDot} />}
            </TouchableOpacity>
          )}
          <ProfileButton />
        </View>
      </View>

      {/* Game Card - Full Height with Overlay */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.95}
        onPress={openRobloxGame}
      >
        {/* Background Image */}
        <OptimizedImage
          source={{ uri: currentGame.thumbnail_url }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* Top Actions Overlay */}
        <View style={styles.cardTopOverlay}>
          <View style={styles.genreBadge}>
            <Text style={styles.genreBadgeText}>{currentGame.genre}</Text>
          </View>
          <TouchableOpacity
            style={styles.addToCollectionButton}
            onPress={(e) => {
              e.stopPropagation();
              setCollectionModalVisible(true);
            }}
          >
            <Ionicons name="add" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Bottom Info Overlay with Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {currentGame.title}
            </Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {currentGame.description}
            </Text>
            <View style={styles.cardStats}>
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.statText}>
                  {currentGame.visits >= 1000000
                    ? `${(currentGame.visits / 1000000).toFixed(1)}M`
                    : currentGame.visits >= 1000
                    ? `${(currentGame.visits / 1000).toFixed(0)}K`
                    : currentGame.visits?.toLocaleString()}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="people-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.statText}>
                  {currentGame.active_players >= 1000
                    ? `${(currentGame.active_players / 1000).toFixed(1)}K playing`
                    : `${currentGame.active_players} playing`}
                </Text>
              </View>
            </View>
            <Text style={styles.tapHint}>Tap to play on Roblox</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <AnimatedDislikeButton
          onPress={() => handleFeedback(-1)}
          disabled={submittingFeedback}
          size={64}
          iconSize={32}
        />

        <TouchableOpacity
          style={[styles.actionButton, styles.skipButton]}
          onPress={() => handleFeedback(0)}
          disabled={submittingFeedback}
        >
          <Ionicons name="arrow-forward" size={28} color={colors.text.primary} />
        </TouchableOpacity>

        <AnimatedLikeButton
          onPress={() => handleFeedback(1)}
          disabled={submittingFeedback}
          size={64}
          iconSize={28}
        />
      </View>

      {/* Counter */}
      <Text style={styles.counter}>{currentIndex + 1} / {games.length}</Text>

      {/* Banner Ad */}
      <View style={styles.adContainer}>
        <PlayBeaconBannerAd />
      </View>

      {/* Modals */}
      <CollectionPickerModal
        visible={collectionModalVisible}
        onClose={() => setCollectionModalVisible(false)}
        gameId={currentGame.universe_id}
        gameName={currentGame.title}
      />

      <Modal
        visible={dailyBoxModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleDailyBoxClose}
      >
        <DailyBoxScreen onClose={handleDailyBoxClose} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: typography.sizes.header,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },

  // Daily Box Button (compact in header)
  dailyBoxButton: {
    width: 44,
    height: 44,
    borderRadius: radii.l,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dailyBoxButtonAvailable: {
    backgroundColor: colors.accent.tertiary,
  },
  dailyBoxButtonEmoji: {
    fontSize: 22,
  },
  dailyBoxDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: radii.circle,
    backgroundColor: colors.accent.primary,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },

  // Game Card - Full bleed image with overlays
  card: {
    flex: 1,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardTopOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    zIndex: 10,
  },
  genreBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.l,
  },
  genreBadgeText: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addToCollectionButton: {
    width: 44,
    height: 44,
    borderRadius: radii.l,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 80,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  cardInfo: {
    gap: 8,
  },
  cardTitle: {
    fontSize: typography.sizes.title,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardDescription: {
    fontSize: typography.sizes.small,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  tapHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Action Buttons
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 16,
    marginBottom: 4,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: radii.circle,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
  dislikeButton: {
    backgroundColor: colors.action.dislike,
  },
  skipButton: {
    backgroundColor: colors.action.skip,
    width: 56,
    height: 56,
    borderRadius: radii.xl,
  },
  likeButton: {
    backgroundColor: colors.action.like,
  },
  counter: {
    textAlign: 'center',
    color: colors.text.tertiary,
    marginTop: 8,
    fontSize: 13,
  },

  // Ad Container
  adContainer: {
    alignItems: 'center',
    marginTop: 8,
  },

  // Empty/Error States
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
    borderRadius: radii.s,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
