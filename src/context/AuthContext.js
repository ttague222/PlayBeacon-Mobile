import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  linkWithCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Google OAuth configuration
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const loginAnonymously = async () => {
    return signInAnonymously(auth);
  };

  const loginWithGoogle = async () => {
    return promptAsync();
  };

  const upgradeAnonymousWithGoogle = async () => {
    if (!user || !user.isAnonymous) {
      throw new Error('User must be anonymous to upgrade');
    }

    // Trigger Google sign-in
    const result = await promptAsync();

    if (result.type === 'success') {
      const { id_token } = result.params;
      const credential = GoogleAuthProvider.credential(id_token);

      // Link the anonymous account with Google
      return linkWithCredential(user, credential);
    }
  };

  const logout = async () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      loginAnonymously,
      loginWithGoogle,
      upgradeAnonymousWithGoogle,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
