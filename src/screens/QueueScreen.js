import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api } from '../services/api';

export default function QueueScreen() {
  const [games, setGames] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await api.getQueue(10);
      setGames(data.queue || []);
    } catch (error) {
      console.error('Error loading queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (feedback) => {
    const currentGame = games[currentIndex];
    if (!currentGame) return;

    try {
      await api.submitFeedback(currentGame.universe_id, feedback);
      
      if (currentIndex < games.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        loadQueue();
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  const currentGame = games[currentIndex];

  if (!currentGame) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No games in queue</Text>
        <TouchableOpacity style={styles.button} onPress={loadQueue}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image 
          source={{ uri: currentGame.thumbnail_url || 'https://via.placeholder.com/400' }} 
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.title}>{currentGame.title}</Text>
          <Text style={styles.genre}>{currentGame.genre}</Text>
          <Text style={styles.description} numberOfLines={3}>
            {currentGame.description}
          </Text>
          <Text style={styles.stats}>
            {currentGame.visits?.toLocaleString()} visits • {currentGame.active_players} playing
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={() => handleFeedback(-1)}
        >
          <Text style={styles.actionText}>✗</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.skipButton]}
          onPress={() => handleFeedback(0)}
        >
          <Text style={styles.actionText}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleFeedback(1)}
        >
          <Text style={styles.actionText}>♥</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.counter}>{currentIndex + 1} / {games.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 20,
    paddingTop: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  card: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#3A3A3A',
  },
  info: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  genre: {
    fontSize: 14,
    color: '#FF6B6B',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 12,
  },
  stats: {
    fontSize: 12,
    color: '#999999',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dislikeButton: {
    backgroundColor: '#FF4444',
  },
  skipButton: {
    backgroundColor: '#666666',
  },
  likeButton: {
    backgroundColor: '#44FF44',
  },
  actionText: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  counter: {
    textAlign: 'center',
    color: '#999999',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 18,
    color: '#999999',
    marginBottom: 20,
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
});
