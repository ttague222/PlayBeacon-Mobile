import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { api } from '../services/api';
import SoundManager from '../services/SoundManager';
import SkeletonLoader from '../components/SkeletonLoader';
import OptimizedImage from '../components/OptimizedImage';
import { PlayBeaconBannerAd } from '../components/ads';
import { colors } from '../styles/colors';
import { typography, radii, shadows } from '../styles/kidTheme';
import logger from '../utils/logger';

export default function CollectionDetailScreen({ route, navigation }) {
  const { collection: initialCollection } = route.params;
  const [collection, setCollection] = useState(initialCollection);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCollectionGames();
  }, []);

  const fetchCollectionGames = async () => {
    try {
      setLoading(true);
      const data = await api.getCollectionWithGames(collection.id);
      setCollection(data.collection);
      setGames(data.games);
    } catch (error) {
      logger.error('Failed to fetch collection games:', error);
      Alert.alert('Error', 'Failed to load collection games');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGame = (game) => {
    SoundManager.play('ui.tap');
    Alert.alert(
      'Remove Game',
      `Remove "${game.title}" from this collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            // Optimistic UI update: remove game from list immediately
            const previousGames = games;
            const previousCollection = collection;
            setGames(games.filter(g => g.universe_id !== game.universe_id));
            setCollection({
              ...collection,
              game_count: Math.max(0, collection.game_count - 1)
            });

            try {
              await api.removeGameFromCollection(collection.id, game.universe_id);
            } catch (error) {
              // Revert on error
              setGames(previousGames);
              setCollection(previousCollection);
              logger.error('Failed to remove game:', error);
              Alert.alert('Error', 'Failed to remove game from collection');
            }
          },
        },
      ]
    );
  };

  const handlePlayGame = (game) => {
    SoundManager.play('ui.tap');
    if (game.root_place_id) {
      const url = `https://www.roblox.com/games/${game.root_place_id}`;
      Linking.openURL(url).catch((err) => {
        logger.error('Failed to open URL:', err);
        Alert.alert('Error', 'Failed to open game');
      });
    } else {
      Alert.alert('Error', 'Game URL not available');
    }
  };

  const handleOpenEditModal = () => {
    SoundManager.play('ui.tap');
    SoundManager.play('ui.modal_open');
    setEditName(collection.name);
    setEditDescription(collection.description || '');
    setEditModalVisible(true);
  };

  const handleUpdateCollection = async () => {
    SoundManager.play('ui.tap');
    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    try {
      setUpdating(true);
      await api.updateCollection(collection.id, {
        name: editName.trim(),
        description: editDescription.trim() || null,
      });

      const updatedCollection = {
        ...collection,
        name: editName.trim(),
        description: editDescription.trim() || null,
      };
      setCollection(updatedCollection);
      setEditModalVisible(false);
      Alert.alert('Success', 'Collection updated successfully');
    } catch (error) {
      logger.error('Failed to update collection:', error);
      Alert.alert('Error', 'Failed to update collection. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const renderGameItem = ({ item }) => (
    <View style={styles.gameItem}>
      {item.thumbnail_url && (
        <OptimizedImage
          source={{ uri: item.thumbnail_url }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      )}
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.creator_name && (
          <Text style={styles.gameCreator}>by {item.creator_name}</Text>
        )}
        <View style={styles.gameStats}>
          <Text style={styles.statText}>{formatNumber(item.visits)} visits</Text>
          <Text style={styles.statDivider}>•</Text>
          <Text style={styles.statText}>{formatNumber(item.active_players)} playing</Text>
        </View>
      </View>
      <View style={styles.gameActions}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => handlePlayGame(item)}
        >
          <Text style={styles.playButtonText}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveGame(item)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              SoundManager.play('ui.tap');
              navigation.goBack();
            }}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.collectionHeader}>
          <Text style={styles.collectionName}>{collection.name}</Text>
          {collection.description && (
            <Text style={styles.collectionDescription}>{collection.description}</Text>
          )}
        </View>
        <View style={styles.listContent}>
          <SkeletonLoader variant="game" count={3} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            SoundManager.play('ui.tap');
            navigation.goBack();
          }}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleOpenEditModal}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.collectionHeader}>
        <Text style={styles.collectionName}>{collection.name}</Text>
        {collection.description && (
          <Text style={styles.collectionDescription}>{collection.description}</Text>
        )}
        <Text style={styles.gameCount}>
          {collection.game_count} {collection.game_count === 1 ? 'game' : 'games'}
        </Text>
      </View>

      {games.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No games yet</Text>
          <Text style={styles.emptyDescription}>
            Games you add to this collection will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={games}
          renderItem={renderGameItem}
          keyExtractor={(item) => item.universe_id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          SoundManager.play('ui.modal_close');
          setEditModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Collection</Text>

            <TextInput
              style={styles.input}
              placeholder="Collection name"
              placeholderTextColor="#666666"
              value={editName}
              onChangeText={setEditName}
              maxLength={100}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#666666"
              value={editDescription}
              onChangeText={setEditDescription}
              maxLength={500}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  SoundManager.play('ui.modal_close');
                  setEditModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleUpdateCollection}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 18,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: colors.accent.secondary,
    borderRadius: radii.s,
    ...shadows.medium,
  },
  editButtonText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
  },
  collectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  collectionName: {
    fontSize: typography.sizes.header,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 8,
  },
  collectionDescription: {
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  gameCount: {
    fontSize: typography.sizes.small,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    fontWeight: typography.fontWeight.semibold,
  },
  listContent: {
    padding: 20,
  },
  gameItem: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.s,
    marginBottom: 16,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: colors.background.tertiary,
  },
  gameInfo: {
    padding: 16,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  gameCreator: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  gameStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  statDivider: {
    fontSize: 12,
    color: colors.text.placeholder,
    marginHorizontal: 8,
  },
  gameActions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  playButton: {
    flex: 1,
    backgroundColor: colors.accent.tertiary,
    paddingVertical: 10,
    borderRadius: radii.s,
    alignItems: 'center',
    ...shadows.medium,
  },
  playButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    paddingVertical: 10,
    borderRadius: radii.s,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.action.dislike,
  },
  removeButtonText: {
    color: colors.action.dislike,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.m,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    ...shadows.xlarge,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radii.s,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.s,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background.tertiary,
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.accent.primary,
  },
  submitButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  adContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
});
