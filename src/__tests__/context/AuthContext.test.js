/**
 * AuthContext Tests
 *
 * Tests for authentication flows including:
 * - Anonymous authentication
 * - Google sign-in linking
 * - Account state management
 * - COPPA compliance
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import {
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  GoogleAuthProvider,
  linkWithCredential,
  signInWithCredential,
} from 'firebase/auth';
import { getDoc, setDoc, updateDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';

// Test component to access auth context
const TestConsumer = ({ onAuth }) => {
  const auth = useAuth();
  React.useEffect(() => {
    onAuth(auth);
  }, [auth, onAuth]);
  return <Text testID="loading">{auth.loading ? 'loading' : 'ready'}</Text>;
};

describe('AuthContext', () => {
  let mockAuthCallback = null;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    onAuthStateChanged.mockImplementation((auth, callback) => {
      mockAuthCallback = callback;
      return jest.fn(); // unsubscribe
    });

    signInAnonymously.mockResolvedValue({
      user: { uid: 'anon-123', isAnonymous: true },
    });

    signOut.mockResolvedValue();

    getDoc.mockResolvedValue({
      exists: () => false,
      data: () => null,
    });

    setDoc.mockResolvedValue();
    updateDoc.mockResolvedValue();

    SecureStore.getItemAsync.mockResolvedValue(null);
    SecureStore.setItemAsync.mockResolvedValue();
    SecureStore.deleteItemAsync.mockResolvedValue();
  });

  describe('Anonymous Authentication', () => {
    it('should initialize with loading state', async () => {
      const authState = { current: null };

      render(
        <AuthProvider>
          <TestConsumer onAuth={(auth) => { authState.current = auth; }} />
        </AuthProvider>
      );

      expect(authState.current.loading).toBe(true);
    });

    it('should sign in anonymously when no user exists', async () => {
      render(
        <AuthProvider>
          <TestConsumer onAuth={() => {}} />
        </AuthProvider>
      );

      // Simulate Firebase reporting no user
      await act(async () => {
        mockAuthCallback(null);
      });

      await waitFor(() => {
        expect(signInAnonymously).toHaveBeenCalled();
      });
    });

    it('should set user state when auth state changes', async () => {
      const authState = { current: null };

      render(
        <AuthProvider>
          <TestConsumer onAuth={(auth) => { authState.current = auth; }} />
        </AuthProvider>
      );

      const mockUser = { uid: 'test-123', isAnonymous: true };

      await act(async () => {
        mockAuthCallback(mockUser);
      });

      await waitFor(() => {
        expect(authState.current.user).toEqual(mockUser);
        expect(authState.current.loading).toBe(false);
      });
    });

    it('should fallback to anonymous auth on error', async () => {
      SecureStore.getItemAsync.mockRejectedValueOnce(new Error('Storage error'));

      render(
        <AuthProvider>
          <TestConsumer onAuth={() => {}} />
        </AuthProvider>
      );

      await act(async () => {
        mockAuthCallback(null);
      });

      await waitFor(() => {
        expect(signInAnonymously).toHaveBeenCalled();
      });
    });
  });

  describe('User Document Management', () => {
    it('should create user document for new users', async () => {
      getDoc.mockResolvedValue({
        exists: () => false,
      });

      render(
        <AuthProvider>
          <TestConsumer onAuth={() => {}} />
        </AuthProvider>
      );

      await act(async () => {
        mockAuthCallback({ uid: 'new-user-123', isAnonymous: true });
      });

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalled();
      });
    });

    it('should not create duplicate user documents', async () => {
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          premium: false,
          linkedGoogle: false,
        }),
      });

      render(
        <AuthProvider>
          <TestConsumer onAuth={() => {}} />
        </AuthProvider>
      );

      await act(async () => {
        mockAuthCallback({ uid: 'existing-user-123', isAnonymous: true });
      });

      await waitFor(() => {
        expect(setDoc).not.toHaveBeenCalled();
      });
    });
  });

  describe('Account Status', () => {
    it('should return anonymous status for anonymous users', async () => {
      const authState = { current: null };

      render(
        <AuthProvider>
          <TestConsumer onAuth={(auth) => { authState.current = auth; }} />
        </AuthProvider>
      );

      await act(async () => {
        mockAuthCallback({ uid: 'anon-123', isAnonymous: true });
      });

      await waitFor(() => {
        const status = authState.current.getAccountStatus();
        expect(status.type).toBe('anonymous');
        expect(status.label).toBe('Anonymous');
      });
    });

    it('should return google status for linked accounts', async () => {
      const authState = { current: null };

      render(
        <AuthProvider>
          <TestConsumer onAuth={(auth) => { authState.current = auth; }} />
        </AuthProvider>
      );

      await act(async () => {
        mockAuthCallback({
          uid: 'google-123',
          isAnonymous: false,
          email: 'parent@example.com',
        });
      });

      await waitFor(() => {
        const status = authState.current.getAccountStatus();
        expect(status.type).toBe('google');
        expect(status.label).toBe('Parent Account Connected');
      });
    });

    it('should return none status when no user', async () => {
      const authState = { current: null };

      render(
        <AuthProvider>
          <TestConsumer onAuth={(auth) => { authState.current = auth; }} />
        </AuthProvider>
      );

      // Don't call mockAuthCallback - user remains null
      await waitFor(() => {
        const status = authState.current.getAccountStatus();
        expect(status.type).toBe('none');
      });
    });
  });

  describe('Google Account Linking', () => {
    it('should prevent linking when no user exists', async () => {
      const authState = { current: null };

      render(
        <AuthProvider>
          <TestConsumer onAuth={(auth) => { authState.current = auth; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authState.current.linkWithGoogle).toBeDefined();
      });

      await expect(authState.current.linkWithGoogle()).rejects.toThrow('No user to link');
    });

    it('should prevent linking already linked accounts', async () => {
      const authState = { current: null };

      render(
        <AuthProvider>
          <TestConsumer onAuth={(auth) => { authState.current = auth; }} />
        </AuthProvider>
      );

      await act(async () => {
        mockAuthCallback({ uid: 'google-123', isAnonymous: false });
      });

      await expect(authState.current.linkWithGoogle()).rejects.toThrow(
        'Account is already linked to Google'
      );
    });
  });

  describe('Logout', () => {
    it('should sign out and clear stored data', async () => {
      const authState = { current: null };

      render(
        <AuthProvider>
          <TestConsumer onAuth={(auth) => { authState.current = auth; }} />
        </AuthProvider>
      );

      await act(async () => {
        mockAuthCallback({ uid: 'test-123', isAnonymous: true });
      });

      await act(async () => {
        await authState.current.logout();
      });

      expect(signOut).toHaveBeenCalled();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('playbeacon_auth_uid');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('playbeacon_linked_google');
    });
  });

  describe('Linked Status Persistence', () => {
    it('should restore linked status from SecureStore', async () => {
      SecureStore.getItemAsync.mockImplementation((key) => {
        if (key === 'playbeacon_linked_google') {
          return Promise.resolve('true');
        }
        return Promise.resolve(null);
      });

      const authState = { current: null };

      render(
        <AuthProvider>
          <TestConsumer onAuth={(auth) => { authState.current = auth; }} />
        </AuthProvider>
      );

      await act(async () => {
        mockAuthCallback({ uid: 'test-123', isAnonymous: false });
      });

      await waitFor(() => {
        expect(authState.current.linkedGoogle).toBe(true);
      });
    });
  });

  describe('COPPA Compliance', () => {
    it('should not store email in user document', async () => {
      getDoc.mockResolvedValue({
        exists: () => false,
      });

      render(
        <AuthProvider>
          <TestConsumer onAuth={() => {}} />
        </AuthProvider>
      );

      await act(async () => {
        mockAuthCallback({
          uid: 'user-123',
          isAnonymous: true,
          email: 'should-not-store@example.com',
        });
      });

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalled();
      });

      const setDocCall = setDoc.mock.calls[0];
      const userData = setDocCall[1];

      // Verify email is not stored in Firestore
      expect(userData.email).toBeUndefined();
    });

    it('should only store anonymous user identifiers', async () => {
      getDoc.mockResolvedValue({
        exists: () => false,
      });

      render(
        <AuthProvider>
          <TestConsumer onAuth={() => {}} />
        </AuthProvider>
      );

      await act(async () => {
        mockAuthCallback({ uid: 'user-123', isAnonymous: true });
      });

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalled();
      });

      const setDocCall = setDoc.mock.calls[0];
      const userData = setDocCall[1];

      // Verify only safe fields are stored
      const allowedFields = ['createdAt', 'premium', 'linkedGoogle', 'deviceId'];
      const storedFields = Object.keys(userData);

      storedFields.forEach(field => {
        expect(allowedFields).toContain(field);
      });
    });
  });
});
