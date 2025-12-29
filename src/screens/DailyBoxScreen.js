import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
  Linking,
  useWindowDimensions,
} from 'react-native';

const HORIZONTAL_PADDING = 20;
const MAX_CONTENT_WIDTH = 500; // Maximum width for content on tablets
import { api } from '../services/api';
import OptimizedImage from '../components/OptimizedImage';
import CollectionPickerModal from '../components/CollectionPickerModal';
import { useRewarded } from '../hooks/useRewarded';
import { useCollection } from '../context/CollectionContext';
import SoundManager from '../services/SoundManager';
import { colors } from '../styles/colors';
import logger from '../utils/logger';
import { radii } from '../styles/kidTheme';

export default function DailyBoxScreen({ onClose }) {
  const { width: screenWidth } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [opening, setOpening] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [revealedGame, setRevealedGame] = useState(null);
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [newAchievements, setNewAchievements] = useState([]);
  const [bonusBoxUsed, setBonusBoxUsed] = useState(false);

  // Calculate responsive content width
  const contentWidth = Math.min(screenWidth - (HORIZONTAL_PADDING * 2), MAX_CONTENT_WIDTH);

  // Rewarded ad hook for bonus box
  const { isLoaded: rewardedAdLoaded, showRewardedAd, adsAvailable, isLoading: adIsLoading, loadError: adLoadError, loadAd } = useRewarded();

  // Badge collection hook for daily login and mystery box tracking
  const { checkDailyLogin, triggerEvent } = useCollection();

  // Animation values
  const boxScale = useRef(new Animated.Value(1)).current;
  const boxRotate = useRef(new Animated.Value(0)).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;
  const revealScale = useRef(new Animated.Value(0.5)).current;
  const sparkleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await api.getDailyBoxStatus();
      setStatus(data);

      // If already opened today, show the game
      if (!data.is_available && data.todays_game) {
        setRevealedGame(data.todays_game);
        setRevealed(true);
        revealOpacity.setValue(1);
        revealScale.setValue(1);
      }
    } catch (error) {
      logger.error('Failed to fetch daily box status:', error);
      Alert.alert('Error', 'Failed to load daily mystery box');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBox = async () => {
    if (opening || !status?.is_available) return;

    setOpening(true);

    // Start box shake animation
    const shakeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(boxRotate, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(boxRotate, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(boxRotate, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 6 }
    );

    const scaleAnimation = Animated.sequence([
      Animated.timing(boxScale, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(boxScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]);

    // Run shake while calling API
    shakeAnimation.start();

    // Play opening sound when box starts shaking
    SoundManager.play('ui.tap');

    try {
      const result = await api.openDailyBox();

      // Track mystery box opening for badges
      triggerEvent('OPEN_MYSTERY_BOX');

      // Check daily login for badge progress
      checkDailyLogin();

      shakeAnimation.stop();
      scaleAnimation.start();

      // Sparkle effect
      Animated.sequence([
        Animated.timing(sparkleOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Wait for box to disappear, then reveal game
      setTimeout(() => {
        // Play reveal sound (confetti for the exciting reveal!)
        SoundManager.play('rewards.confetti');

        setRevealedGame(result.game);
        setXpGained(result.xp_gained);
        setNewAchievements(result.new_achievements || []);
        setRevealed(true);

        // Animate reveal
        Animated.parallel([
          Animated.spring(revealScale, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(revealOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 500);

    } catch (error) {
      shakeAnimation.stop();
      boxScale.setValue(1);
      boxRotate.setValue(0);
      logger.error('Failed to open daily box:', error);
      Alert.alert('Error', 'Failed to open mystery box. Please try again.');
    } finally {
      setOpening(false);
    }
  };

  const openRobloxGame = async () => {
    if (!revealedGame?.root_place_id) return;

    const url = `https://www.roblox.com/games/${revealedGame.root_place_id}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      logger.error('Error opening URL:', error);
    }
  };

  const formatTimeUntilAvailable = () => {
    if (!status?.next_available_at) return '';

    const next = new Date(status.next_available_at);
    const now = new Date();
    const diff = next - now;

    if (diff <= 0) return 'Available now!';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m until next box`;
    }
    return `${minutes}m until next box`;
  };

  const handleBonusBox = async () => {
    if (!rewardedAdLoaded || bonusBoxUsed) return;

    try {
      await showRewardedAd(() => {
        // User completed the rewarded ad - give them a bonus box
        setBonusBoxUsed(true);
        openBonusBox();
      });
    } catch (error) {
      logger.log('Rewarded ad not available:', error.message);
      Alert.alert('Ad Not Ready', 'Please try again in a moment.');
    }
  };

  const openBonusBox = async () => {
    setOpening(true);
    setRevealed(false);

    // Reset animations
    boxScale.setValue(1);
    boxRotate.setValue(0);
    revealOpacity.setValue(0);
    revealScale.setValue(0.5);

    // Start box shake animation
    const shakeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(boxRotate, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(boxRotate, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(boxRotate, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 6 }
    );

    const scaleAnimation = Animated.sequence([
      Animated.timing(boxScale, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(boxScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]);

    shakeAnimation.start();

    // Play opening sound when box starts shaking
    SoundManager.play('ui.tap');

    try {
      // Get a random game from queue for bonus box
      const queueData = await api.getQueue(1);
      const bonusGame = queueData.games?.[0];

      if (!bonusGame) {
        throw new Error('No games available');
      }

      // Track bonus mystery box opening for badges
      triggerEvent('OPEN_MYSTERY_BOX');

      shakeAnimation.stop();
      scaleAnimation.start();

      // Sparkle effect
      Animated.sequence([
        Animated.timing(sparkleOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        // Play reveal sound (confetti for the exciting reveal!)
        SoundManager.play('rewards.confetti');

        setRevealedGame(bonusGame);
        setXpGained(5); // Bonus XP for watching ad
        setNewAchievements([]);
        setRevealed(true);

        Animated.parallel([
          Animated.spring(revealScale, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(revealOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 500);

    } catch (error) {
      shakeAnimation.stop();
      boxScale.setValue(1);
      boxRotate.setValue(0);
      logger.error('Failed to open bonus box:', error);
      Alert.alert('Error', 'Failed to open bonus box. Please try again.');
    } finally {
      setOpening(false);
    }
  };

  const boxRotateInterpolate = boxRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => {
        SoundManager.play('ui.modal_close');
        onClose();
      }}>
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Daily Mystery Box</Text>
      <Text style={styles.subtitle}>
        {revealed
          ? "Here's your mystery game!"
          : status?.is_available
            ? "Tap to reveal today's mystery game!"
            : "Come back tomorrow for a new mystery!"}
      </Text>

      {!revealed ? (
        <View style={styles.boxContainer}>
          {/* Sparkle overlay */}
          <Animated.View style={[styles.sparkleOverlay, { opacity: sparkleOpacity }]}>
            <Text style={styles.sparkles}>✨</Text>
          </Animated.View>

          <TouchableOpacity
            activeOpacity={status?.is_available ? 0.8 : 1}
            onPress={handleOpenBox}
            disabled={!status?.is_available || opening}
          >
            <Animated.View
              style={[
                styles.mysteryBox,
                !status?.is_available && styles.mysteryBoxDisabled,
                {
                  transform: [
                    { scale: boxScale },
                    { rotate: boxRotateInterpolate },
                  ],
                },
              ]}
            >
              <Text style={styles.boxEmoji}>🎁</Text>
              {opening && (
                <ActivityIndicator
                  style={styles.boxLoading}
                  color={colors.text.primary}
                />
              )}
            </Animated.View>
          </TouchableOpacity>

          {!status?.is_available && (
            <Text style={styles.cooldownText}>{formatTimeUntilAvailable()}</Text>
          )}
        </View>
      ) : (
        <Animated.View
          style={[
            styles.revealContainer,
            {
              opacity: revealOpacity,
              transform: [{ scale: revealScale }],
            },
          ]}
        >
          {xpGained > 0 && (
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+{xpGained} XP</Text>
            </View>
          )}

          <TouchableOpacity activeOpacity={0.8} onPress={openRobloxGame}>
            {revealedGame?.thumbnail_url ? (
              <OptimizedImage
                source={{ uri: revealedGame.thumbnail_url }}
                style={[styles.gameImage, { width: contentWidth }]}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.gameImage, styles.placeholderImage, { width: contentWidth }]}>
                <Text style={styles.placeholderEmoji}>🎮</Text>
                <Text style={styles.placeholderText}>Tap to Play!</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={[styles.gameInfo, { width: contentWidth }]}>
            <Text style={styles.gameTitle}>{revealedGame?.title}</Text>
            {revealedGame?.genre && (
              <Text style={styles.gameGenre}>{revealedGame.genre}</Text>
            )}
            {revealedGame?.description && (
              <Text style={styles.gameDescription} numberOfLines={3}>
                {revealedGame.description}
              </Text>
            )}
            <Text style={styles.gameStats}>
              {revealedGame?.visits?.toLocaleString()} visits • {revealedGame?.active_players} playing
            </Text>
          </View>

          <View style={[styles.actionButtons, { width: contentWidth }]}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={openRobloxGame}
            >
              <Text style={styles.playButtonText}>Play Game</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setCollectionModalVisible(true)}
            >
              <Text style={styles.saveButtonText}>Save to Collection</Text>
            </TouchableOpacity>
          </View>

          {newAchievements.length > 0 && (
            <View style={[styles.achievementBanner, { width: contentWidth }]}>
              <Text style={styles.achievementTitle}>Achievement Unlocked!</Text>
              {newAchievements.map((ach, index) => (
                <Text key={index} style={styles.achievementName}>
                  🏆 {ach.title}
                </Text>
              ))}
            </View>
          )}

          {/* Bonus Box - Watch ad for another game */}
          {adsAvailable && !bonusBoxUsed && (
            <TouchableOpacity
              style={[styles.bonusBoxButton, { width: contentWidth }, !rewardedAdLoaded && styles.bonusBoxButtonDisabled]}
              onPress={rewardedAdLoaded ? handleBonusBox : (adLoadError ? loadAd : undefined)}
              disabled={adIsLoading}
            >
              <Text style={styles.bonusBoxEmoji}>🎬</Text>
              <View style={styles.bonusBoxTextContainer}>
                <Text style={styles.bonusBoxTitle}>Bonus Mystery Box</Text>
                <Text style={styles.bonusBoxSubtitle}>
                  {rewardedAdLoaded
                    ? 'Watch a short video for another game!'
                    : adLoadError
                      ? 'Tap to retry loading ad'
                      : adIsLoading
                        ? 'Loading ad...'
                        : 'Preparing...'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      <CollectionPickerModal
        visible={collectionModalVisible}
        onClose={() => setCollectionModalVisible(false)}
        gameId={revealedGame?.universe_id}
        gameName={revealedGame?.title}
      />
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
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: radii.l,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 28,
    color: colors.text.primary,
    fontWeight: '300',
    marginTop: -2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  boxContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mysteryBox: {
    width: 180,
    height: 180,
    backgroundColor: colors.accent.secondary,
    borderRadius: radii.xl,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  mysteryBoxDisabled: {
    backgroundColor: colors.background.tertiary,
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  boxEmoji: {
    fontSize: 80,
  },
  boxLoading: {
    position: 'absolute',
    bottom: 20,
  },
  sparkleOverlay: {
    position: 'absolute',
    zIndex: 10,
  },
  sparkles: {
    fontSize: 100,
  },
  cooldownText: {
    marginTop: 24,
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  revealContainer: {
    flex: 1,
    alignItems: 'center',
  },
  xpBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.l,
    marginBottom: 16,
  },
  xpText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.background.primary,
  },
  gameImage: {
    height: 200,
    borderRadius: radii.m,
    backgroundColor: colors.background.tertiary,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.accent.primary,
    borderStyle: 'dashed',
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  gameInfo: {
    paddingVertical: 16,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  gameGenre: {
    fontSize: 14,
    color: colors.accent.primary,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 8,
  },
  gameDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  gameStats: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  actionButtons: {
    gap: 12,
  },
  playButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: 14,
    borderRadius: radii.s,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  saveButton: {
    backgroundColor: colors.background.secondary,
    paddingVertical: 14,
    borderRadius: radii.s,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  achievementBanner: {
    marginTop: 20,
    backgroundColor: colors.accent.tertiary,
    padding: 16,
    borderRadius: radii.s,
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  achievementName: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  bonusBoxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.tertiary,
    borderRadius: radii.s,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  bonusBoxButtonDisabled: {
    opacity: 0.5,
    borderColor: colors.border,
  },
  bonusBoxEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  bonusBoxTextContainer: {
    flex: 1,
  },
  bonusBoxTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  bonusBoxSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
