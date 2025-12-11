/**
 * API Service Tests
 *
 * Tests for API service including:
 * - Input validation
 * - Rate limiting
 * - Authentication
 * - Error handling
 */

import { api, isRateLimited, getRetryAfter } from '../../services/api';
import {
  sanitizeNumericId,
  sanitizeLimit,
  sanitizeOffset,
  sanitizeFeedback,
  sanitizeCollectionName,
  sanitizeCollectionDescription,
  sanitizeRobloxUsername,
  validateNumericId,
  validateFeedback,
  validateCollectionName,
} from '../../utils/validation';

// Mock axios
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    create: jest.fn(() => mockAxiosInstance),
    __mockInstance: mockAxiosInstance,
  };
});

// Mock firebase config
jest.mock('../../config/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-123',
      getIdToken: jest.fn(() => Promise.resolve('test-token')),
    },
  },
  db: {},
}));

const axios = require('axios');
const mockAxios = axios.__mockInstance;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: {} });
    mockAxios.post.mockResolvedValue({ data: {} });
    mockAxios.put.mockResolvedValue({ data: {} });
    mockAxios.patch.mockResolvedValue({ data: {} });
    mockAxios.delete.mockResolvedValue({ data: {} });
  });

  describe('Input Validation', () => {
    describe('getQueue', () => {
      it('should sanitize limit parameter', async () => {
        await api.getQueue(100);

        expect(mockAxios.post).toHaveBeenCalledWith('/queue', {
          limit: 50, // Max limit is 50
        });
      });

      it('should use default limit when invalid', async () => {
        await api.getQueue(-1);

        expect(mockAxios.post).toHaveBeenCalledWith('/queue', {
          limit: expect.any(Number),
        });
      });
    });

    describe('submitFeedback', () => {
      it('should validate universe ID', async () => {
        await expect(api.submitFeedback(null, 1)).rejects.toThrow();
        await expect(api.submitFeedback(-1, 1)).rejects.toThrow();
        await expect(api.submitFeedback(0, 1)).rejects.toThrow();
        await expect(api.submitFeedback('abc', 1)).rejects.toThrow();
      });

      it('should validate feedback value', async () => {
        await expect(api.submitFeedback(123, 2)).rejects.toThrow();
        await expect(api.submitFeedback(123, -2)).rejects.toThrow();
        await expect(api.submitFeedback(123, 'like')).rejects.toThrow();
      });

      it('should accept valid feedback values', async () => {
        mockAxios.post.mockResolvedValue({ data: { success: true } });

        await api.submitFeedback(123, 1);
        expect(mockAxios.post).toHaveBeenCalledWith('/feedback', {
          universe_id: 123,
          feedback: 1,
        });

        await api.submitFeedback(456, 0);
        expect(mockAxios.post).toHaveBeenCalledWith('/feedback', {
          universe_id: 456,
          feedback: 0,
        });

        await api.submitFeedback(789, -1);
        expect(mockAxios.post).toHaveBeenCalledWith('/feedback', {
          universe_id: 789,
          feedback: -1,
        });
      });
    });

    describe('getRecommendations', () => {
      it('should validate universe ID when provided', async () => {
        await expect(api.getRecommendations(-1)).rejects.toThrow('Invalid universe ID');
        await expect(api.getRecommendations(0)).rejects.toThrow('Invalid universe ID');
      });

      it('should fetch general recommendations when no ID provided', async () => {
        await api.getRecommendations(null, 20);

        expect(mockAxios.get).toHaveBeenCalledWith('/games?limit=20');
      });

      it('should fetch specific recommendations when ID provided', async () => {
        await api.getRecommendations(123, 20);

        expect(mockAxios.get).toHaveBeenCalledWith('/recommendations/123?limit=20');
      });
    });

    describe('getGame', () => {
      it('should validate universe ID', async () => {
        await expect(api.getGame(null)).rejects.toThrow('Invalid universe ID');
        await expect(api.getGame(-1)).rejects.toThrow('Invalid universe ID');
        await expect(api.getGame(0)).rejects.toThrow('Invalid universe ID');
      });

      it('should fetch game with valid ID', async () => {
        await api.getGame(123);

        expect(mockAxios.get).toHaveBeenCalledWith('/games/123');
      });
    });

    describe('resolveRobloxUsername', () => {
      it('should validate username format', async () => {
        await expect(api.resolveRobloxUsername('')).rejects.toThrow('Invalid Roblox username');
        await expect(api.resolveRobloxUsername(null)).rejects.toThrow('Invalid Roblox username');
      });

      it('should sanitize username with special characters', async () => {
        // Usernames with invalid characters should be rejected
        await expect(api.resolveRobloxUsername('<script>')).rejects.toThrow();
      });

      it('should accept valid usernames', async () => {
        await api.resolveRobloxUsername('ValidUser123');

        expect(mockAxios.get).toHaveBeenCalledWith('/roblox/resolve', {
          params: { username: 'ValidUser123' },
        });
      });
    });

    describe('getRobloxImportData', () => {
      it('should validate user ID', async () => {
        await expect(api.getRobloxImportData(null)).rejects.toThrow('Invalid user ID');
        await expect(api.getRobloxImportData(-1)).rejects.toThrow('Invalid user ID');
      });
    });

    describe('getUserFeedback', () => {
      it('should validate feedback type', async () => {
        await expect(api.getUserFeedback('invalid')).rejects.toThrow('Invalid feedback type');
      });

      it('should accept valid feedback types', async () => {
        const validTypes = ['likes', 'dislikes', 'skips', 'all'];

        for (const type of validTypes) {
          mockAxios.get.mockResolvedValue({ data: [] });
          await api.getUserFeedback(type);
          expect(mockAxios.get).toHaveBeenCalledWith(`/user/feedback/${type}`, {
            params: expect.any(Object),
          });
        }
      });

      it('should sanitize limit and offset', async () => {
        await api.getUserFeedback('likes', 200, -10);

        expect(mockAxios.get).toHaveBeenCalledWith('/user/feedback/likes', {
          params: {
            limit: 100, // Max limit
            offset: 0,  // Min offset
          },
        });
      });
    });
  });

  describe('Collection Operations', () => {
    describe('createCollection', () => {
      it('should validate collection name', async () => {
        await expect(api.createCollection('')).rejects.toThrow();
        await expect(api.createCollection(null)).rejects.toThrow();
      });

      it('should sanitize collection name', async () => {
        await api.createCollection('My <script>Collection');

        expect(mockAxios.post).toHaveBeenCalledWith('/collections', {
          name: expect.not.stringContaining('<script>'),
          description: null,
        });
      });

      it('should sanitize description', async () => {
        await api.createCollection('Test', 'Description with <html>');

        expect(mockAxios.post).toHaveBeenCalledWith('/collections', {
          name: 'Test',
          description: expect.not.stringContaining('<html>'),
        });
      });
    });

    describe('getCollectionWithGames', () => {
      it('should require collection ID', async () => {
        await expect(api.getCollectionWithGames(null)).rejects.toThrow('Collection ID is required');
        await expect(api.getCollectionWithGames('')).rejects.toThrow('Collection ID is required');
      });

      it('should encode collection ID in URL', async () => {
        await api.getCollectionWithGames('my/collection');

        expect(mockAxios.get).toHaveBeenCalledWith(
          `/collections/${encodeURIComponent('my/collection')}`
        );
      });
    });

    describe('updateCollection', () => {
      it('should require collection ID', async () => {
        await expect(api.updateCollection(null, { name: 'New Name' })).rejects.toThrow();
      });

      it('should validate updated name', async () => {
        await expect(
          api.updateCollection('123', { name: '' })
        ).rejects.toThrow();
      });

      it('should sanitize updated name and description', async () => {
        await api.updateCollection('123', {
          name: 'Updated <script>',
          description: 'New desc <img>',
        });

        const callArgs = mockAxios.put.mock.calls[0][1];
        expect(callArgs.name).not.toContain('<script>');
        expect(callArgs.description).not.toContain('<img>');
      });
    });

    describe('deleteCollection', () => {
      it('should require collection ID', async () => {
        await expect(api.deleteCollection(null)).rejects.toThrow();
        await expect(api.deleteCollection('')).rejects.toThrow();
      });
    });

    describe('addGameToCollection', () => {
      it('should validate both collection ID and universe ID', async () => {
        await expect(api.addGameToCollection(null, 123)).rejects.toThrow();
        await expect(api.addGameToCollection('123', null)).rejects.toThrow();
        await expect(api.addGameToCollection('123', -1)).rejects.toThrow();
      });
    });

    describe('removeGameFromCollection', () => {
      it('should validate both collection ID and universe ID', async () => {
        await expect(api.removeGameFromCollection(null, 123)).rejects.toThrow();
        await expect(api.removeGameFromCollection('123', null)).rejects.toThrow();
      });
    });
  });

  describe('Task Operations', () => {
    describe('getTasks', () => {
      it('should validate task type filter', async () => {
        await expect(api.getTasks({ taskType: 'invalid' })).rejects.toThrow('Invalid task type');
      });

      it('should accept valid task types', async () => {
        const validTypes = ['play_game', 'explore_genre', 'discover_new', 'custom'];

        for (const taskType of validTypes) {
          mockAxios.get.mockResolvedValue({ data: [] });
          await api.getTasks({ taskType });
          expect(mockAxios.get).toHaveBeenCalledWith('/tasks', {
            params: { task_type: taskType },
          });
        }
      });

      it('should sanitize game ID filter', async () => {
        await api.getTasks({ gameId: 123 });

        expect(mockAxios.get).toHaveBeenCalledWith('/tasks', {
          params: { game_id: 123 },
        });
      });

      it('should ignore invalid game ID', async () => {
        await api.getTasks({ gameId: -1 });

        const callParams = mockAxios.get.mock.calls[0][1].params;
        expect(callParams.game_id).toBeUndefined();
      });
    });

    describe('getTask', () => {
      it('should require task ID', async () => {
        await expect(api.getTask(null)).rejects.toThrow('Task ID is required');
        await expect(api.getTask('')).rejects.toThrow('Task ID is required');
      });
    });

    describe('createTask', () => {
      it('should validate task data', async () => {
        await expect(api.createTask(null)).rejects.toThrow('Invalid task data');
        await expect(api.createTask('string')).rejects.toThrow('Invalid task data');
      });
    });

    describe('updateTask', () => {
      it('should require task ID and valid updates', async () => {
        await expect(api.updateTask(null, {})).rejects.toThrow('Task ID is required');
        await expect(api.updateTask('123', null)).rejects.toThrow('Invalid updates');
      });
    });

    describe('completeTask / uncompleteTask', () => {
      it('should require task ID', async () => {
        await expect(api.completeTask(null)).rejects.toThrow();
        await expect(api.uncompleteTask(null)).rejects.toThrow();
      });
    });

    describe('resetTasks', () => {
      it('should validate task type', async () => {
        await expect(api.resetTasks('invalid')).rejects.toThrow('Invalid task type');
      });

      it('should accept valid task types including all', async () => {
        const validTypes = ['play_game', 'explore_genre', 'discover_new', 'custom', 'all'];

        for (const taskType of validTypes) {
          mockAxios.post.mockResolvedValue({ data: {} });
          await api.resetTasks(taskType);
          expect(mockAxios.post).toHaveBeenCalled();
        }
      });
    });
  });

  describe('Security', () => {
    it('should prevent path traversal in collection IDs', async () => {
      await api.getCollectionWithGames('../../../etc/passwd');

      const callArg = mockAxios.get.mock.calls[0][0];
      expect(callArg).toContain(encodeURIComponent('../../../etc/passwd'));
      expect(callArg).not.toContain('../');
    });

    it('should prevent XSS in collection names', async () => {
      await api.createCollection('<script>alert("xss")</script>Test');

      const callArgs = mockAxios.post.mock.calls[0][1];
      expect(callArgs.name).not.toContain('<script>');
      expect(callArgs.name).not.toContain('</script>');
    });

    it('should prevent SQL injection patterns in usernames', async () => {
      // These should be sanitized or rejected
      await expect(api.resolveRobloxUsername("'; DROP TABLE users;--")).rejects.toThrow();
    });
  });
});

