import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../styles/colors';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout, upgradeAnonymousWithGoogle, resetTutorialProgress } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyType, setHistoryType] = useState('liked');
  const [historyGames, setHistoryGames] = useState([]);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'Failed to load profile data. Please check your connection.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (type) => {
    try {
      setHistoryType(type);
      const data = await api.getUserFeedback(type);
      setHistoryGames(data.games);
      setHistoryModalVisible(true);
    } catch (error) {
      console.error('Failed to load history:', error);
      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'Failed to load rating history. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleResetProfile = () => {
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
              console.error('Failed to reset profile:', error);
              const errorMessage = error.response?.data?.message ||
                                  error.message ||
                                  'Failed to reset profile. Please try again.';
              Alert.alert('Error', errorMessage);
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleUpgradeAccount = async () => {
    try {
      setUpgrading(true);
      await upgradeAnonymousWithGoogle();
      Alert.alert(
        'Success',
        'Your account has been upgraded! Your progress is now saved to your Google account.'
      );
    } catch (error) {
      console.error('Upgrade error:', error);
      Alert.alert(
        'Upgrade Failed',
        error.message || 'Failed to upgrade account. Please try again.'
      );
    } finally {
      setUpgrading(false);
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
        <TouchableOpacity style={styles.button} onPress={fetchUserStats}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Profile</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {user?.isAnonymous && (
        <View style={styles.upgradeCard}>
          <Text style={styles.upgradeTitle}>Save Your Progress</Text>
          <Text style={styles.upgradeDescription}>
            You're currently using a guest account. Link your Google account to save your preferences and ratings permanently.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgradeAccount}
            disabled={upgrading}
          >
            {upgrading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.upgradeButtonText}>Link Google Account</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.profileCard}>
        <Text style={styles.label}>Account Type</Text>
        <Text style={styles.value}>
          {user?.isAnonymous ? 'Guest Account' : user?.email || 'Authenticated'}
        </Text>
      </View>

      {stats && (
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.liked_count}</Text>
              <Text style={styles.statLabel}>Liked</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.disliked_count}</Text>
              <Text style={styles.statLabel}>Disliked</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.skipped_count}</Text>
              <Text style={styles.statLabel}>Skipped</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total_ratings}</Text>
              <Text style={styles.statLabel}>Total Ratings</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>History</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleViewHistory('liked')}
        >
          <Text style={styles.menuText}>View Liked Games</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleViewHistory('disliked')}
        >
          <Text style={styles.menuText}>View Disliked Games</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>

        <TouchableOpacity
          style={[styles.menuItem, styles.dangerItem]}
          onPress={handleResetProfile}
          disabled={resetting}
        >
          {resetting ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <Text style={styles.dangerText}>Reset Recommendations</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={async () => {
            Alert.alert(
              'Reset Tutorial',
              'This will show you the onboarding tutorial again next time you open the app.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset Tutorial',
                  onPress: async () => {
                    await resetTutorialProgress();
                    Alert.alert('Success', 'Tutorial will show again next time you open the app');
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.menuText}>Reset Tutorial</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Modal
        visible={historyModalVisible}
        animationType="slide"
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {historyType === 'liked' ? 'Liked Games' : 'Disliked Games'}
            </Text>
            <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
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
    marginBottom: 30,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  upgradeCard: {
    backgroundColor: colors.background.secondary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.accent.tertiary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  upgradeDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: colors.accent.tertiary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  upgradeButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: colors.background.secondary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  label: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: colors.text.primary,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  menuItem: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  logoutButton: {
    backgroundColor: colors.error,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: colors.background.secondary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statItem: {
    width: '48%',
    backgroundColor: colors.background.tertiary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.accent.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
  },
  dangerItem: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: colors.error,
  },
  dangerText: {
    color: colors.error,
    fontSize: 16,
  },
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
  closeButton: {
    fontSize: 16,
    color: colors.accent.primary,
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
    borderRadius: 12,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
