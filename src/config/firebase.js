import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Initialize Auth with AsyncStorage persistence
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (authError) {
    // Auth may already be initialized, try to get existing instance
    if (authError.code === 'auth/already-initialized') {
      auth = getAuth(app);
    } else {
      console.warn('Firebase Auth initialization failed:', authError);
    }
  }

  // Initialize Firestore
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // App will continue but Firebase features won't work
}

export { auth, db };
export default app;
