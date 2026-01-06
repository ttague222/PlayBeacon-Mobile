/**
 * Auth Context Provider
 *
 * Implements anonymous-first authentication with optional Google sign-in.
 * COPPA-compliant: No email/password collection, Google sign-in is parent-gated.
 *
 * Key features:
 * - Auto-login with Firebase Anonymous Auth on app launch
 * - Optional Google sign-in (parent only) to sync data across devices
 * - Account linking from anonymous to Google without data loss
 * - Premium status and user data merging on account link
 */

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  linkWithCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { setUser as setSentryUser } from '../config/sentry';
import logger from '../utils/logger';

WebBrowser.maybeCompleteAuthSession();

// SecureStore keys
const AUTH_UID_KEY = 'playbeacon_auth_uid';
const LINKED_GOOGLE_KEY = 'playbeacon_linked_google';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLinkingAccount, setIsLinkingAccount] = useState(false);
  const [linkedGoogle, setLinkedGoogle] = useState(false);

  // Google OAuth configuration - uses platform-specific client IDs like PlayNxt
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
    scopes: ['profile', 'email'],
  });

  /**
   * Initialize or restore anonymous session
   */
  const initializeAuth = useCallback(async () => {
    try {
      // Read stored values in parallel (faster startup)
      const [, storedLinkedGoogle] = await Promise.all([
        SecureStore.getItemAsync(AUTH_UID_KEY).catch(() => null),
        SecureStore.getItemAsync(LINKED_GOOGLE_KEY).catch(() => null),
      ]);

      if (storedLinkedGoogle === 'true') {
        setLinkedGoogle(true);
      }

      // If there's no current user, sign in anonymously
      if (!auth.currentUser) {
        logger.log('No current user, signing in anonymously...');
        await signInAnonymously(auth);
      }
    } catch (error) {
      logger.error('Auth initialization error:', error);
      // Fallback: try anonymous sign-in
      try {
        await signInAnonymously(auth);
      } catch (fallbackError) {
        logger.error('Fallback anonymous sign-in failed:', fallbackError);
      }
    }
  }, []);

  /**
   * Create or update user document in Firestore
   */
  const ensureUserDocument = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return;

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userRef, {
          createdAt: serverTimestamp(),
          premium: false,
          linkedGoogle: !firebaseUser.isAnonymous,
          deviceId: await SecureStore.getItemAsync(AUTH_UID_KEY) || firebaseUser.uid,
        });
        logger.log('Created new user document for:', firebaseUser.uid);
      } else {
        // Update linked status if needed
        const userData = userDoc.data();
        if (userData.linkedGoogle !== !firebaseUser.isAnonymous) {
          await updateDoc(userRef, {
            linkedGoogle: !firebaseUser.isAnonymous,
          });
        }
      }

      // Store UID locally (parallel writes)
      await Promise.all([
        SecureStore.setItemAsync(AUTH_UID_KEY, firebaseUser.uid),
        SecureStore.setItemAsync(LINKED_GOOGLE_KEY, (!firebaseUser.isAnonymous).toString()),
      ]);
      setLinkedGoogle(!firebaseUser.isAnonymous);
    } catch (error) {
      logger.error('Error ensuring user document:', error);
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoading(false); // Set loading false immediately - don't wait for Firestore

        // Run Firestore sync in background (non-blocking)
        ensureUserDocument(firebaseUser).catch(err => {
          logger.warn('Background user document sync failed:', err);
        });
        setSentryUser(firebaseUser);
      } else {
        setUser(null);
        // No user - initialize anonymous auth
        initializeAuth();
        // Keep loading true until auth completes
      }
    });

    return unsubscribe;
  }, [ensureUserDocument, initializeAuth]);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Link anonymous account with Google (parent-only action)
   * Merges all user data from anonymous account to Google account
   */
  const linkWithGoogle = useCallback(async () => {
    if (!user) {
      throw new Error('No user to link');
    }

    if (!user.isAnonymous) {
      throw new Error('Account is already linked to Google');
    }

    setIsLinkingAccount(true);

    try {
      // Trigger Google sign-in
      const result = await promptAsync();

      if (result.type === 'success') {
        const { id_token } = result.params;
        const credential = GoogleAuthProvider.credential(id_token);

        // Store anonymous user data before linking
        const anonymousUid = user.uid;
        const anonymousUserRef = doc(db, 'users', anonymousUid);
        const anonymousUserDoc = await getDoc(anonymousUserRef);
        const anonymousUserData = anonymousUserDoc.exists() ? anonymousUserDoc.data() : {};

        try {
          // Try to link the anonymous account with Google
          const linkedUser = await linkWithCredential(user, credential);
          logger.log('Account linked successfully:', linkedUser.user.uid);

          // Update the user document with linked status
          await updateDoc(anonymousUserRef, {
            linkedGoogle: true,
            linkedAt: serverTimestamp(),
          });

          // Update local state
          await SecureStore.setItemAsync(LINKED_GOOGLE_KEY, 'true');
          setLinkedGoogle(true);

          return { success: true, user: linkedUser.user };
        } catch (linkError) {
          logger.error('Link error:', linkError);

          // Handle credential-already-in-use error
          if (linkError.code === 'auth/credential-already-in-use') {
            // The Google account is already linked to another Firebase account
            // Sign in to the existing Google account and merge data
            const existingUser = await signInWithCredential(auth, credential);
            const existingUid = existingUser.user.uid;

            // Merge anonymous user data into existing Google user
            await mergeUserData(anonymousUid, existingUid, anonymousUserData);

            // Update local state
            await SecureStore.setItemAsync(AUTH_UID_KEY, existingUid);
            await SecureStore.setItemAsync(LINKED_GOOGLE_KEY, 'true');
            setLinkedGoogle(true);

            return { success: true, user: existingUser.user, merged: true };
          }

          throw linkError;
        }
      } else if (result.type === 'cancel') {
        return { success: false, cancelled: true };
      } else {
        throw new Error('Google sign-in failed');
      }
    } finally {
      setIsLinkingAccount(false);
    }
  }, [user, promptAsync]);

  /**
   * Merge user data from anonymous account to Google account
   */
  const mergeUserData = async (fromUid, toUid, fromData) => {
    try {
      const toUserRef = doc(db, 'users', toUid);
      const toUserDoc = await getDoc(toUserRef);
      const toData = toUserDoc.exists() ? toUserDoc.data() : {};

      // Merge premium status (if either account is premium, keep it)
      const mergedPremium = fromData.premium || toData.premium || false;

      // Update the destination user document
      await updateDoc(toUserRef, {
        premium: mergedPremium,
        linkedGoogle: true,
        mergedFrom: fromUid,
        mergedAt: serverTimestamp(),
      });

      logger.log('User data merged from', fromUid, 'to', toUid);
    } catch (error) {
      logger.error('Error merging user data:', error);
      throw error;
    }
  };

  /**
   * Disconnect Google account (parent-only action)
   * Note: This logs out and creates a new anonymous account
   */
  const disconnectGoogle = useCallback(async () => {
    if (!user || user.isAnonymous) {
      throw new Error('No Google account to disconnect');
    }

    try {
      // Sign out and create new anonymous account
      await signOut(auth);
      await SecureStore.deleteItemAsync(LINKED_GOOGLE_KEY);
      setLinkedGoogle(false);

      // New anonymous sign-in will happen via onAuthStateChanged
    } catch (error) {
      logger.error('Disconnect error:', error);
      throw error;
    }
  }, [user]);

  /**
   * Logout - for anonymous users this effectively resets the account
   */
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      // Clear stored data in parallel
      await Promise.all([
        SecureStore.deleteItemAsync(AUTH_UID_KEY),
        SecureStore.deleteItemAsync(LINKED_GOOGLE_KEY),
      ]);
      setLinkedGoogle(false);
      // New anonymous sign-in will happen via onAuthStateChanged
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }, []);

  /**
   * Get the account status for display
   */
  const getAccountStatus = useCallback(() => {
    if (!user) {
      return {
        type: 'none',
        label: 'Not logged in',
        description: '',
      };
    }

    if (user.isAnonymous) {
      return {
        type: 'anonymous',
        label: 'Anonymous',
        description: 'Your data is saved securely on this device.',
      };
    }

    return {
      type: 'google',
      label: 'Parent Account Connected',
      description: 'Your data is safely synced across devices.',
      email: user.email,
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        linkedGoogle,
        isLinkingAccount,
        linkWithGoogle,
        disconnectGoogle,
        logout,
        getAccountStatus,
        // Legacy exports for compatibility (to be removed)
        loginAnonymously: async () => signInAnonymously(auth),
        upgradeAnonymousWithGoogle: linkWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