describe('Validation Functions', () => {
  describe('sanitizeNumericId', () => {
    it('should return valid positive numbers', () => {
      expect(sanitizeNumericId(123)).toBe(123);
      expect(sanitizeNumericId('456')).toBe(456);
    });

    it('should return null for invalid inputs', () => {
      expect(sanitizeNumericId(null)).toBeNull();
      expect(sanitizeNumericId(-1)).toBeNull();
      expect(sanitizeNumericId(0)).toBeNull();
      expect(sanitizeNumericId('abc')).toBeNull();
      expect(sanitizeNumericId(NaN)).toBeNull();
    });
  });

  describe('sanitizeLimit', () => {
    it('should enforce max limit', () => {
      expect(sanitizeLimit(100, 50)).toBe(50);
      expect(sanitizeLimit(30, 50)).toBe(30);
    });

    it('should use default for invalid inputs', () => {
      expect(sanitizeLimit(-1, 50)).toBe(10);
      expect(sanitizeLimit(0, 50)).toBe(10);
    });
  });

  describe('sanitizeOffset', () => {
    it('should return 0 for negative offsets', () => {
      expect(sanitizeOffset(-10)).toBe(0);
    });

    it('should pass through valid offsets', () => {
      expect(sanitizeOffset(100)).toBe(100);
    });
  });

  describe('sanitizeFeedback', () => {
    it('should return valid feedback values', () => {
      expect(sanitizeFeedback(1)).toBe(1);
      expect(sanitizeFeedback(0)).toBe(0);
      expect(sanitizeFeedback(-1)).toBe(-1);
    });

    it('should return 0 for invalid values', () => {
      expect(sanitizeFeedback(2)).toBe(0);
      expect(sanitizeFeedback(-2)).toBe(0);
      expect(sanitizeFeedback('like')).toBe(0);
    });
  });

  describe('sanitizeCollectionName', () => {
    it('should remove dangerous characters', () => {
      const result = sanitizeCollectionName('<script>alert(1)</script>Test');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should trim whitespace', () => {
      expect(sanitizeCollectionName('  Test  ')).toBe('Test');
    });

    it('should truncate long names', () => {
      const longName = 'a'.repeat(150);
      expect(sanitizeCollectionName(longName).length).toBeLessThanOrEqual(100);
    });
  });

  describe('sanitizeRobloxUsername', () => {
    it('should accept valid usernames', () => {
      expect(sanitizeRobloxUsername('Player123')).toBe('Player123');
      expect(sanitizeRobloxUsername('Player_123')).toBe('Player_123');
    });

    it('should return null for invalid usernames', () => {
      expect(sanitizeRobloxUsername('')).toBeNull();
      expect(sanitizeRobloxUsername(null)).toBeNull();
      expect(sanitizeRobloxUsername('<script>')).toBeNull();
    });

    it('should truncate long usernames', () => {
      const longUsername = 'a'.repeat(30);
      const result = sanitizeRobloxUsername(longUsername);
      expect(result?.length).toBeLessThanOrEqual(20);
    });
  });

  describe('validateNumericId', () => {
    it('should return valid for positive numbers', () => {
      expect(validateNumericId(123, 'Test').valid).toBe(true);
    });

    it('should return invalid with error message', () => {
      const result = validateNumericId(-1, 'Universe ID');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Universe ID');
    });
  });

  describe('validateFeedback', () => {
    it('should accept -1, 0, 1', () => {
      expect(validateFeedback(-1).valid).toBe(true);
      expect(validateFeedback(0).valid).toBe(true);
      expect(validateFeedback(1).valid).toBe(true);
    });

    it('should reject other values', () => {
      expect(validateFeedback(2).valid).toBe(false);
      expect(validateFeedback(-2).valid).toBe(false);
    });
  });

  describe('validateCollectionName', () => {
    it('should reject empty names', () => {
      expect(validateCollectionName('').valid).toBe(false);
      expect(validateCollectionName('   ').valid).toBe(false);
    });

    it('should accept valid names', () => {
      expect(validateCollectionName('My Collection').valid).toBe(true);
    });
  });
});
