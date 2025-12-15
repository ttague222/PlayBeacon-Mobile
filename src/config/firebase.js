/**
 * Firebase Configuration
 *
 * IMPORTANT: All Firebase initialization is wrapped in try-catch to prevent
 * white screen crashes on iOS. Firebase is optional - the app should work
 * (with reduced functionality) even if Firebase fails to initialize.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Lazy load auth modules to prevent initialization crashes
let initializeAuth = null;
let getReactNativePersistence = null;
let getAuth = null;
let AsyncStorage = null;

try {
  const authModule = require('firebase/auth');
  initializeAuth = authModule.initializeAuth;
  getReactNativePersistence = authModule.getReactNativePersistence;
  getAuth = authModule.getAuth;
} catch (e) {
  console.warn('Firebase auth module failed to load:', e?.message);
}

try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  console.warn('AsyncStorage failed to load:', e?.message);
}

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase with error handling to prevent white screen crashes
let app = null;
let auth = null;
let db = null;

try {
  // Check if Firebase is already initialized (prevents duplicate app errors)
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // Initialize Auth with AsyncStorage persistence (if modules loaded successfully)
  if (initializeAuth && getReactNativePersistence && AsyncStorage) {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    } catch (authError) {
      // Auth may already be initialized, try to get existing instance
      if (authError.code === 'auth/already-initialized' && getAuth) {
        try {
          auth = getAuth(app);
        } catch (getAuthError) {
          console.warn('Firebase getAuth failed:', getAuthError?.message);
        }
      } else {
        console.warn('Firebase Auth initialization failed:', authError?.message);
        // Try fallback without persistence
        if (getAuth) {
          try {
            auth = getAuth(app);
          } catch (fallbackError) {
            console.warn('Firebase Auth fallback failed:', fallbackError?.message);
          }
        }
      }
    }
  } else if (getAuth) {
    // Fallback: try basic auth without persistence
    try {
      auth = getAuth(app);
    } catch (basicAuthError) {
      console.warn('Firebase basic Auth failed:', basicAuthError?.message);
    }
  }

  // Initialize Firestore (separate try-catch to not block on auth failures)
  try {
    db = getFirestore(app);
  } catch (firestoreError) {
    console.warn('Firebase Firestore initialization failed:', firestoreError?.message);
  }
} catch (error) {
  console.error('Firebase initialization failed:', error?.message);
  // App will continue but Firebase features won't work
}

export { auth, db };
export default app;
