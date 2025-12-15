/**
 * Profile Screen
 *
 * COPPA-compliant profile management:
 * - Shows account status (anonymous or Google-linked)
 * - Parent-gated Google sign-in option for data sync
 * - Premium/ad-free status
 * - Roblox account linking
 * - User stats and history
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import SoundManager from '../services/SoundManager';
import { usePremium } from '../context/PremiumContext';
import ParentalGate from '../components/ParentalGate';
import ProfileAvatar from '../components/ProfileAvatar';
import AnimalPickerModal from '../components/AnimalPickerModal';
import { api } from '../services/api';
import { colors } from '../styles/colors';
import { typography, radii } from '../styles/kidTheme';
import { validateRobloxUsername, sanitizeRobloxUsername } from '../utils/validation';
import { clearAllLocalData } from '../utils/resetApp';
import logger from '../utils/logger';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const {
    user,
    logout,
    linkWithGoogle,
    disconnectGoogle,
    isLinkingAccount,
    getAccountStatus,
  } = useAuth();
  const { isPremium, restorePurchases } = usePremium();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyType, setHistoryType] = useState('liked');
  const [historyGames, setHistoryGames] = useState([]);
  const [robloxModalVisible, setRobloxModalVisible] = useState(false);
  const [robloxUsername, setRobloxUsername] = useState('');
  const [linkingRoblox, setLinkingRoblox] = useState(false);

  // Parental gate state
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Animal picker state
  const [animalPickerVisible, setAnimalPickerVisible] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);

  const accountStatus = getAccountStatus();
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUserStats();
      setStats(data);
      // Set selected animal from user stats
      if (data.selected_animal_id) {
        setSelectedAnimalId(data.selected_animal_id);
      }
    } catch (error) {
      logger.error('Failed to fetch user stats:', error);
      setError('Failed to load profile data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarPress = useCallback(() => {
    SoundManager.play('ui.tap');
    SoundManager.play('ui.modal_open');
    setAnimalPickerVisible(true);
  }, []);

  const handleAnimalSelect = useCallback((animalId) => {
    setSelectedAnimalId(animalId === 'none' ? null : animalId);
  }, []);

  const handleViewHistory = async (type) => {
    SoundManager.play('ui.tap');
    try {
      setHistoryType(type);
      const data = await api.getUserFeedback(type);
      setHistoryGames(data.games);
      SoundManager.play('ui.modal_open');
      setHistoryModalVisible(true);
    } catch (error) {
      logger.error('Failed to load history:', error);
      Alert.alert('Error', 'Failed to load rating history. Please try again.');
    }
  };

  const handleResetProfile = () => {
    SoundManager.play('ui.tap');
    Alert.alert(
      'Reset Recommendations',
      'This will clear all your ratings and reset your recommendations. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setResetting(true);
              await api.resetProfile();
              await fetchUserStats();
              Alert.alert('Success', 'Your recommendations have been reset');
            } catch (error) {
              logger.error('Failed to reset profile:', error);
              Alert.alert('Error', 'Failed to reset profile. Please try again.');
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    SoundManager.play('ui.tap');
    Alert.alert(
      'Start Fresh',
      'This will completely reset the app - clearing all progress, badges, settings, and starting from the tutorial. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Fresh',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all local data (badges, tutorial, age verification, etc.)
              await clearAllLocalData();
              // Sign out and create new anonymous account
              await logout();
              // The app will restart at age verification/tutorial
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    SoundManager.play('ui.tap');
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data including ratings, collections, and preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // Second confirmation for destructive action
            Alert.alert(
              'Are you absolutely sure?',
              'All your data will be permanently deleted. This cannot be recovered.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setResetting(true);
                      // Delete account from server (Firestore + Firebase Auth)
                      await api.deleteAccount();
                      // Clear all local data
                      await clearAllLocalData();
                      // Sign out (this will trigger new anonymous account creation)
                      await logout();
                      // The app will restart at age verification/tutorial
                    } catch (error) {
                      logger.error('Failed to delete account:', error);
                      Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
                    } finally {
                      setResetting(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Parent-gated actions
  const handleGoogleSignInPress = () => {
    SoundManager.play('ui.tap');
    setPendingAction('link_google');
    setShowParentalGate(true);
  };

  const handleDisconnectGooglePress = () => {
    SoundManager.play('ui.tap');
    setPendingAction('disconnect_google');
    setShowParentalGate(true);
  };

  const handleRestorePurchasesPress = () => {
    SoundManager.play('ui.tap');
    setPendingAction('restore_purchases');
    setShowParentalGate(true);
  };

  const handleParentalGatePass = async () => {
    setShowParentalGate(false);

    if (pendingAction === 'link_google') {
      try {
        const result = await linkWithGoogle();
        if (result.success) {
          if (result.merged) {
            Alert.alert(
              'Account Synced',
              'Your data has been merged with your existing Google account.'
            );
          } else {
            Alert.alert(
              'Success',
              'Your account is now linked to Google. Your data will sync across devices.'
            );
          }
          await fetchUserStats();
        }
      } catch (error) {
        logger.error('Link error:', error);
        // Don't show error to child - just silently fail
      }
    } else if (pendingAction === 'disconnect_google') {
      try {
        await disconnectGoogle();
        Alert.alert(
          'Disconnected',
          'Your Google account has been disconnected. A new anonymous account has been created.'
        );
      } catch (error) {
        logger.error('Disconnect error:', error);
      }
    } else if (pendingAction === 'restore_purchases') {
      await restorePurchases();
    }

    setPendingAction(null);
  };

  const handleParentalGateCancel = () => {
    setShowParentalGate(false);
    setPendingAction(null);
  };

  const handleLinkRoblox = async () => {
    SoundManager.play('ui.tap');
    const validation = validateRobloxUsername(robloxUsername);
    if (!validation.valid) {
      Alert.alert('Invalid Username', validation.error);
      return;
    }

    try {
      setLinkingRoblox(true);
      const sanitizedUsername = sanitizeRobloxUsername(robloxUsername);

      const userData = await api.resolveRobloxUsername(sanitizedUsername);
      if (!userData) {
        Alert.alert(
          'Error',
          'Roblox user not found. Please check the username and try again.'
        );
        return;
      }

      const importData = await api.getRobloxImportData(userData.userId);

      const gamesToImport = importData.aggregated_games
        .slice(0, 50)
        .map((game) => ({
          universeId: game.universeId,
          score: game.score,
          source: game.source,
        }));

      const result = await api.importRobloxGames({
        robloxUsername: userData.username,
        robloxUserId: userData.userId,
        selectedGames: gamesToImport,
      });

      setRobloxModalVisible(false);
      setRobloxUsername('');
      await fetchUserStats();

      Alert.alert(
        'Success!',
        `Linked Roblox account "${userData.username}" and imported ${result.games_imported} games!`
      );
    } catch (error) {
      logger.error('Roblox link error:', error);
      Alert.alert('Link Failed', 'Failed to link Roblox account. Please try again.');
    } finally {
      setLinkingRoblox(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => {
          SoundManager.play('ui.tap');
          fetchUserStats();
        }}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Profile</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            SoundManager.play('ui.tap');
            navigation.goBack();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Profile Header Card - Account + Roblox combined */}
      <View style={styles.profileCard}>
        {/* Account Avatar & Info */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <ProfileAvatar
              animalId={selectedAnimalId}
              size={64}
              onPress={handleAvatarPress}
              showEditBadge={true}
              isGoogleLinked={accountStatus.type === 'google'}
            />
          </View>
          <View style={styles.profileInfo}>
            {stats?.roblox_username ? (
              <>
                <Text style={styles.profileName}>{stats.roblox_username}</Text>
                <View style={styles.profileBadges}>
                  <View style={styles.robloxBadge}>
                    <Ionicons name="game-controller" size={12} color={colors.accent.primary} />
                    <Text style={styles.badgeText}>Roblox Linked</Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.profileName}>PlayBeacon User</Text>
                <Text style={styles.profileSubtext}>Link Roblox for personalized picks</Text>
              </>
            )}
          </View>
        </View>

        {/* Quick Stats Row */}
        {stats && (
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{stats.liked_count}</Text>
              <Text style={styles.quickStatLabel}>Liked</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{stats.disliked_count}</Text>
              <Text style={styles.quickStatLabel}>Passed</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{stats.total_ratings}</Text>
              <Text style={styles.quickStatLabel}>Total</Text>
            </View>
          </View>
        )}

        {/* Link Roblox CTA (if not linked) */}
        {!stats?.roblox_username && (
          <TouchableOpacity
            style={styles.linkRobloxCTA}
            onPress={() => {
              SoundManager.play('ui.tap');
              SoundManager.play('ui.modal_open');
              setRobloxModalVisible(true);
            }}
          >
            <Ionicons name="link" size={18} color={colors.text.primary} />
            <Text style={styles.linkRobloxCTAText}>Link Roblox Account</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Premium Card */}
      <TouchableOpacity
        style={[styles.premiumCard, isPremium && styles.premiumCardActive]}
        onPress={() => {
          if (!isPremium) {
            SoundManager.play('ui.tap');
            navigation.navigate('Premium');
          }
        }}
        activeOpacity={isPremium ? 1 : 0.8}
      >
        <View style={styles.premiumContent}>
          <View style={[styles.premiumIconContainer, isPremium && styles.premiumIconActive]}>
            <Ionicons
              name={isPremium ? 'star' : 'star-outline'}
              size={24}
              color={isPremium ? colors.warning : colors.accent.primary}
            />
          </View>
          <View style={styles.premiumTextContainer}>
            <Text style={styles.premiumTitle}>
              {isPremium ? 'Premium Active' : 'Go Ad-Free'}
            </Text>
            <Text style={styles.premiumDescription}>
              {isPremium
                ? 'Thank you for supporting PlayBeacon!'
                : 'Remove all ads with a one-time purchase'}
            </Text>
          </View>
        </View>
        {!isPremium && (
          <View style={styles.premiumArrow}>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </View>
        )}
      </TouchableOpacity>

      {/* Settings Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionLabel}>HISTORY</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => handleViewHistory('liked')}
          >
            <View style={styles.settingsRowLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="heart" size={18} color={colors.success} />
              </View>
              <Text style={styles.settingsRowText}>Liked Games</Text>
            </View>
            <View style={styles.settingsRowRight}>
              <Text style={styles.settingsRowCount}>{stats?.liked_count || 0}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
            </View>
          </TouchableOpacity>

          <View style={styles.settingsRowDivider} />

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => handleViewHistory('disliked')}
          >
            <View style={styles.settingsRowLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: colors.error + '20' }]}>
                <Ionicons name="close-circle" size={18} color={colors.error} />
              </View>
              <Text style={styles.settingsRowText}>Passed Games</Text>
            </View>
            <View style={styles.settingsRowRight}>
              <Text style={styles.settingsRowCount}>{stats?.disliked_count || 0}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.settingsCard}>
          {/* Account Status Row */}
          <View style={styles.settingsRowStatic}>
            <View style={styles.settingsRowLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: colors.accent.primary + '20' }]}>
                <Ionicons name="person" size={18} color={colors.accent.primary} />
              </View>
              <View>
                <Text style={styles.settingsRowText}>Account Type</Text>
                <Text style={styles.settingsRowSubtext}>{accountStatus.label}</Text>
              </View>
            </View>
          </View>

          <View style={styles.settingsRowDivider} />

          {/* Google Sign-In / Disconnect */}
          {accountStatus.type === 'anonymous' ? (
            <TouchableOpacity
              style={styles.settingsRow}
              onPress={handleGoogleSignInPress}
              disabled={isLinkingAccount}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: '#4285F420' }]}>
                  <Ionicons name="logo-google" size={18} color="#4285F4" />
                </View>
                <View>
                  <Text style={styles.settingsRowText}>Link Google Account</Text>
                  <Text style={styles.settingsRowSubtext}>Sync data across devices</Text>
                </View>
              </View>
              <View style={styles.parentBadgeSmall}>
                <Text style={styles.parentBadgeText}>Parent</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.settingsRow}
              onPress={handleDisconnectGooglePress}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: '#4285F420' }]}>
                  <Ionicons name="logo-google" size={18} color="#4285F4" />
                </View>
                <View>
                  <Text style={styles.settingsRowText}>Disconnect Google</Text>
                  <Text style={styles.settingsRowSubtext}>Remove cloud sync</Text>
                </View>
              </View>
              <View style={styles.parentBadgeSmall}>
                <Text style={styles.parentBadgeText}>Parent</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.settingsRowDivider} />

          {/* Restore Purchases */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={handleRestorePurchasesPress}
          >
            <View style={styles.settingsRowLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="refresh" size={18} color={colors.warning} />
              </View>
              <Text style={styles.settingsRowText}>Restore Purchases</Text>
            </View>
            <View style={styles.parentBadgeSmall}>
              <Text style={styles.parentBadgeText}>Parent</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Data Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionLabel}>DATA</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={handleResetProfile}
            disabled={resetting}
          >
            <View style={styles.settingsRowLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: colors.error + '15' }]}>
                {resetting ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <Ionicons name="refresh-circle" size={18} color={colors.error} />
                )}
              </View>
              <View>
                <Text style={[styles.settingsRowText, { color: colors.error }]}>
                  Reset Recommendations
                </Text>
                <Text style={styles.settingsRowSubtext}>Clear all ratings</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.settingsRowDivider} />

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={handleLogout}
          >
            <View style={styles.settingsRowLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: colors.text.tertiary + '20' }]}>
                <Ionicons name="exit-outline" size={18} color={colors.text.tertiary} />
              </View>
              <View>
                <Text style={styles.settingsRowText}>Start Fresh</Text>
                <Text style={styles.settingsRowSubtext}>Reset app and restart tutorial</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.settingsRowDivider} />

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={handleDeleteAccount}
            disabled={resetting}
          >
            <View style={styles.settingsRowLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: colors.error + '20' }]}>
                {resetting ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                )}
              </View>
              <View>
                <Text style={[styles.settingsRowText, { color: colors.error }]}>
                  Delete Account
                </Text>
                <Text style={styles.settingsRowSubtext}>Permanently delete all data</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Version */}
      <Text style={styles.versionText}>PlayBeacon v{appVersion}</Text>

      {/* History Modal */}
      <Modal
        visible={historyModalVisible}
        animationType="slide"
        onRequestClose={() => {
          SoundManager.play('ui.modal_close');
          setHistoryModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {historyType === 'liked' ? 'Liked Games' : 'Disliked Games'}
            </Text>
            <TouchableOpacity onPress={() => {
              SoundManager.play('ui.modal_close');
              setHistoryModalVisible(false);
            }}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {historyGames.length === 0 ? (
              <Text style={styles.emptyText}>No games found</Text>
            ) : (
              historyGames.map((game) => (
                <View key={game.universe_id} style={styles.gameItem}>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <Text style={styles.gameCreator}>{game.creator_name}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Roblox Link Modal */}
      <Modal
        visible={robloxModalVisible}
        animationType="slide"
        onRequestClose={() => {
          SoundManager.play('ui.modal_close');
          setRobloxModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Link Roblox Account</Text>
            <TouchableOpacity onPress={() => {
              SoundManager.play('ui.modal_close');
              setRobloxModalVisible(false);
            }}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.robloxModalContent}>
            <Text style={styles.robloxModalDescription}>
              Enter your Roblox username to import your favorite games and get
              personalized recommendations.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Roblox Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your Roblox username"
                placeholderTextColor={colors.text.placeholder}
                value={robloxUsername}
                onChangeText={setRobloxUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!linkingRoblox}
              />
            </View>

            <TouchableOpacity
              style={[styles.linkButton, linkingRoblox && styles.linkButtonDisabled]}
              onPress={handleLinkRoblox}
              disabled={linkingRoblox}
            >
              {linkingRoblox ? (
                <ActivityIndicator color={colors.text.primary} />
              ) : (
                <Text style={styles.linkButtonText}>Link & Import Games</Text>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>What we'll import:</Text>
              <Text style={styles.infoText}>• Your favorite games</Text>
              <Text style={styles.infoText}>• Games where you've earned badges</Text>
              <Text style={styles.infoText}>• No personal data or passwords</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Parental Gate */}
      <ParentalGate
        visible={showParentalGate}
        onPass={handleParentalGatePass}
        onCancel={handleParentalGateCancel}
      />

      {/* Animal Picker Modal */}
      <AnimalPickerModal
        visible={animalPickerVisible}
        onClose={() => {
          SoundManager.play('ui.modal_close');
          setAnimalPickerVisible(false);
        }}
        selectedAnimalId={selectedAnimalId}
        onSelect={handleAnimalSelect}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  header: {
    fontSize: typography.sizes.header,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },

  // Profile Card (combined header)
  profileCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.m,
    padding: 20,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.background.secondary,
    borderRadius: radii.xs,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  profileSubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  profileBadges: {
    flexDirection: 'row',
    marginTop: 4,
  },
  robloxBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.s,
  },
  badgeText: {
    fontSize: 12,
    color: colors.accent.primary,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.s,
    paddingVertical: 16,
    marginBottom: 16,
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
  },
  quickStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.divider,
  },

  // Link Roblox CTA
  linkRobloxCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.primary,
    paddingVertical: 14,
    borderRadius: radii.s,
    gap: 8,
  },
  linkRobloxCTAText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  // Premium Card
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: radii.m,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.accent.primary + '40',
  },
  premiumCardActive: {
    backgroundColor: colors.success + '15',
    borderColor: colors.success + '40',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radii.l,
    backgroundColor: colors.accent.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  premiumIconActive: {
    backgroundColor: colors.warning + '20',
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  premiumDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  premiumArrow: {
    paddingLeft: 8,
  },

  // Settings Sections
  settingsSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.tertiary,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  settingsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.m,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingHorizontal: 16,
  },
  settingsRowStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingHorizontal: 16,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.xs,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsRowText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  settingsRowSubtext: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 1,
  },
  settingsRowCount: {
    fontSize: 15,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  settingsRowDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 64,
  },
  parentBadgeSmall: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.xs,
  },
  parentBadgeText: {
    fontSize: 10,
    color: colors.text.tertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Version text
  versionText: {
    textAlign: 'center',
    color: colors.text.tertiary,
    fontSize: 12,
    marginBottom: 40,
    marginTop: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.accent.primary,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: 40,
  },
  gameItem: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: radii.s,
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  gameCreator: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  // Roblox Modal styles
  robloxModalContent: {
    flex: 1,
    padding: 20,
  },
  robloxModalDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.s,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  linkButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: 16,
    borderRadius: radii.s,
    alignItems: 'center',
    marginBottom: 24,
  },
  linkButtonDisabled: {
    opacity: 0.6,
  },
  linkButtonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: radii.s,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.primary,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  // Error styles
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
