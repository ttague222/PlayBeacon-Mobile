import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api } from '../services/api';
import CollectionPickerModal from '../components/CollectionPickerModal';
import SkeletonLoader from '../components/SkeletonLoader';
import OptimizedImage from '../components/OptimizedImage';
import { PlayBeaconBannerAd } from '../components/ads';
import { colors } from '../styles/colors';

export default function RecommendationsScreen() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRecommendations(null, 50);
      setGames(data);
    } catch (error) {
      console.error('Error loading games:', error);
      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'Failed to load games. Please check your connection.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = (game) => {
    setSelectedGame(game);
    setCollectionModalVisible(true);
  };

  const renderGame = ({ item }) => (
    <View style={styles.gameCard}>
      <OptimizedImage
        source={{ uri: item.thumbnail_url || 'https://via.placeholder.com/150' }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={styles.addToCollectionButton}
        onPress={() => handleAddToCollection(item)}
      >
        <Text style={styles.addToCollectionIcon}>+</Text>
      </TouchableOpacity>
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.gameGenre}>{item.genre}</Text>
        <Text style={styles.gameStats}>
          {item.visits?.toLocaleString()} visits
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Browse Games</Text>
        <View style={styles.row}>
          <SkeletonLoader variant="grid" count={10} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={loadGames}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Browse Games</Text>
      <FlatList
        data={games}
        renderItem={renderGame}
        keyExtractor={(item) => item.universe_id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
      />
      {selectedGame && (
        <CollectionPickerModal
          visible={collectionModalVisible}
          onClose={() => {
            setCollectionModalVisible(false);
            setSelectedGame(null);
          }}
          gameId={selectedGame.universe_id}
          gameName={selectedGame.title}
        />
      )}

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
    backgroundColor: '#1A1A1A',
    paddingTop: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  list: {
    paddingHorizontal: 10,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  gameCard: {
    width: '48%',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#3A3A3A',
  },
  gameInfo: {
    padding: 12,
  },
  gameTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gameGenre: {
    fontSize: 11,
    color: '#FF6B6B',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  gameStats: {
    fontSize: 11,
    color: '#999999',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addToCollectionButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(66, 133, 244, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  addToCollectionIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  adContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
});
