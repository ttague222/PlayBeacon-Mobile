import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../services/api';
import { useCollection } from '../context/CollectionContext';
import { colors } from '../styles/colors';
import logger from '../utils/logger';

export default function CollectionPickerModal({ visible, onClose, gameId, gameName }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(null);

  // Badge collection hook
  const { triggerEvent } = useCollection();

  useEffect(() => {
    if (visible) {
      fetchCollections();
    }
  }, [visible]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const data = await api.getCollections();
      setCollections(data.collections);
    } catch (error) {
      logger.error('Failed to fetch collections:', error);
      Alert.alert('Error', 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = async (collection) => {
    try {
      setAdding(collection.id);
      await api.addGameToCollection(collection.id, gameId);

      // Trigger badge event for adding to collection
      triggerEvent('ADD_TO_WISHLIST');

      Alert.alert('Success', `Added to "${collection.name}"`);
      onClose();
    } catch (error) {
      logger.error('Failed to add to collection:', error);
      if (error.response?.status === 400) {
        Alert.alert('Already Added', 'This game is already in that collection');
      } else {
        Alert.alert('Error', 'Failed to add game to collection');
      }
    } finally {
      setAdding(null);
    }
  };

  const renderCollectionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.collectionItem}
      onPress={() => handleAddToCollection(item)}
      disabled={adding === item.id}
    >
      <View style={styles.collectionContent}>
        <Text style={styles.collectionName}>{item.name}</Text>
        <Text style={styles.gameCount}>
          {item.game_count} {item.game_count === 1 ? 'game' : 'games'}
        </Text>
      </View>
      {adding === item.id ? (
        <ActivityIndicator color={colors.accent.primary} />
      ) : (
        <Text style={styles.addIcon}>+</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Add to Collection</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {gameName && (
            <Text style={styles.gameName} numberOfLines={1}>
              {gameName}
            </Text>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent.primary} />
            </View>
          ) : collections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No collections yet</Text>
              <Text style={styles.emptySubtext}>
                Create a collection from the Collections tab first
              </Text>
            </View>
          ) : (
            <FlatList
              data={collections}
              renderItem={renderCollectionItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: 16,
    color: colors.accent.primary,
  },
  gameName: {
    fontSize: 14,
    color: colors.text.secondary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
  },
  collectionItem: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionContent: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  gameCount: {
    fontSize: 12,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
  },
  addIcon: {
    fontSize: 28,
    color: colors.accent.primary,
    fontWeight: '300',
    marginLeft: 12,
  },
});
