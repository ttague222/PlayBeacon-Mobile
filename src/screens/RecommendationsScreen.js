import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api } from '../services/api';

export default function RecommendationsScreen() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await api.getRecommendations(null, 50);
      setGames(data);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderGame = ({ item }) => (
    <TouchableOpacity style={styles.gameCard}>
      <Image 
        source={{ uri: item.thumbnail_url || 'https://via.placeholder.com/150' }} 
        style={styles.thumbnail}
      />
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.gameGenre}>{item.genre}</Text>
        <Text style={styles.gameStats}>
          {item.visits?.toLocaleString()} visits
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
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
});
