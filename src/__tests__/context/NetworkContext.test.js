/**
 * NetworkContext Tests
 *
 * Tests for network state management and offline functionality including:
 * - Network state monitoring
 * - Offline queue management
 * - Reconnection handling
 * - Connection type detection
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { NetworkProvider, useNetwork } from '../../context/NetworkContext';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Test component to access network context
const TestConsumer = ({ onNetwork }) => {
  const network = useNetwork();
  React.useEffect(() => {
    onNetwork(network);
  }, [network, onNetwork]);
  return (
    <Text testID="status">
      {network.isOffline ? 'offline' : 'online'}
    </Text>
  );
};

describe('NetworkContext', () => {
  let netInfoCallback = null;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup NetInfo mock
    NetInfo.addEventListener.mockImplementation((callback) => {
      netInfoCallback = callback;
      return jest.fn(); // unsubscribe
    });

    NetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    });

    // Setup AsyncStorage mock
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
  });

  describe('Network State Monitoring', () => {
    it('should initialize with connected state', async () => {
      const networkState = { current: null };

      render(
        <NetworkProvider>
          <TestConsumer onNetwork={(network) => { networkState.current = network; }} />
        </NetworkProvider>
      );

      await waitFor(() => {
        expect(networkState.current.isConnected).toBe(true);
        expect(networkState.current.isOffline).toBe(false);
      });
    });

    it('should detect when going offline', async () => {
      const networkState = { current: null };

      render(
        <NetworkProvider>
          <TestConsumer onNetwork={(network) => { networkState.current = network; }} />
        </NetworkProvider>
      );

      // Simulate going offline
      await act(async () => {
        netInfoCallback({
          isConnected: false,
          isInternetReachable: false,
          type: 'none',
        });
      });

      await waitFor(() => {
        expect(networkState.current.isOffline).toBe(true);
        expect(networkState.current.isConnected).toBe(false);
      });
    });

    it('should detect when coming back online', async () => {
      const networkState = { current: null };

      // Start offline
      NetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });

      render(
        <NetworkProvider>
          <TestConsumer onNetwork={(network) => { networkState.current = network; }} />
        </NetworkProvider>
      );

      // Simulate coming online
      await act(async () => {
        netInfoCallback({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi',
        });
      });

      await waitFor(() => {
        expect(networkState.current.isOffline).toBe(false);
        expect(networkState.current.isConnected).toBe(true);
      });
    });

    it('should detect connection type changes', async () => {
      const networkState = { current: null };

      render(
        <NetworkProvider>
          <TestConsumer onNetwork={(network) => { networkState.current = network; }} />
        </NetworkProvider>
      );

      await waitFor(() => {
        expect(networkState.current.isOnWifi).toBe(true);
      });

      // Switch to cellular
      await act(async () => {
        netInfoCallback({
          isConnected: true,
          isInternetReachable: true,
          type: 'cellular',
        });
      });

      await waitFor(() => {
        expect(networkState.current.isOnWifi).toBe(false);
        expect(networkState.current.isOnCellular).toBe(true);
      });
    });
  });

  describe('Offline Queue', () => {
    it('should queue actions when offline', async () => {
      const networkState = { current: null };

      render(
        <NetworkProvider>
          <TestConsumer onNetwork={(network) => { networkState.current = network; }} />
        </NetworkProvider>
      );

      await waitFor(() => {
        expect(networkState.current.queueOfflineAction).toBeDefined();
      });

      await act(async () => {
        networkState.current.queueOfflineAction('submitFeedback', [123, 1]);
      });

      await waitFor(() => {
        expect(networkState.current.offlineQueueCount).toBe(1);
      });
    });

    it('should persist queue to AsyncStorage', async () => {
      const networkState = { current: null };

      render(
        <NetworkProvider>
          <TestConsumer onNetwork={(network) => { networkState.current = network; }} />
        </NetworkProvider>
      );

      await waitFor(() => {
        expect(networkState.current.queueOfflineAction).toBeDefined();
      });

      await act(async () => {
        networkState.current.queueOfflineAction('submitFeedback', [123, 1]);
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@playbeacon_offline_queue',
          expect.any(String)
        );
      });
    });

    it('should restore queue from AsyncStorage on mount', async () => {
      const storedQueue = JSON.stringify([
        { id: '1', action: 'submitFeedback', args: [123, 1], timestamp: new Date().toISOString() },
      ]);
      AsyncStorage.getItem.mockResolvedValue(storedQueue);

      const networkState = { current: null };

      render(
        <NetworkProvider>
          <TestConsumer onNetwork={(network) => { networkState.current = network; }} />
        </NetworkProvider>
      );

      await waitFor(() => {
        expect(networkState.current.offlineQueueCount).toBe(1);
      });
    });

    it('should remove items from queue', async () => {
      const networkState = { current: null };

      render(
        <NetworkProvider>
          <TestConsumer onNetwork={(network) => { networkState.current = network; }} />
        </NetworkProvider>
      );

      await waitFor(() => {
        expect(networkState.current.queueOfflineAction).toBeDefined();
      });

      let actionId;
      await act(async () => {
        actionId = networkState.current.queueOfflineAction('submitFeedback', [123, 1]);
      });

      await waitFor(() => {
        expect(networkState.current.offlineQueueCount).toBe(1);
      });

      await act(async () => {
        networkState.current.removeFromQueue(actionId);
      });

      await waitFor(() => {
        expect(networkState.current.offlineQueueCount).toBe(0);
      });
    });

    it('should clear entire queue', async () => {
      const networkState = { current: null };

      render(
        <NetworkProvider>
          <TestConsumer onNetwork={(network) => { networkState.current = network; }} />
        </NetworkProvider>
      );

      await waitFor(() => {
        expect(networkState.current.queueOfflineAction).toBeDefined();
      });

      await act(async () => {
        networkState.current.queueOfflineAction('action1', []);
        networkState.current.queueOfflineAction('action2', []);
        networkState.current.queueOfflineAction('action3', []);
      });

      await waitFor(() => {
        expect(networkState.current.offlineQueueCount).toBe(3);
      });

      await act(async () => {
        networkState.current.clearOfflineQueue();
      });

      await waitFor(() => {
        expect(networkState.current.offlineQueueCount).toBe(0);
      });
    });
  });

  describe('Reconnection Callbacks', () => {
    it('should register reconnection callback', async () => {
      const networkState = { current: null };

      render(
        <NetworkProvider>
          <TestConsumer onNetwork={(network) => { networkState.current = network; }} />
        </NetworkProvider>
      );

      await waitFor(() => {
        expect(networkState.current.onReconnect).toBeDefined();
      });

      const callback = jest.fn();
      let unsubscribe;

      await act(async () => {
        unsubscribe = networkState.current.onReconnect(callback);
      });

      expect(typeof unsubscribe).toBe('function');
    });

    it('should call reconnection callbacks when coming back online', async () => {
      const networkState = { current: null };

      // Start offline
      NetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });

      render(
        <NetworkProvider>
          <TestConsumer onNetwork={(network) => { networkState.current = network; }} />
        </NetworkProvider>
      );

      // Simulate being offline first
      await act(async () => {
        netInfoCallback({
          isConnected: false,
          isInternetReachable: false,
          type: 'none',
        });
      });

      const reconnectCallback = jest.fn();

      await act(async () => {
        networkState.current.onReconnect(reconnectCallback);
      });

      // Now come back online
      await act(async () => {
        netInfoCallback({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi',
        });
      });

      await waitFor(() => {
        expect(reconnectCallback).toHaveBeenCalled();
      });
    });
  });

  describe('Manual Connection Check', () => {
    it('should check connection manually', async () => {
      const networkState = { current: null };

      render(
        <NetworkProvider>
          <TestConsumer onNetwork={(network) => { networkState.current = network; }} />
        </NetworkProvider>
      );

      await waitFor(() => {
        expect(networkState.current.checkConnection).toBeDefined();
      });

      NetInfo.fetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      });

      let isOnline;
      await act(async () => {
        isOnline = await networkState.current.checkConnection();
      });

      expect(isOnline).toBe(true);
      expect(NetInfo.fetch).toHaveBeenCalled();
    });

    it('should return false when offline', async () => {
      const networkState = { current: null };

      render(
        <NetworkProvider>
          <TestConsumer onNetwork={(network) => { networkState.current = network; }} />
        </NetworkProvider>
      );

      await waitFor(() => {
        expect(networkState.current.checkConnection).toBeDefined();
      });

      NetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });

      let isOnline;
      await act(async () => {
        isOnline = await networkState.current.checkConnection();
      });

      expect(isOnline).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null network state gracefully', async () => {
      const networkState = { current: null };

      render(
        <NetworkProvider>
          <TestConsumer onNetwork={(network) => { networkState.current = network; }} />
        </NetworkProvider>
      );

      // Simulate null values from NetInfo
      await act(async () => {
        netInfoCallback({
          isConnected: null,
          isInternetReachable: null,
          type: null,
        });
      });

      await waitFor(() => {
        // Should default to connected/reachable
        expect(networkState.current.isConnected).toBe(true);
        expect(networkState.current.connectionType).toBe('unknown');
      });
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const networkState = { current: null };

      // Should not throw
      render(
        <NetworkProvider>
          <TestConsumer onNetwork={(network) => { networkState.current = network; }} />
        </NetworkProvider>
      );

      await waitFor(() => {
        expect(networkState.current).not.toBeNull();
        expect(networkState.current.offlineQueueCount).toBe(0);
      });
    });

    it('should handle reconnection callback errors gracefully', async () => {
      const networkState = { current: null };

      // Start offline
      NetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });

      render(
        <NetworkProvider>
          <TestConsumer onNetwork={(network) => { networkState.current = network; }} />
        </NetworkProvider>
      );

      await act(async () => {
        netInfoCallback({
          isConnected: false,
          isInternetReachable: false,
          type: 'none',
        });
      });

      // Register a callback that throws
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const successCallback = jest.fn();

      await act(async () => {
        networkState.current.onReconnect(errorCallback);
        networkState.current.onReconnect(successCallback);
      });

      // Coming back online should not break due to error callback
      await act(async () => {
        netInfoCallback({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi',
        });
      });

      // Both callbacks should be called despite error
      await waitFor(() => {
        expect(errorCallback).toHaveBeenCalled();
        expect(successCallback).toHaveBeenCalled();
      });
    });
  });
});
