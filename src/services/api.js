import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  getQueue: async (limit = 10) => {
    const response = await apiClient.post('/queue', { limit });
    return response.data;
  },

  submitFeedback: async (universeId, feedback) => {
    const response = await apiClient.post('/feedback', {
      universe_id: universeId,
      feedback,
    });
    return response.data;
  },

  getRecommendations: async (universeId = null, limit = 20) => {
    if (universeId) {
      const response = await apiClient.get(`/recommendations/${universeId}?limit=${limit}`);
      return response.data;
    } else {
      const response = await apiClient.get(`/games?limit=${limit}`);
      return response.data;
    }
  },

  getGame: async (universeId) => {
    const response = await apiClient.get(`/games/${universeId}`);
    return response.data;
  },

  getUserProfile: async () => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  updateUserProfile: async (profileData) => {
    const response = await apiClient.put('/user/profile', profileData);
    return response.data;
  },
};

export default apiClient;
