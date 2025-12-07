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
    // getIdToken() automatically refreshes the token if expired
    const token = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 and haven't retried yet, refresh token and retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          // Force token refresh
          const token = await currentUser.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          return Promise.reject(error);
        }
      }
    }

    return Promise.reject(error);
  }
);

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

  resolveRobloxUsername: async (username) => {
    const response = await apiClient.get('/roblox/resolve', {
      params: { username },
    });
    return response.data;
  },

  getRobloxImportData: async (userId) => {
    const response = await apiClient.get('/roblox/import-data', {
      params: { userId },
    });
    return response.data;
  },

  importRobloxGames: async (importData) => {
    const response = await apiClient.post('/roblox/import-selected', importData);
    return response.data;
  },

  skipRobloxImport: async () => {
    const response = await apiClient.post('/user/skip-roblox-import');
    return response.data;
  },

  getUserStats: async () => {
    const response = await apiClient.get('/user/stats');
    return response.data;
  },

  getUserFeedback: async (feedbackType, limit = 50, offset = 0) => {
    const response = await apiClient.get(`/user/feedback/${feedbackType}`, {
      params: { limit, offset },
    });
    return response.data;
  },

  resetProfile: async () => {
    const response = await apiClient.post('/user/reset-profile');
    return response.data;
  },

  // Collections
  getCollections: async () => {
    const response = await apiClient.get('/collections');
    return response.data;
  },

  createCollection: async (name, description = null) => {
    const response = await apiClient.post('/collections', { name, description });
    return response.data;
  },

  getCollectionWithGames: async (collectionId) => {
    const response = await apiClient.get(`/collections/${collectionId}`);
    return response.data;
  },

  updateCollection: async (collectionId, updates) => {
    const response = await apiClient.put(`/collections/${collectionId}`, updates);
    return response.data;
  },

  deleteCollection: async (collectionId) => {
    const response = await apiClient.delete(`/collections/${collectionId}`);
    return response.data;
  },

  addGameToCollection: async (collectionId, universeId) => {
    const response = await apiClient.post(`/collections/${collectionId}/games`, {
      universe_id: universeId,
    });
    return response.data;
  },

  removeGameFromCollection: async (collectionId, universeId) => {
    const response = await apiClient.delete(`/collections/${collectionId}/games/${universeId}`);
    return response.data;
  },

  // Achievements and Stats
  getUserAchievements: async () => {
    const response = await apiClient.get('/achievements');
    return response.data;
  },

  trackStat: async (action, data = {}) => {
    const response = await apiClient.post('/stats/track', {
      action,
      ...data,
    });
    return response.data;
  },

  incrementGamesViewed: async () => {
    const response = await apiClient.post('/stats/increment-games-viewed');
    return response.data;
  },

  incrementGamesSaved: async () => {
    const response = await apiClient.post('/stats/increment-games-saved');
    return response.data;
  },

  incrementCollectionsCreated: async () => {
    const response = await apiClient.post('/stats/increment-collections-created');
    return response.data;
  },

  incrementAIRecommendationsUsed: async () => {
    const response = await apiClient.post('/stats/increment-ai-recommendations');
    return response.data;
  },

  updateDailyLogin: async () => {
    const response = await apiClient.post('/stats/update-daily-login');
    return response.data;
  },
};

export default apiClient;
