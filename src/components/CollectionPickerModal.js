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
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { colors } from '../styles/colors';
import logger from '../utils/logger';

export default function CollectionPickerModal({ visible, onClose, gameId, gameName }) {
  const { t } = useTranslation();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(null);

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
      Alert.alert(t('common.error'), t('components.collectionPickerError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = async (collection) => {
    try {
      setAdding(collection.id);
      await api.addGameToCollection(collection.id, gameId);
      // Note: ADD_TO_WISHLIST is tracked when liking a game in the queue,
      // not when organizing into collections (to avoid double-counting)
      Alert.alert(t('common.success'), t('components.collectionPickerSuccess', { name: collection.name }));
      onClose();
    } catch (error) {
      logger.error('Failed to add to collection:', error);
      if (error.response?.status === 400) {
        Alert.alert(t('components.collectionPickerAlreadyAdded'), t('components.collectionPickerAlreadyAddedMsg'));
      } else {
        Alert.alert(t('common.error'), t('components.collectionPickerAddError'));
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
          {item.game_count} {item.game_count === 1 ? t('collections.game') : t('collections.games')}
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
            <Text style={styles.title}>{t('components.collectionPickerTitle')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>{t('common.cancel')}</Text>
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
              <Text style={styles.emptyText}>{t('components.collectionPickerEmpty')}</Text>
              <Text style={styles.emptySubtext}>
                {t('components.collectionPickerEmptyHint')}
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
