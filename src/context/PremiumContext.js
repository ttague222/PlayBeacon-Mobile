/**
 * Premium Context Provider
 *
 * Manages premium/ad-free status and in-app purchase flow.
 * Handles iOS and Android purchases via react-native-iap v14+.
 * Persists premium status to AsyncStorage and Firestore.
 *
 * COPPA-compliant: Works with both anonymous and Google-linked accounts.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import logger from '../utils/logger';

// Check if we're running in Expo Go (where native modules aren't available)
const isExpoGo = Constants.appOwnership === 'expo';

// Product ID - must match App Store Connect and Google Play Console
export const PRODUCT_ID = 'com.playbeacon.app.removeads';

// Storage key for local premium cache
const PREMIUM_STORAGE_KEY = '@playbeacon_premium';

// Flag to track if IAP module load failed
let iapModuleLoadFailed = false;

// Lazy load react-native-iap functions to prevent crashes at module initialization
// Called on first use, not at import time
const getIapModule = () => {
  if (isExpoGo || iapModuleLoadFailed) {
    return null;
  }
  try {
    return require('react-native-iap');
  } catch (error) {
    console.warn('react-native-iap not available:', error?.message);
    iapModuleLoadFailed = true;
    return null;
  }
};

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [products, setProducts] = useState([]);
  const [isIapAvailable, setIsIapAvailable] = useState(false);

  /**
   * Load premium status from local storage
   */
  const loadPremiumStatus = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
      if (stored === 'true') {
        setIsPremium(true);
      }
    } catch (error) {
      logger.error('Failed to load premium status:', error);
    }
  }, []);

  /**
   * Save premium status to local storage and Firestore
   */
  const savePremiumStatus = useCallback(async (status) => {
    try {
      // Save to local storage
      await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, status ? 'true' : 'false');

      // Sync to Firestore if user is logged in and db is available
      if (user?.uid && db) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            await updateDoc(userRef, { premium: status });
          } else {
            await setDoc(userRef, { premium: status }, { merge: true });
          }
          logger.log('Premium status synced to Firestore:', status);
        } catch (firestoreError) {
          logger.error('Failed to sync premium to Firestore:', firestoreError);
          // Don't throw - local storage is the source of truth
        }
      }
    } catch (error) {
      logger.error('Failed to save premium status:', error);
    }
  }, [user?.uid]);

  /**
   * Load premium status from Firestore (for cross-device sync)
   */
  const loadPremiumFromFirestore = useCallback(async () => {
    if (!user?.uid || !db) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.premium === true) {
          setIsPremium(true);
          await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, 'true');
          logger.log('Premium status loaded from Firestore');
        }
      }
    } catch (error) {
      logger.error('Failed to load premium from Firestore:', error);
    }
  }, [user?.uid]);

  /**
   * Initialize IAP connection and load products
   */
  const initializeIAP = useCallback(async () => {
    const RNIap = getIapModule();
    if (isExpoGo || !RNIap) {
      logger.log('IAP: Skipping initialization (running in Expo Go or IAP not available)');
      setIsLoading(false);
      return;
    }

    try {
      // Initialize connection to store
      const result = await RNIap.initConnection();
      logger.log('IAP connection result:', result);
      setIsIapAvailable(true);

      // Load products
      const loadedProducts = await RNIap.getProducts({ skus: [PRODUCT_ID] });
      logger.log('IAP products loaded:', loadedProducts);
      setProducts(loadedProducts);

      // Check for existing purchases (restore)
      await checkExistingPurchases();
    } catch (error) {
      logger.error('IAP initialization failed:', error);
      setIsIapAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check for existing purchases (restore functionality)
   */
  const checkExistingPurchases = useCallback(async () => {
    const RNIap = getIapModule();
    if (!RNIap) return;

    try {
      const purchases = await RNIap.getAvailablePurchases();
      logger.log('Available purchases:', purchases);

      const hasPremium = purchases.some(
        (purchase) => purchase.productId === PRODUCT_ID
      );

      if (hasPremium) {
        setIsPremium(true);
        await savePremiumStatus(true);
        logger.log('Premium status restored from previous purchase');
      }
    } catch (error) {
      logger.error('Failed to check existing purchases:', error);
    }
  }, [savePremiumStatus]);

  /**
   * Purchase the premium/ad-free product
   */
  const purchasePremium = useCallback(async () => {
    const RNIap = getIapModule();
    if (isExpoGo || !RNIap) {
      Alert.alert(
        'Not Available',
        'In-app purchases are not available in development mode.'
      );
      return false;
    }

    if (!isIapAvailable) {
      Alert.alert('Error', 'Store connection not available. Please try again.');
      return false;
    }

    if (isPurchasing) {
      return false;
    }

    try {
      setIsPurchasing(true);

      // Request purchase
      const purchase = await RNIap.requestPurchase({
        sku: PRODUCT_ID,
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
      });

      logger.log('Purchase result:', purchase);

      // Finish the transaction
      if (Platform.OS === 'ios') {
        await RNIap.finishTransaction({ purchase, isConsumable: false });
      }

      // Update premium status (local + Firestore)
      setIsPremium(true);
      await savePremiumStatus(true);

      Alert.alert(
        'Purchase Complete!',
        'Thank you! All ads have been removed. Enjoy PlayBeacon ad-free!',
        [{ text: 'Awesome!' }]
      );

      return true;
    } catch (error) {
      logger.error('Purchase failed:', error);

      // Handle specific error codes
      if (error.code === 'E_USER_CANCELLED') {
        // User cancelled - no need to show error
        return false;
      }

      Alert.alert(
        'Purchase Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );

      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [isIapAvailable, isPurchasing, savePremiumStatus]);

  /**
   * Restore previous purchases
   */
  const restorePurchases = useCallback(async () => {
    const RNIap = getIapModule();
    if (isExpoGo || !RNIap) {
      Alert.alert(
        'Not Available',
        'Purchase restoration is not available in development mode.'
      );
      return false;
    }

    try {
      setIsLoading(true);

      const purchases = await RNIap.getAvailablePurchases();
      const hasPremium = purchases.some(
        (purchase) => purchase.productId === PRODUCT_ID
      );

      if (hasPremium) {
        setIsPremium(true);
        await savePremiumStatus(true);
        Alert.alert(
          'Restored!',
          'Your ad-free purchase has been restored. Enjoy PlayBeacon!',
          [{ text: 'Great!' }]
        );
        return true;
      } else {
        Alert.alert(
          'No Purchases Found',
          'We could not find any previous purchases to restore.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      logger.error('Restore failed:', error);
      Alert.alert(
        'Restore Failed',
        'Could not restore purchases. Please try again.',
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [savePremiumStatus]);

  /**
   * Get the product info for display
   */
  const getProductInfo = useCallback(() => {
    const product = products.find((p) => p.productId === PRODUCT_ID);
    if (product) {
      return {
        title: product.title || 'Remove Ads',
        description: product.description || 'Remove all ads forever with a one-time purchase.',
        price: product.localizedPrice || '$2.99',
        currency: product.currency || 'USD',
      };
    }
    // Default fallback
    return {
      title: 'Remove Ads',
      description: 'Remove all ads forever with a one-time purchase.',
      price: '$2.99',
      currency: 'USD',
    };
  }, [products]);

  // Initialize on mount
  useEffect(() => {
    loadPremiumStatus();
    initializeIAP();

    // Cleanup IAP connection on unmount
    return () => {
      const RNIap = getIapModule();
      if (RNIap?.endConnection) {
        RNIap.endConnection();
      }
    };
  }, [loadPremiumStatus, initializeIAP]);

  // Load premium status from Firestore when user changes
  useEffect(() => {
    if (user?.uid) {
      loadPremiumFromFirestore();
    }
  }, [user?.uid, loadPremiumFromFirestore]);

  // Set up purchase listener
  useEffect(() => {
    const RNIap = getIapModule();
    if (isExpoGo || !RNIap?.purchaseUpdatedListener) return;

    const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async (purchase) => {
        logger.log('Purchase updated:', purchase);

        if (purchase.productId === PRODUCT_ID) {
          // Finish transaction
          try {
            if (Platform.OS === 'ios' && RNIap.finishTransaction) {
              await RNIap.finishTransaction({ purchase, isConsumable: false });
            }
            setIsPremium(true);
            await savePremiumStatus(true);
          } catch (error) {
            logger.error('Failed to finish transaction:', error);
          }
        }
      }
    );

    const purchaseErrorSubscription = RNIap.purchaseErrorListener
      ? RNIap.purchaseErrorListener((error) => {
          logger.error('Purchase error:', error);
        })
      : null;

    return () => {
      purchaseUpdateSubscription?.remove();
      purchaseErrorSubscription?.remove();
    };
  }, [savePremiumStatus]);

  const value = {
    isPremium,
    isLoading,
    isPurchasing,
    isIapAvailable: isIapAvailable && !isExpoGo,
    isExpoGo,
    purchasePremium,
    restorePurchases,
    getProductInfo,
  };

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}

export default PremiumContext;
