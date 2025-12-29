import axios from 'axios';
import { auth } from '../config/firebase';
import logger from '../utils/logger';
import {
  sanitizeNumericId,
  sanitizeLimit,
  sanitizeOffset,
  sanitizeFeedback,
  sanitizeCollectionName,
  sanitizeCollectionDescription,
  // TEMPORARILY DISABLED: Roblox import feature pending Roblox approval
  // sanitizeRobloxUsername,
  validateNumericId,
  validateFeedback,
  validateCollectionName,
} from '../utils/validation';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Rate limiting state
const rateLimitState = {
  isRateLimited: false,
  retryAfter: null,
  requestCount: 0,
  windowStart: Date.now(),
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  // Check if auth is available (may be null if Firebase failed to initialize)
  const currentUser = auth?.currentUser;
  if (currentUser) {
    // getIdToken() automatically refreshes the token if expired
    const token = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration and rate limiting
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle rate limiting (429 Too Many Requests)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      rateLimitState.isRateLimited = true;
      rateLimitState.retryAfter = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000;

      logger.warn(`Rate limited. Retry after ${rateLimitState.retryAfter}ms`);

      // Auto-reset rate limit state after delay
      setTimeout(() => {
        rateLimitState.isRateLimited = false;
        rateLimitState.retryAfter = null;
      }, rateLimitState.retryAfter);

      return Promise.reject(new Error('Too many requests. Please wait a moment and try again.'));
    }

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
          logger.error('Token refresh failed:', refreshError);
          return Promise.reject(error);
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Check if currently rate limited
 */
export const isRateLimited = () => rateLimitState.isRateLimited;

/**
 * Get retry after time in milliseconds
 */
export const getRetryAfter = () => rateLimitState.retryAfter;

export const api = {
  getQueue: async (limit = 10) => {
    const sanitizedLimit = sanitizeLimit(limit, 50);
    const response = await apiClient.post('/queue', { limit: sanitizedLimit });
    return response.data;
  },

  submitFeedback: async (universeId, feedback) => {
    // Validate universe ID
    const idValidation = validateNumericId(universeId, 'Universe ID');
    if (!idValidation.valid) {
      throw new Error(idValidation.error);
    }

    // Validate feedback value
    const feedbackValidation = validateFeedback(feedback);
    if (!feedbackValidation.valid) {
      throw new Error(feedbackValidation.error);
    }

    const response = await apiClient.post('/feedback', {
      // Backend expects universe_id as string
      universe_id: String(sanitizeNumericId(universeId)),
      feedback: sanitizeFeedback(feedback),
    });
    return response.data;
  },

  getRecommendations: async (universeId = null, limit = 20) => {
    const sanitizedLimit = sanitizeLimit(limit, 100);

    if (universeId) {
      const sanitizedId = sanitizeNumericId(universeId);
      if (!sanitizedId) {
        throw new Error('Invalid universe ID');
      }
      const response = await apiClient.get(`/recommendations/${sanitizedId}?limit=${sanitizedLimit}`);
      return response.data;
    } else {
      const response = await apiClient.get(`/games?limit=${sanitizedLimit}`);
      return response.data;
    }
  },

  getGame: async (universeId) => {
    const sanitizedId = sanitizeNumericId(universeId);
    if (!sanitizedId) {
      throw new Error('Invalid universe ID');
    }
    const response = await apiClient.get(`/games/${sanitizedId}`);
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

  // TEMPORARILY DISABLED: Roblox import feature pending Roblox approval
  // resolveRobloxUsername: async (username) => {
  //   const sanitizedUsername = sanitizeRobloxUsername(username);
  //   if (!sanitizedUsername) {
  //     throw new Error('Invalid Roblox username');
  //   }
  //   const response = await apiClient.get('/roblox/resolve', {
  //     params: { username: sanitizedUsername },
  //   });
  //   return response.data;
  // },

  // getRobloxImportData: async (userId) => {
  //   const sanitizedId = sanitizeNumericId(userId);
  //   if (!sanitizedId) {
  //     throw new Error('Invalid user ID');
  //   }
  //   const response = await apiClient.get('/roblox/import-data', {
  //     params: { userId: sanitizedId },
  //   });
  //   return response.data;
  // },

  // importRobloxGames: async (importData) => {
  //   const response = await apiClient.post('/roblox/import-selected', importData);
  //   return response.data;
  // },

  // skipRobloxImport: async () => {
  //   // Explicitly send empty object to ensure Content-Type and Content-Length headers are set
  //   const response = await apiClient.post('/user/skip-roblox-import', {});
  //   return response.data;
  // },

  getUserStats: async () => {
    const response = await apiClient.get('/user/stats');
    return response.data;
  },

  getUserFeedback: async (feedbackType, limit = 50, offset = 0) => {
    // Validate feedback type - must match backend expected values
    const validTypes = ['liked', 'disliked', 'skipped'];
    if (!validTypes.includes(feedbackType)) {
      throw new Error('Invalid feedback type. Must be liked, disliked, or skipped');
    }

    const response = await apiClient.get(`/user/feedback/${feedbackType}`, {
      params: {
        limit: sanitizeLimit(limit, 100),
        offset: sanitizeOffset(offset),
      },
    });
    return response.data;
  },

  resetProfile: async () => {
    const response = await apiClient.post('/user/reset-profile', {});
    return response.data;
  },

  deleteAccount: async () => {
    const response = await apiClient.delete('/user/account');
    return response.data;
  },

  updateProfileAnimal: async (animalId) => {
    if (!animalId || typeof animalId !== 'string') {
      throw new Error('Invalid animal ID');
    }
    const response = await apiClient.put('/user/profile-animal', {
      animal_id: animalId.trim().toLowerCase(),
    });
    return response.data;
  },

  // Collections
  getCollections: async () => {
    const response = await apiClient.get('/collections');
    return response.data;
  },

  createCollection: async (name, description = null) => {
    // Validate collection name
    const nameValidation = validateCollectionName(name);
    if (!nameValidation.valid) {
      throw new Error(nameValidation.error);
    }

    const response = await apiClient.post('/collections', {
      name: sanitizeCollectionName(name),
      description: description ? sanitizeCollectionDescription(description) : null,
    });
    return response.data;
  },

  getCollectionWithGames: async (collectionId) => {
    if (!collectionId) {
      throw new Error('Collection ID is required');
    }
    const response = await apiClient.get(`/collections/${encodeURIComponent(collectionId)}`);
    return response.data;
  },

  updateCollection: async (collectionId, updates) => {
    if (!collectionId) {
      throw new Error('Collection ID is required');
    }

    // Sanitize updates if they contain name or description
    const sanitizedUpdates = { ...updates };
    if (sanitizedUpdates.name) {
      const nameValidation = validateCollectionName(sanitizedUpdates.name);
      if (!nameValidation.valid) {
        throw new Error(nameValidation.error);
      }
      sanitizedUpdates.name = sanitizeCollectionName(sanitizedUpdates.name);
    }
    if (sanitizedUpdates.description) {
      sanitizedUpdates.description = sanitizeCollectionDescription(sanitizedUpdates.description);
    }

    const response = await apiClient.put(`/collections/${encodeURIComponent(collectionId)}`, sanitizedUpdates);
    return response.data;
  },

  deleteCollection: async (collectionId) => {
    if (!collectionId) {
      throw new Error('Collection ID is required');
    }
    const response = await apiClient.delete(`/collections/${encodeURIComponent(collectionId)}`);
    return response.data;
  },

  addGameToCollection: async (collectionId, universeId) => {
    if (!collectionId) {
      throw new Error('Collection ID is required');
    }
    const sanitizedUniverseId = sanitizeNumericId(universeId);
    if (!sanitizedUniverseId) {
      throw new Error('Invalid universe ID');
    }

    const response = await apiClient.post(`/collections/${encodeURIComponent(collectionId)}/games`, {
      universe_id: String(sanitizedUniverseId),  // Backend expects string
    });
    return response.data;
  },

  removeGameFromCollection: async (collectionId, universeId) => {
    if (!collectionId) {
      throw new Error('Collection ID is required');
    }
    const sanitizedUniverseId = sanitizeNumericId(universeId);
    if (!sanitizedUniverseId) {
      throw new Error('Invalid universe ID');
    }

    const response = await apiClient.delete(`/collections/${encodeURIComponent(collectionId)}/games/${sanitizedUniverseId}`);
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
    const response = await apiClient.post('/stats/increment-games-viewed', {});
    return response.data;
  },

  incrementGamesSaved: async () => {
    const response = await apiClient.post('/stats/increment-games-saved', {});
    return response.data;
  },

  incrementCollectionsCreated: async () => {
    const response = await apiClient.post('/stats/increment-collections-created', {});
    return response.data;
  },

  incrementAIRecommendationsUsed: async () => {
    const response = await apiClient.post('/stats/increment-ai-recommendations', {});
    return response.data;
  },

  updateDailyLogin: async () => {
    const response = await apiClient.post('/stats/update-daily-login', {});
    return response.data;
  },

  // Tasks
  getTasks: async (filters = {}) => {
    const params = {};

    // Validate task type if provided
    // Supports both task categories (play_game, etc.) and task frequencies (daily, weekly, one_time)
    const validTaskTypes = ['play_game', 'explore_genre', 'discover_new', 'custom', 'one_time', 'daily', 'weekly'];
    if (filters.taskType) {
      if (!validTaskTypes.includes(filters.taskType)) {
        throw new Error('Invalid task type');
      }
      params.task_type = filters.taskType;
    }

    if (filters.completed !== undefined) {
      params.completed = Boolean(filters.completed);
    }

    if (filters.gameId) {
      const sanitizedGameId = sanitizeNumericId(filters.gameId);
      if (sanitizedGameId) {
        params.game_id = sanitizedGameId;
      }
    }

    const response = await apiClient.get('/tasks', { params });
    return response.data;
  },

  getTask: async (taskId) => {
    if (!taskId) {
      throw new Error('Task ID is required');
    }
    const response = await apiClient.get(`/tasks/${encodeURIComponent(taskId)}`);
    return response.data;
  },

  createTask: async (taskData) => {
    // Validate task data
    if (!taskData || typeof taskData !== 'object') {
      throw new Error('Invalid task data');
    }

    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (taskId, updates) => {
    if (!taskId) {
      throw new Error('Task ID is required');
    }
    if (!updates || typeof updates !== 'object') {
      throw new Error('Invalid updates');
    }

    const response = await apiClient.patch(`/tasks/${encodeURIComponent(taskId)}`, updates);
    return response.data;
  },

  deleteTask: async (taskId) => {
    if (!taskId) {
      throw new Error('Task ID is required');
    }
    const response = await apiClient.delete(`/tasks/${encodeURIComponent(taskId)}`);
    return response.data;
  },

  completeTask: async (taskId) => {
    if (!taskId) {
      throw new Error('Task ID is required');
    }
    const response = await apiClient.post(`/tasks/${encodeURIComponent(taskId)}/complete`, {});
    return response.data;
  },

  uncompleteTask: async (taskId) => {
    if (!taskId) {
      throw new Error('Task ID is required');
    }
    const response = await apiClient.post(`/tasks/${encodeURIComponent(taskId)}/uncomplete`, {});
    return response.data;
  },

  resetTasks: async (taskType) => {
    // Supports both task categories and task frequencies
    const validTaskTypes = ['play_game', 'explore_genre', 'discover_new', 'custom', 'one_time', 'daily', 'weekly', 'all'];
    if (taskType && !validTaskTypes.includes(taskType)) {
      throw new Error('Invalid task type');
    }

    const response = await apiClient.post('/tasks/reset', {}, {
      params: taskType ? { task_type: taskType } : {},
    });
    return response.data;
  },

  // Daily Mystery Box
  getDailyBoxStatus: async () => {
    const response = await apiClient.get('/daily-box');
    return response.data;
  },

  openDailyBox: async () => {
    const response = await apiClient.post('/daily-box/open', {});
    return response.data;
  },
};

export default apiClient;
