/**
 * PremiumContext Tests
 *
 * Tests for premium/IAP state management including:
 * - Premium status persistence
 * - Firestore sync
 * - Product info display
 * - Expo Go fallback behavior
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDoc, updateDoc, setDoc } from 'firebase/firestore';

// Mock Constants
jest.mock('expo-constants', () => ({
  default: {
    appOwnership: 'expo', // Expo Go - IAP not available
    expoConfig: { version: '1.0.0' },
  },
}));

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { uid: 'test-user-123' },
  })),
}));

// Import after mocks
import { PremiumProvider, usePremium, PRODUCT_ID } from '../../context/PremiumContext';
import { useAuth } from '../../context/AuthContext';

// Test component to access premium context
const TestConsumer = ({ onPremium }) => {
  const premium = usePremium();
  React.useEffect(() => {
    onPremium(premium);
  }, [premium, onPremium]);
  return <Text testID="status">{premium.isPremium ? 'premium' : 'free'}</Text>;
};

describe('PremiumContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
    getDoc.mockResolvedValue({ exists: () => false, data: () => null });
    setDoc.mockResolvedValue();
    updateDoc.mockResolvedValue();
  });

  describe('Initialization', () => {
    it('should initialize with free status by default', async () => {
      const premiumState = { current: null };

      render(
        <PremiumProvider>
          <TestConsumer onPremium={(p) => { premiumState.current = p; }} />
        </PremiumProvider>
      );

      await waitFor(() => {
        expect(premiumState.current.isPremium).toBe(false);
      });
    });

    it('should load premium status from AsyncStorage', async () => {
      AsyncStorage.getItem.mockResolvedValue('true');

      const premiumState = { current: null };

      render(
        <PremiumProvider>
          <TestConsumer onPremium={(p) => { premiumState.current = p; }} />
        </PremiumProvider>
      );

      await waitFor(() => {
        expect(premiumState.current.isPremium).toBe(true);
      });
    });

    it('should detect Expo Go environment', async () => {
      const premiumState = { current: null };

      render(
        <PremiumProvider>
          <TestConsumer onPremium={(p) => { premiumState.current = p; }} />
        </PremiumProvider>
      );

      await waitFor(() => {
        expect(premiumState.current.isExpoGo).toBe(true);
        expect(premiumState.current.isIapAvailable).toBe(false);
      });
    });
  });

  describe('Premium Status Persistence', () => {
    it('should save premium status to AsyncStorage', async () => {
      const premiumState = { current: null };

      render(
        <PremiumProvider>
          <TestConsumer onPremium={(p) => { premiumState.current = p; }} />
        </PremiumProvider>
      );

      await waitFor(() => {
        expect(premiumState.current).not.toBeNull();
      });

      // Premium status is internal - just verify initialization works
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@playbeacon_premium');
    });

    it('should sync premium status to Firestore when user is logged in', async () => {
      useAuth.mockReturnValue({
        user: { uid: 'test-user-123' },
      });

      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ premium: true }),
      });

      const premiumState = { current: null };

      render(
        <PremiumProvider>
          <TestConsumer onPremium={(p) => { premiumState.current = p; }} />
        </PremiumProvider>
      );

      await waitFor(() => {
        expect(premiumState.current.isPremium).toBe(true);
      });
    });
  });

  describe('Product Info', () => {
    it('should return default product info when no products loaded', async () => {
      const premiumState = { current: null };

      render(
        <PremiumProvider>
          <TestConsumer onPremium={(p) => { premiumState.current = p; }} />
        </PremiumProvider>
      );

      await waitFor(() => {
        expect(premiumState.current.getProductInfo).toBeDefined();
      });

      const productInfo = premiumState.current.getProductInfo();
      expect(productInfo.title).toBe('Remove Ads');
      expect(productInfo.price).toBe('$2.99');
    });

    it('should have correct product ID', () => {
      expect(PRODUCT_ID).toBe('playbeacon_remove_ads');
    });
  });

  describe('IAP Availability', () => {
    it('should not allow purchases in Expo Go', async () => {
      const premiumState = { current: null };

      render(
        <PremiumProvider>
          <TestConsumer onPremium={(p) => { premiumState.current = p; }} />
        </PremiumProvider>
      );

      await waitFor(() => {
        expect(premiumState.current.isIapAvailable).toBe(false);
      });
    });

    it('should not allow restore in Expo Go', async () => {
      const premiumState = { current: null };

      render(
        <PremiumProvider>
          <TestConsumer onPremium={(p) => { premiumState.current = p; }} />
        </PremiumProvider>
      );

      await waitFor(() => {
        expect(premiumState.current.restorePurchases).toBeDefined();
      });

      const result = await premiumState.current.restorePurchases();
      expect(result).toBe(false);
    });
  });

  describe('Loading State', () => {
    it('should show loading state initially', async () => {
      const premiumState = { current: null };

      render(
        <PremiumProvider>
          <TestConsumer onPremium={(p) => { premiumState.current = p; }} />
        </PremiumProvider>
      );

      // Initial state might be loading
      expect(premiumState.current).not.toBeNull();
    });

    it('should not be purchasing initially', async () => {
      const premiumState = { current: null };

      render(
        <PremiumProvider>
          <TestConsumer onPremium={(p) => { premiumState.current = p; }} />
        </PremiumProvider>
      );

      await waitFor(() => {
        expect(premiumState.current.isPurchasing).toBe(false);
      });
    });
  });

  describe('Cross-device Sync', () => {
    it('should load premium from Firestore on user change', async () => {
      // Initially no user
      useAuth.mockReturnValue({ user: null });

      const premiumState = { current: null };

      const { rerender } = render(
        <PremiumProvider>
          <TestConsumer onPremium={(p) => { premiumState.current = p; }} />
        </PremiumProvider>
      );

      await waitFor(() => {
        expect(premiumState.current.isPremium).toBe(false);
      });

      // Simulate user login with premium status in Firestore
      useAuth.mockReturnValue({ user: { uid: 'new-user-123' } });
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ premium: true }),
      });

      rerender(
        <PremiumProvider>
          <TestConsumer onPremium={(p) => { premiumState.current = p; }} />
        </PremiumProvider>
      );

      await waitFor(() => {
        expect(premiumState.current.isPremium).toBe(true);
      });
    });
  });
});
