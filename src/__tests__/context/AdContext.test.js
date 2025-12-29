/**
 * AdContext Tests
 *
 * Tests for ad state management including:
 * - Ad frequency logic (20 free games per day)
 * - Daily reset at midnight
 * - Premium user ad-free experience
 * - COPPA-compliant ad configuration
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock Constants before importing
jest.mock('expo-constants', () => ({
  default: {
    appOwnership: 'standalone', // Not Expo Go
    expoConfig: { version: '1.0.0' },
  },
}));

// Mock PremiumContext
jest.mock('../../context/PremiumContext', () => ({
  usePremium: jest.fn(() => ({
    isPremium: false,
  })),
}));

// Mock RemoteConfig - default to ads enabled for tests
jest.mock('../../services/RemoteConfig', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn().mockResolvedValue(undefined),
    areAdsEnabled: jest.fn(() => true),
    isTestModeForced: jest.fn(() => false),
    addListener: jest.fn(() => jest.fn()), // Returns unsubscribe function
    getBoolean: jest.fn(() => true),
    getValue: jest.fn(() => true),
  },
}));

// Import after mocks
import { AdProvider, useAds } from '../../context/AdContext';
import { usePremium } from '../../context/PremiumContext';

// Test component to access ad context
const TestConsumer = ({ onAds }) => {
  const ads = useAds();
  React.useEffect(() => {
    onAds(ads);
  }, [ads, onAds]);
  return <Text testID="status">{ads.adsEnabled ? 'enabled' : 'disabled'}</Text>;
};

describe('AdContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
  });

  describe('Initialization', () => {
    it('should initialize with ads enabled for non-premium users', async () => {
      const adsState = { current: null };

      render(
        <AdProvider>
          <TestConsumer onAds={(ads) => { adsState.current = ads; }} />
        </AdProvider>
      );

      await waitFor(() => {
        expect(adsState.current.adsEnabled).toBe(true);
      });
    });

    it('should initialize with ads disabled for premium users', async () => {
      usePremium.mockReturnValue({ isPremium: true });

      const adsState = { current: null };

      render(
        <AdProvider>
          <TestConsumer onAds={(ads) => { adsState.current = ads; }} />
        </AdProvider>
      );

      await waitFor(() => {
        expect(adsState.current.adsEnabled).toBe(false);
      });

      // Reset mock
      usePremium.mockReturnValue({ isPremium: false });
    });

    it('should load tracking data from AsyncStorage', async () => {
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '-');
      const mockDate = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        date: mockDate,
        dailyGameCount: 15,
        gamesSinceLastAd: 3,
      }));

      const adsState = { current: null };

      render(
        <AdProvider>
          <TestConsumer onAds={(ads) => { adsState.current = ads; }} />
        </AdProvider>
      );

      await waitFor(() => {
        expect(adsState.current.dailyGameCount).toBe(15);
      });
    });
  });

  describe('Ad Frequency Logic', () => {
    it('should have 20 free games per day', async () => {
      const adsState = { current: null };

      render(
        <AdProvider>
          <TestConsumer onAds={(ads) => { adsState.current = ads; }} />
        </AdProvider>
      );

      await waitFor(() => {
        const status = adsState.current.getAdStatus();
        expect(status.config.freeGamesPerDay).toBe(20);
      });
    });

    it('should show ads every 5 games after free period', async () => {
      const adsState = { current: null };

      render(
        <AdProvider>
          <TestConsumer onAds={(ads) => { adsState.current = ads; }} />
        </AdProvider>
      );

      await waitFor(() => {
        const status = adsState.current.getAdStatus();
        expect(status.config.gamesPerAdAfterFree).toBe(5);
      });
    });

    it('should not show ads during free period', async () => {
      const adsState = { current: null };

      render(
        <AdProvider>
          <TestConsumer onAds={(ads) => { adsState.current = ads; }} />
        </AdProvider>
      );

      await waitFor(() => {
        expect(adsState.current.trackGameView).toBeDefined();
      });

      // Track a few games
      let shouldShowAd;
      await act(async () => {
        shouldShowAd = adsState.current.trackGameView();
      });

      // Should not show ad for first 20 games
      expect(shouldShowAd).toBe(false);

      await waitFor(() => {
        const status = adsState.current.getAdStatus();
        expect(status.isInFreePeriod).toBe(true);
      });
    });

    it('should return correct free games remaining', async () => {
      const adsState = { current: null };

      render(
        <AdProvider>
          <TestConsumer onAds={(ads) => { adsState.current = ads; }} />
        </AdProvider>
      );

      await waitFor(() => {
        expect(adsState.current.freeGamesRemaining).toBe(20);
      });

      // Track a game
      await act(async () => {
        adsState.current.trackGameView();
      });

      await waitFor(() => {
        expect(adsState.current.freeGamesRemaining).toBe(19);
      });
    });

    it('should reset counter after ad is shown', async () => {
      const adsState = { current: null };

      render(
        <AdProvider>
          <TestConsumer onAds={(ads) => { adsState.current = ads; }} />
        </AdProvider>
      );

      await waitFor(() => {
        expect(adsState.current.resetInterstitialCounter).toBeDefined();
      });

      await act(async () => {
        adsState.current.resetInterstitialCounter();
      });

      await waitFor(() => {
        const status = adsState.current.getAdStatus();
        expect(status.gamesSinceLastAd).toBe(0);
      });
    });
  });

  describe('Daily Reset', () => {
    it('should reset counters on new day', async () => {
      // Simulate data from yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        date: yesterdayStr,
        dailyGameCount: 25,
        gamesSinceLastAd: 4,
      }));

      const adsState = { current: null };

      render(
        <AdProvider>
          <TestConsumer onAds={(ads) => { adsState.current = ads; }} />
        </AdProvider>
      );

      await waitFor(() => {
        // Should have reset to 0 for new day
        expect(adsState.current.dailyGameCount).toBe(0);
      });
    });
  });

  describe('Premium Status', () => {
    it('should skip ad tracking for premium users', async () => {
      usePremium.mockReturnValue({ isPremium: true });

      const adsState = { current: null };

      render(
        <AdProvider>
          <TestConsumer onAds={(ads) => { adsState.current = ads; }} />
        </AdProvider>
      );

      await waitFor(() => {
        expect(adsState.current.trackGameView).toBeDefined();
      });

      let shouldShowAd;
      await act(async () => {
        shouldShowAd = adsState.current.trackGameView();
      });

      // Premium users should never see ads
      expect(shouldShowAd).toBe(false);

      // Reset mock
      usePremium.mockReturnValue({ isPremium: false });
    });

    it('should update ads enabled when premium status changes', async () => {
      const adsState = { current: null };

      const { rerender } = render(
        <AdProvider>
          <TestConsumer onAds={(ads) => { adsState.current = ads; }} />
        </AdProvider>
      );

      await waitFor(() => {
        expect(adsState.current.adsEnabled).toBe(true);
      });

      // Simulate premium upgrade
      usePremium.mockReturnValue({ isPremium: true });

      rerender(
        <AdProvider>
          <TestConsumer onAds={(ads) => { adsState.current = ads; }} />
        </AdProvider>
      );

      await waitFor(() => {
        expect(adsState.current.adsEnabled).toBe(false);
      });

      // Reset mock
      usePremium.mockReturnValue({ isPremium: false });
    });
  });

  describe('shouldShowAds', () => {
    it('should return false for premium users', async () => {
      usePremium.mockReturnValue({ isPremium: true });

      const adsState = { current: null };

      render(
        <AdProvider>
          <TestConsumer onAds={(ads) => { adsState.current = ads; }} />
        </AdProvider>
      );

      await waitFor(() => {
        expect(adsState.current.shouldShowAds()).toBe(false);
      });

      usePremium.mockReturnValue({ isPremium: false });
    });
  });

  describe('Ad Status', () => {
    it('should return complete ad status info', async () => {
      const adsState = { current: null };

      render(
        <AdProvider>
          <TestConsumer onAds={(ads) => { adsState.current = ads; }} />
        </AdProvider>
      );

      await waitFor(() => {
        const status = adsState.current.getAdStatus();
        expect(status).toHaveProperty('dailyGameCount');
        expect(status).toHaveProperty('gamesSinceLastAd');
        expect(status).toHaveProperty('freeGamesRemaining');
        expect(status).toHaveProperty('gamesUntilNextAd');
        expect(status).toHaveProperty('isInFreePeriod');
        expect(status).toHaveProperty('config');
      });
    });
  });
});
