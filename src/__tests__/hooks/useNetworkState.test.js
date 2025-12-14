/**
 * useNetworkState Hook Tests
 *
 * Tests for network connectivity monitoring hook.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

import { useNetworkState } from '../../hooks/useNetworkState';

describe('useNetworkState Hook', () => {
  let mockUnsubscribe;
  let mockListener;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUnsubscribe = jest.fn();

    // Capture the listener when addEventListener is called
    NetInfo.addEventListener.mockImplementation((listener) => {
      mockListener = listener;
      return mockUnsubscribe;
    });

    // Default fetch returns connected
    NetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
  });

  describe('Initial State', () => {
    it('should return isConnected as true by default', () => {
      const { result } = renderHook(() => useNetworkState());

      expect(result.current.isConnected).toBe(true);
    });

    it('should return isInternetReachable as true by default', () => {
      const { result } = renderHook(() => useNetworkState());

      expect(result.current.isInternetReachable).toBe(true);
    });

    it('should return isOffline as false when connected', () => {
      const { result } = renderHook(() => useNetworkState());

      expect(result.current.isOffline).toBe(false);
    });
  });

  describe('NetInfo Integration', () => {
    it('should subscribe to network state changes on mount', () => {
      renderHook(() => useNetworkState());

      expect(NetInfo.addEventListener).toHaveBeenCalledTimes(1);
      expect(NetInfo.addEventListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should fetch initial network state on mount', () => {
      renderHook(() => useNetworkState());

      expect(NetInfo.fetch).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from network state on unmount', () => {
      const { unmount } = renderHook(() => useNetworkState());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('Network State Updates', () => {
    it('should update isConnected when network changes', async () => {
      const { result } = renderHook(() => useNetworkState());

      // Simulate network disconnection
      act(() => {
        mockListener({
          isConnected: false,
          isInternetReachable: false,
        });
      });

      expect(result.current.isConnected).toBe(false);
    });

    it('should update isInternetReachable when network changes', async () => {
      const { result } = renderHook(() => useNetworkState());

      // Simulate internet becoming unreachable
      act(() => {
        mockListener({
          isConnected: true,
          isInternetReachable: false,
        });
      });

      expect(result.current.isInternetReachable).toBe(false);
    });

    it('should set isOffline to true when not connected', async () => {
      const { result } = renderHook(() => useNetworkState());

      act(() => {
        mockListener({
          isConnected: false,
          isInternetReachable: true,
        });
      });

      expect(result.current.isOffline).toBe(true);
    });

    it('should set isOffline to true when internet is not reachable', async () => {
      const { result } = renderHook(() => useNetworkState());

      act(() => {
        mockListener({
          isConnected: true,
          isInternetReachable: false,
        });
      });

      expect(result.current.isOffline).toBe(true);
    });

    it('should set isOffline to false when connected and internet is reachable', async () => {
      const { result } = renderHook(() => useNetworkState());

      // First disconnect
      act(() => {
        mockListener({
          isConnected: false,
          isInternetReachable: false,
        });
      });

      expect(result.current.isOffline).toBe(true);

      // Then reconnect
      act(() => {
        mockListener({
          isConnected: true,
          isInternetReachable: true,
        });
      });

      expect(result.current.isOffline).toBe(false);
    });
  });

  describe('Initial Fetch', () => {
    it('should set connected state from initial fetch', async () => {
      NetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const { result } = renderHook(() => useNetworkState());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });
    });

    it('should set internet reachable state from initial fetch', async () => {
      NetInfo.fetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: false,
      });

      const { result } = renderHook(() => useNetworkState());

      await waitFor(() => {
        expect(result.current.isInternetReachable).toBe(false);
      });
    });
  });

  describe('Null/Undefined Handling', () => {
    it('should default isConnected to true when null', async () => {
      const { result } = renderHook(() => useNetworkState());

      act(() => {
        mockListener({
          isConnected: null,
          isInternetReachable: true,
        });
      });

      expect(result.current.isConnected).toBe(true);
    });

    it('should default isInternetReachable to true when null', async () => {
      const { result } = renderHook(() => useNetworkState());

      act(() => {
        mockListener({
          isConnected: true,
          isInternetReachable: null,
        });
      });

      expect(result.current.isInternetReachable).toBe(true);
    });

    it('should default isConnected to true when undefined', async () => {
      const { result } = renderHook(() => useNetworkState());

      act(() => {
        mockListener({
          isConnected: undefined,
          isInternetReachable: true,
        });
      });

      expect(result.current.isConnected).toBe(true);
    });

    it('should default isInternetReachable to true when undefined', async () => {
      const { result } = renderHook(() => useNetworkState());

      act(() => {
        mockListener({
          isConnected: true,
          isInternetReachable: undefined,
        });
      });

      expect(result.current.isInternetReachable).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid network state changes', async () => {
      const { result } = renderHook(() => useNetworkState());

      // Simulate rapid toggling
      act(() => {
        mockListener({ isConnected: false, isInternetReachable: false });
        mockListener({ isConnected: true, isInternetReachable: true });
        mockListener({ isConnected: false, isInternetReachable: false });
        mockListener({ isConnected: true, isInternetReachable: true });
      });

      // Should reflect final state
      expect(result.current.isConnected).toBe(true);
      expect(result.current.isInternetReachable).toBe(true);
      expect(result.current.isOffline).toBe(false);
    });

    // Note: The hook doesn't currently handle fetch errors with a .catch()
    // If error handling is needed, the hook would need to be updated
    // For now, we trust that NetInfo.fetch will typically resolve
  });

  describe('Return Value Structure', () => {
    it('should return an object with all expected properties', () => {
      const { result } = renderHook(() => useNetworkState());

      expect(result.current).toHaveProperty('isConnected');
      expect(result.current).toHaveProperty('isInternetReachable');
      expect(result.current).toHaveProperty('isOffline');
    });

    it('should return boolean values for all properties', () => {
      const { result } = renderHook(() => useNetworkState());

      expect(typeof result.current.isConnected).toBe('boolean');
      expect(typeof result.current.isInternetReachable).toBe('boolean');
      expect(typeof result.current.isOffline).toBe('boolean');
    });
  });
});
