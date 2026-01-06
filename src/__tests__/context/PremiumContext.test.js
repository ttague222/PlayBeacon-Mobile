/**
 * PremiumContext Tests
 *
 * Tests for the premium/IAP context provider including
 * purchase flow, restore, and status management.
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';

// Mock dependencies - override the global AsyncStorage mock for this test
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  appOwnership: 'expo', // Simulate Expo Go environment
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock('../../config/firebase', () => ({
  db: {},
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
  }),
}));

jest.mock('../../utils/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

import {
  PremiumProvider,
  usePremium,
  PRODUCT_ID,
} from '../../context/PremiumContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const wrapper = ({ children }) => <PremiumProvider>{children}</PremiumProvider>;

describe('PremiumContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(undefined);
  });

  describe('PRODUCT_ID', () => {
    it('should export the correct product ID', () => {
      expect(PRODUCT_ID).toBe('com.playbeacon.app.removeads3');
    });
  });

  describe('Initial State', () => {
    it('should start with isPremium as false', async () => {
      const { result } = renderHook(() => usePremium(), { wrapper });

      await act(async () => {
        // Wait for initial load
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isPremium).toBe(false);
    });

    it('should eventually become isLoading false after initialization', async () => {
      const { result } = renderHook(() => usePremium(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should start with isPurchasing as false', async () => {
      const { result } = renderHook(() => usePremium(), { wrapper });

      expect(result.current.isPurchasing).toBe(false);
    });

    it('should detect Expo Go environment', async () => {
      const { result } = renderHook(() => usePremium(), { wrapper });

      expect(result.current.isExpoGo).toBe(true);
    });
  });

  describe('Premium Status Loading', () => {
    it('should load premium status from AsyncStorage', async () => {
      AsyncStorage.getItem.mockResolvedValue('true');

      const { result } = renderHook(() => usePremium(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@playbeacon_premium');
      expect(result.current.isPremium).toBe(true);
    });

    it('should remain false if no stored value', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() => usePremium(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isPremium).toBe(false);
    });

    it('should remain false if stored value is false', async () => {
      AsyncStorage.getItem.mockResolvedValue('false');

      const { result } = renderHook(() => usePremium(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isPremium).toBe(false);
    });
  });

  describe('Purchase Flow (Expo Go)', () => {
    it('should have purchasePremium function available', async () => {
      const { result } = renderHook(() => usePremium(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(typeof result.current.purchasePremium).toBe('function');
    });

    it('should report isExpoGo as true in test environment', async () => {
      const { result } = renderHook(() => usePremium(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isExpoGo).toBe(true);
    });
  });

  describe('Restore Purchases (Expo Go)', () => {
    it('should have restorePurchases function available', async () => {
      const { result } = renderHook(() => usePremium(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(typeof result.current.restorePurchases).toBe('function');
    });
  });

  describe('getProductInfo', () => {
    it('should return default product info when no products loaded', async () => {
      const { result } = renderHook(() => usePremium(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const productInfo = result.current.getProductInfo();

      expect(productInfo).toEqual({
        title: 'Remove Ads',
        description: 'Remove all ads forever with a one-time purchase.',
        price: '$1.99',
        currency: 'USD',
      });
    });
  });

  describe('IAP Availability', () => {
    it('should report IAP as unavailable in Expo Go', async () => {
      const { result } = renderHook(() => usePremium(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isIapAvailable).toBe(false);
    });
  });

  describe('usePremium hook', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => usePremium());
      }).toThrow('usePremium must be used within a PremiumProvider');
    });

    it('should return context value when used inside provider', async () => {
      const { result } = renderHook(() => usePremium(), { wrapper });

      expect(result.current).toHaveProperty('isPremium');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isPurchasing');
      expect(result.current).toHaveProperty('isIapAvailable');
      expect(result.current).toHaveProperty('isExpoGo');
      expect(result.current).toHaveProperty('purchasePremium');
      expect(result.current).toHaveProperty('restorePurchases');
      expect(result.current).toHaveProperty('getProductInfo');
    });
  });

  describe('AsyncStorage Error Handling', () => {
    it('should handle AsyncStorage getItem errors gracefully', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => usePremium(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Should not crash and default to false
      expect(result.current.isPremium).toBe(false);
    });
  });

  describe('Context Value Structure', () => {
    it('should provide all required functions and values', async () => {
      const { result } = renderHook(() => usePremium(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Check types
      expect(typeof result.current.isPremium).toBe('boolean');
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(typeof result.current.isPurchasing).toBe('boolean');
      expect(typeof result.current.isIapAvailable).toBe('boolean');
      expect(typeof result.current.isExpoGo).toBe('boolean');
      expect(typeof result.current.purchasePremium).toBe('function');
      expect(typeof result.current.restorePurchases).toBe('function');
      expect(typeof result.current.getProductInfo).toBe('function');
    });
  });
});
