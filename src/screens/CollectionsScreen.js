import React, { useState, useEffect } from 'react';
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
import { api } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import { PlayBeaconBannerAd } from '../components/ads';
import { colors } from '../styles/colors';
import {
  validateCollectionName,
  validateCollectionDescription,
  sanitizeCollectionName,
  sanitizeCollectionDescription,
} from '../utils/validation';

export default function CollectionsScreen({ navigation }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCollections();
      setCollections(data.collections);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'Failed to load collections. Please check your connection.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    // Validate collection name
    const nameValidation = validateCollectionName(newCollectionName);
    if (!nameValidation.valid) {
      Alert.alert('Invalid Name', nameValidation.error);
      return;
    }

    // Validate collection description
    const descValidation = validateCollectionDescription(newCollectionDescription);
    if (!descValidation.valid) {
      Alert.alert('Invalid Description', descValidation.error);
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

      // Track collection creation for achievements
      try {
        await api.incrementCollectionsCreated();
      } catch (trackError) {
        // Silently fail - don't block collection creation
        console.log('Collection creation tracking failed:', trackError.message);
      }

      setNewCollectionName('');
      setNewCollectionDescription('');
      setCreateModalVisible(false);
      await fetchCollections();
      Alert.alert('Success', 'Collection created successfully');
    } catch (error) {
      console.error('Failed to create collection:', error);
      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'Failed to create collection. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCollection = (collection) => {
    Alert.alert(
      'Delete Collection',
      `Are you sure you want to delete "${collection.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteCollection(collection.id);
              await fetchCollections();
              Alert.alert('Success', 'Collection deleted');
            } catch (error) {
              console.error('Failed to delete collection:', error);
              const errorMessage = error.response?.data?.message ||
                                  error.message ||
                                  'Failed to delete collection. Please try again.';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleViewCollection = (collection) => {
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
          {item.game_count} {item.game_count === 1 ? 'game' : 'games'}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Collections</Text>
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
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={fetchCollections}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Collections</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setCreateModalVisible(true)}
        >
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {collections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No collections yet</Text>
          <Text style={styles.emptyDescription}>
            Create a collection to organize your favorite games
          </Text>
          <TouchableOpacity
            style={styles.emptyCreateButton}
            onPress={() => setCreateModalVisible(true)}
          >
            <Text style={styles.emptyCreateButtonText}>Create Collection</Text>
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
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Collection</Text>

            <TextInput
              style={styles.input}
              placeholder="Collection name"
              placeholderTextColor="#666666"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              maxLength={100}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
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
                  setCreateModalVisible(false);
                  setNewCollectionName('');
                  setNewCollectionDescription('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleCreateCollection}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Create</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  createButton: {
    backgroundColor: colors.accent.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  createButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
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
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
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
    padding: 12,
    borderRadius: 8,
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
    borderRadius: 12,
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
    borderRadius: 12,
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
