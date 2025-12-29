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
export const PRODUCT_ID = 'com.playbeacon.app.removeads2';

// Storage key for local premium cache
const PREMIUM_STORAGE_KEY = '@playbeacon_premium';

// Dynamically import react-native-iap functions only when not in Expo Go
let initConnection = null;
let endConnection = null;
let getProducts = null;
let getAvailablePurchases = null;
let requestPurchase = null;
let finishTransaction = null;
let purchaseUpdatedListener = null;
let purchaseErrorListener = null;

if (!isExpoGo) {
  try {
    const RNIap = require('react-native-iap');
    initConnection = RNIap.initConnection;
    endConnection = RNIap.endConnection;
    getProducts = RNIap.getProducts;
    getAvailablePurchases = RNIap.getAvailablePurchases;
    requestPurchase = RNIap.requestPurchase;
    finishTransaction = RNIap.finishTransaction;
    purchaseUpdatedListener = RNIap.purchaseUpdatedListener;
    purchaseErrorListener = RNIap.purchaseErrorListener;
  } catch (error) {
    logger.log('react-native-iap not available:', error.message);
  }
}

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

      // Sync to Firestore if user is logged in
      if (user?.uid) {
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
    if (!user?.uid) return;

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
    if (isExpoGo || !initConnection) {
      logger.log('IAP: Skipping initialization (running in Expo Go or IAP not available)');
      setIsLoading(false);
      return;
    }

    try {
      // Initialize connection to store
      logger.log('IAP: Starting connection initialization...');
      const result = await initConnection();
      logger.log('IAP connection result:', result);

      // Load products
      if (getProducts) {
        logger.log('IAP: Fetching products for SKU:', PRODUCT_ID);
        const loadedProducts = await getProducts({ skus: [PRODUCT_ID] });
        logger.log('IAP products loaded:', loadedProducts?.length || 0, loadedProducts);

        if (loadedProducts && loadedProducts.length > 0) {
          logger.log('IAP: Product found:', loadedProducts[0].productId, 'Price:', loadedProducts[0].localizedPrice);
          setProducts(loadedProducts);
          setIsIapAvailable(true);
        } else {
          // Product not found - this is the likely cause of the App Store rejection
          // Log detailed info to help debug
          logger.warn('IAP: No products found for SKU:', PRODUCT_ID);
          logger.warn('IAP: This may mean the product is not configured in App Store Connect or not approved yet');
          setProducts([]);
          // Still set IAP as available - the product may load on retry
          // This prevents showing an error if there's a temporary issue
          setIsIapAvailable(false);
        }
      } else {
        logger.warn('IAP: getProducts function not available');
        setIsIapAvailable(false);
      }

      // Check for existing purchases (restore)
      await checkExistingPurchases();
    } catch (error) {
      logger.error('IAP initialization failed:', error);
      logger.error('IAP error details:', error.code, error.message);
      setIsIapAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check for existing purchases (restore functionality)
   */
  const checkExistingPurchases = useCallback(async () => {
    if (!getAvailablePurchases) return;

    try {
      const purchases = await getAvailablePurchases();
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
    if (isExpoGo || !requestPurchase) {
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
      const purchase = await requestPurchase({
        sku: PRODUCT_ID,
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
      });

      logger.log('Purchase result:', purchase);

      // Finish the transaction
      if (Platform.OS === 'ios' && finishTransaction) {
        await finishTransaction({ purchase, isConsumable: false });
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

      if (error.code === 'E_DEFERRED_PAYMENT') {
        // Ask to Buy - purchase requires parental approval
        Alert.alert(
          'Waiting for Approval',
          'Your purchase request has been sent for approval. You\'ll get access once it\'s approved.',
          [{ text: 'OK' }]
        );
        return false;
      }

      if (error.code === 'E_ITEM_UNAVAILABLE') {
        Alert.alert(
          'Not Available',
          'This purchase is temporarily unavailable. Please try again later.',
          [{ text: 'OK' }]
        );
        return false;
      }

      if (error.code === 'E_NETWORK_ERROR') {
        Alert.alert(
          'Connection Error',
          'Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
        return false;
      }

      if (error.code === 'E_ALREADY_OWNED') {
        // User already owns this - restore it
        setIsPremium(true);
        await savePremiumStatus(true);
        Alert.alert(
          'Already Purchased',
          'You already own this! Your ad-free experience has been restored.',
          [{ text: 'Great!' }]
        );
        return true;
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
    if (isExpoGo || !getAvailablePurchases) {
      Alert.alert(
        'Not Available',
        'Purchase restoration is not available in development mode.'
      );
      return false;
    }

    try {
      setIsLoading(true);

      const purchases = await getAvailablePurchases();
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
      if (endConnection) {
        endConnection();
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
    if (isExpoGo || !purchaseUpdatedListener) return;

    const purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase) => {
        logger.log('Purchase updated:', purchase);

        if (purchase.productId === PRODUCT_ID) {
          // Finish transaction
          try {
            if (Platform.OS === 'ios' && finishTransaction) {
              await finishTransaction({ purchase, isConsumable: false });
            }
            setIsPremium(true);
            await savePremiumStatus(true);
          } catch (error) {
            logger.error('Failed to finish transaction:', error);
          }
        }
      }
    );

    const purchaseErrorSubscription = purchaseErrorListener
      ? purchaseErrorListener((error) => {
          logger.error('Purchase error:', error);
        })
      : null;

    return () => {
      purchaseUpdateSubscription?.remove();
      purchaseErrorSubscription?.remove();
    };
  }, [savePremiumStatus]);

  /**
   * Retry IAP connection (for when initial connection fails)
   */
  const retryConnection = useCallback(async () => {
    logger.log('IAP: Retrying connection...');
    setIsLoading(true);
    await initializeIAP();
  }, [initializeIAP]);

  const value = {
    isPremium,
    isLoading,
    isPurchasing,
    isIapAvailable: isIapAvailable && !isExpoGo,
    isExpoGo,
    purchasePremium,
    restorePurchases,
    getProductInfo,
    retryConnection,
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
