/**
 * Network Context Provider
 *
 * Provides network state and offline mode functionality throughout the app.
 * Includes:
 * - Real-time network status monitoring
 * - Connection type detection
 * - Offline queue for deferred API calls
 * - Reconnection callbacks
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';

const NetworkContext = createContext({});

const OFFLINE_QUEUE_KEY = '@playbeacon_offline_queue';

export const NetworkProvider = ({ children }) => {
  const [networkState, setNetworkState] = useState({
    isConnected: true,
    isInternetReachable: true,
    connectionType: 'unknown',
  });
  const [offlineQueue, setOfflineQueue] = useState([]);
  const reconnectCallbacks = useRef([]);
  const wasOffline = useRef(false);

  // Derived state
  const isOffline = !networkState.isConnected || networkState.isInternetReachable === false;
  const isOnWifi = networkState.connectionType === 'wifi';
  const isOnCellular = networkState.connectionType === 'cellular';

  // Load offline queue from storage on mount
  useEffect(() => {
    const loadOfflineQueue = async () => {
      try {
        const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
        if (stored) {
          setOfflineQueue(JSON.parse(stored));
        }
      } catch (error) {
        logger.error('Failed to load offline queue:', error);
      }
    };
    loadOfflineQueue();
  }, []);

  // Save offline queue to storage when it changes
  useEffect(() => {
    const saveOfflineQueue = async () => {
      try {
        await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(offlineQueue));
      } catch (error) {
        logger.error('Failed to save offline queue:', error);
      }
    };
    saveOfflineQueue();
  }, [offlineQueue]);

  // Subscribe to network state changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const newState = {
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable ?? true,
        connectionType: state.type || 'unknown',
      };

      setNetworkState(newState);

      // Check if we just came back online
      const nowOnline = newState.isConnected && newState.isInternetReachable !== false;
      if (wasOffline.current && nowOnline) {
        // Trigger reconnection callbacks
        reconnectCallbacks.current.forEach(callback => {
          try {
            callback();
          } catch (error) {
            logger.error('Reconnection callback error:', error);
          }
        });

        // Process offline queue
        processOfflineQueue();
      }

      wasOffline.current = !nowOnline;
    });

    // Get initial state
    NetInfo.fetch().then(state => {
      setNetworkState({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable ?? true,
        connectionType: state.type || 'unknown',
      });
      wasOffline.current = !state.isConnected || state.isInternetReachable === false;
    });

    return () => unsubscribe();
  }, []);

  /**
   * Process queued offline actions when connection is restored
   */
  const processOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;

    logger.log(`Processing ${offlineQueue.length} queued offline actions`);

    const remainingQueue = [];

    for (const item of offlineQueue) {
      try {
        // Execute the stored action
        if (item.action && typeof item.action === 'string') {
          // Import api dynamically to avoid circular dependency
          const { api } = await import('../services/api');
          if (api[item.action]) {
            await api[item.action](...(item.args || []));
            logger.log(`Processed offline action: ${item.action}`);
          }
        }
      } catch (error) {
        logger.error(`Failed to process offline action: ${item.action}`, error);
        // Keep failed items in queue for retry
        remainingQueue.push(item);
      }
    }

    setOfflineQueue(remainingQueue);
  }, [offlineQueue]);

  /**
   * Add an action to the offline queue
   */
  const queueOfflineAction = useCallback((action, args = []) => {
    const queueItem = {
      id: Date.now().toString(),
      action,
      args,
      timestamp: new Date().toISOString(),
    };

    setOfflineQueue(prev => [...prev, queueItem]);
    logger.log(`Queued offline action: ${action}`);

    return queueItem.id;
  }, []);

  /**
   * Remove an action from the offline queue
   */
  const removeFromQueue = useCallback((actionId) => {
    setOfflineQueue(prev => prev.filter(item => item.id !== actionId));
  }, []);

  /**
   * Clear the entire offline queue
   */
  const clearOfflineQueue = useCallback(() => {
    setOfflineQueue([]);
  }, []);

  /**
   * Register a callback to be called when connection is restored
   */
  const onReconnect = useCallback((callback) => {
    reconnectCallbacks.current.push(callback);

    // Return cleanup function
    return () => {
      reconnectCallbacks.current = reconnectCallbacks.current.filter(cb => cb !== callback);
    };
  }, []);

  /**
   * Manually trigger a network check
   */
  const checkConnection = useCallback(async () => {
    const state = await NetInfo.fetch();
    setNetworkState({
      isConnected: state.isConnected ?? true,
      isInternetReachable: state.isInternetReachable ?? true,
      connectionType: state.type || 'unknown',
    });
    return state.isConnected && state.isInternetReachable !== false;
  }, []);

  return (
    <NetworkContext.Provider
      value={{
        // State
        isOffline,
        isConnected: networkState.isConnected,
        isInternetReachable: networkState.isInternetReachable,
        connectionType: networkState.connectionType,
        isOnWifi,
        isOnCellular,

        // Offline queue
        offlineQueue,
        queueOfflineAction,
        removeFromQueue,
        clearOfflineQueue,
        offlineQueueCount: offlineQueue.length,

        // Actions
        onReconnect,
        checkConnection,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);

export default NetworkContext;
