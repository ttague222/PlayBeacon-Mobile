import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import SoundManager from '../services/SoundManager';
import SkeletonLoader from '../components/SkeletonLoader';
import ProfileButton from '../components/ProfileButton';
import { PlayBeaconBannerAd } from '../components/ads';
import { useCollection } from '../context/CollectionContext';
import { colors } from '../styles/colors';
import logger from '../utils/logger';
import { typography, radii, shadows } from '../styles/kidTheme';
import {
  validateCollectionName,
  validateCollectionDescription,
  sanitizeCollectionName,
  sanitizeCollectionDescription,
} from '../utils/validation';

export default function CollectionsScreen({ navigation }) {
  const { t } = useTranslation();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Badge collection hook
  const { triggerEvent } = useCollection();

  // Refetch collections whenever the screen gains focus
  // This ensures game counts are updated after adding games from other screens
  useFocusEffect(
    useCallback(() => {
      fetchCollections();
    }, [])
  );

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCollections();
      setCollections(data.collections);
    } catch (error) {
      logger.error('Failed to fetch collections:', error);
      setError(t('collections.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    SoundManager.play('ui.tap');
    // Validate collection name
    const nameValidation = validateCollectionName(newCollectionName);
    if (!nameValidation.valid) {
      Alert.alert(t('collections.invalidName'), nameValidation.error);
      return;
    }

    // Validate collection description
    const descValidation = validateCollectionDescription(newCollectionDescription);
    if (!descValidation.valid) {
      Alert.alert(t('collections.invalidDescription'), descValidation.error);
      return;
    }

    try {
      setCreating(true);

      // Sanitize inputs before sending to API
      const sanitizedName = sanitizeCollectionName(newCollectionName);
      const sanitizedDesc = sanitizeCollectionDescription(newCollectionDescription);

      await api.createCollection(
        sanitizedName,
        sanitizedDesc || null
      );

      // Trigger badge event for creating a collection
      triggerEvent('CREATE_COLLECTION');

      setNewCollectionName('');
      setNewCollectionDescription('');
      setCreateModalVisible(false);
      await fetchCollections();
      Alert.alert(t('common.success'), t('collections.createSuccess'));
    } catch (error) {
      logger.error('Failed to create collection:', error);
      Alert.alert(t('common.error'), t('collections.createError'));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCollection = (collection) => {
    SoundManager.play('ui.tap');
    Alert.alert(
      t('collections.deleteTitle'),
      t('collections.deleteConfirm', { name: collection.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteCollection(collection.id);
              await fetchCollections();
              Alert.alert(t('common.success'), t('collections.deleteSuccess'));
            } catch (error) {
              logger.error('Failed to delete collection:', error);
              Alert.alert(t('common.error'), t('collections.deleteError'));
            }
          },
        },
      ]
    );
  };

  const handleViewCollection = (collection) => {
    SoundManager.play('ui.tap');
    navigation.navigate('CollectionDetail', { collection });
  };

  const renderCollectionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.collectionItem}
      onPress={() => handleViewCollection(item)}
      onLongPress={() => handleDeleteCollection(item)}
    >
      <View style={styles.collectionContent}>
        <Text style={styles.collectionName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.collectionDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text style={styles.gameCount}>
          {item.game_count} {item.game_count === 1 ? t('collections.game') : t('collections.games')}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('collections.title')}</Text>
          <ProfileButton />
        </View>
        <View style={styles.listContent}>
          <SkeletonLoader variant="list" count={5} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorTitle}>{t('common.oops')}</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={fetchCollections}>
          <Text style={styles.buttonText}>{t('common.tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('collections.title')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              SoundManager.play('ui.tap');
              SoundManager.play('ui.modal_open');
              setCreateModalVisible(true);
            }}
          >
            <Text style={styles.createButtonText}>{t('collections.newButton')}</Text>
          </TouchableOpacity>
          <ProfileButton />
        </View>
      </View>

      {collections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{t('collections.emptyTitle')}</Text>
          <Text style={styles.emptyDescription}>
            {t('collections.emptyDescription')}
          </Text>
          <TouchableOpacity
            style={styles.emptyCreateButton}
            onPress={() => {
              SoundManager.play('ui.tap');
              SoundManager.play('ui.modal_open');
              setCreateModalVisible(true);
            }}
          >
            <Text style={styles.emptyCreateButtonText}>{t('collections.createButton')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={collections}
          renderItem={renderCollectionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          SoundManager.play('ui.modal_close');
          setCreateModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('collections.createTitle')}</Text>

            <TextInput
              style={styles.input}
              placeholder={t('collections.namePlaceholder')}
              placeholderTextColor="#666666"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              maxLength={100}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('collections.descriptionPlaceholder')}
              placeholderTextColor="#666666"
              value={newCollectionDescription}
              onChangeText={setNewCollectionDescription}
              maxLength={500}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  SoundManager.play('ui.modal_close');
                  setCreateModalVisible(false);
                  setNewCollectionName('');
                  setNewCollectionDescription('');
                }}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleCreateCollection}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>{t('common.create')}</Text>
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
    paddingBottom: 20,
    backgroundColor: colors.background.primary,
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
  createButton: {
    backgroundColor: colors.accent.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.s,
    ...shadows.medium,
  },
  createButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.body,
    fontWeight: typography.fontWeight.semibold,
  },
  listContent: {
    padding: 20,
  },
  collectionItem: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: radii.s,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionContent: {
    flex: 1,
  },
  collectionName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  gameCount: {
    fontSize: 12,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 24,
    color: colors.accent.primary,
    marginLeft: 8,
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
    marginBottom: 30,
  },
  emptyCreateButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radii.s,
    ...shadows.medium,
  },
  emptyCreateButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
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
  adContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
});
