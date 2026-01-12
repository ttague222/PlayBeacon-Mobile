/**
 * Premium Context Provider
 *
 * Manages premium/ad-free status and in-app purchase flow.
 * Uses RevenueCat for purchase management.
 * Persists premium status to AsyncStorage and Firestore.
 *
 * COPPA-compliant: Works with both anonymous and Google-linked accounts.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import logger from '../utils/logger';

// Check if we're running in Expo Go (where native modules aren't available)
const isExpoGo = Constants.appOwnership === 'expo';

// Product ID - must match App Store Connect and Google Play Console
export const PRODUCT_ID = 'com.playbeacon.app.removeads3';

// Storage key for local premium cache
const PREMIUM_STORAGE_KEY = '@playbeacon_premium';

// RevenueCat imports (conditionally loaded)
let purchaseService = null;
if (!isExpoGo) {
  try {
    purchaseService = require('../services/purchaseService');
  } catch (error) {
    logger.log('RevenueCat service not available:', error.message);
  }
}

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isIapAvailable, setIsIapAvailable] = useState(false);
  const [revenueCatPackage, setRevenueCatPackage] = useState(null);

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
   * Initialize RevenueCat
   */
  const initializeRevenueCat = useCallback(async () => {
    if (isExpoGo || !purchaseService) {
      logger.log('RevenueCat: Skipping initialization (running in Expo Go or service not available)');
      setIsLoading(false);
      return;
    }

    try {
      logger.log('RevenueCat: Starting initialization...');

      // Initialize RevenueCat with user ID if available
      const initialized = await purchaseService.initializePurchases(user?.uid);

      if (!initialized) {
        logger.warn('RevenueCat: Initialization returned false');
        setIsIapAvailable(false);
        setIsLoading(false);
        return;
      }

      // If user is logged in, sync with RevenueCat
      if (user?.uid) {
        try {
          await purchaseService.loginUser(user.uid);
        } catch (loginError) {
          logger.warn('RevenueCat: Login failed, continuing with anonymous:', loginError);
        }
      }

      // Check premium status from RevenueCat
      const hasPremium = await purchaseService.checkPremiumStatus();
      if (hasPremium) {
        setIsPremium(true);
        await savePremiumStatus(true);
        logger.log('RevenueCat: User has premium entitlement');
      }

      // Load product info
      const productInfo = await purchaseService.getProductInfo();
      if (productInfo.package) {
        setRevenueCatPackage(productInfo.package);
        setIsIapAvailable(true);
        logger.log('RevenueCat: Product loaded:', productInfo.title, productInfo.price);
      } else {
        // Even without package, we can try to present paywall
        setIsIapAvailable(true);
        logger.log('RevenueCat: No package found, but paywall may be available');
      }

      logger.log('RevenueCat: Initialization complete');
    } catch (error) {
      logger.error('RevenueCat: Initialization failed:', error);
      setIsIapAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, savePremiumStatus]);

  /**
   * Purchase via RevenueCat
   */
  const purchasePremium = useCallback(async () => {
    if (isExpoGo || !purchaseService) {
      Alert.alert(
        'Not Available',
        'In-app purchases are not available in development mode.'
      );
      return false;
    }

    if (isPurchasing) {
      return false;
    }

    try {
      setIsPurchasing(true);

      // Get the package if not already loaded
      let packageToPurchase = revenueCatPackage;

      if (!packageToPurchase) {
        // Try to load packages
        const packages = await purchaseService.getCurrentPackages();
        if (packages && packages.length > 0) {
          packageToPurchase = packages[0];
          setRevenueCatPackage(packageToPurchase);
        }
      }

      if (!packageToPurchase) {
        Alert.alert(
          'Error',
          'Could not load purchase options. Please try again later.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Purchase the package directly
      const result = await purchaseService.purchasePackage(packageToPurchase);

      if (result.success || result.isPremium) {
        setIsPremium(true);
        await savePremiumStatus(true);

        Alert.alert(
          'Purchase Complete!',
          'Thank you! All ads have been removed. Enjoy PlayBeacon ad-free!',
          [{ text: 'Awesome!' }]
        );
        return true;
      }

      if (result.cancelled) {
        // User cancelled - no need to show error
        return false;
      }

      if (result.error) {
        throw result.error;
      }

      return false;
    } catch (error) {
      logger.error('RevenueCat purchase failed:', error);

      Alert.alert(
        'Purchase Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );

      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [isPurchasing, revenueCatPackage, savePremiumStatus]);

  /**
   * Restore purchases via RevenueCat
   */
  const restorePurchases = useCallback(async () => {
    if (isExpoGo || !purchaseService) {
      Alert.alert(
        'Not Available',
        'Purchase restoration is not available in development mode.'
      );
      return false;
    }

    try {
      setIsLoading(true);

      const result = await purchaseService.restorePurchases();

      if (result.success && result.isPremium) {
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
      logger.error('RevenueCat restore failed:', error);
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
  const getProductInfo = useCallback(async () => {
    if (purchaseService) {
      return await purchaseService.getProductInfo();
    }
    // Default fallback
    return {
      title: 'Remove Ads',
      description: 'Remove all ads forever with a one-time purchase.',
      price: '$1.99',
      currency: 'USD',
    };
  }, []);

  /**
   * Present purchase flow directly (no paywall UI needed)
   */
  const presentPaywall = useCallback(async () => {
    // Just use the regular purchase flow - no RevenueCat paywall UI needed
    return purchasePremium();
  }, [purchasePremium]);

  /**
   * Show Customer Center (RevenueCat only)
   */
  const showCustomerCenter = useCallback(async () => {
    if (!purchaseService) {
      Alert.alert(
        'Not Available',
        'Customer center is not available.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await purchaseService.showCustomerCenter();
    } catch (error) {
      logger.error('Customer center failed:', error);
      Alert.alert(
        'Error',
        'Could not open customer center. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    loadPremiumStatus();
    initializeRevenueCat();
  }, [loadPremiumStatus, initializeRevenueCat]);

  // Load premium status from Firestore when user changes
  useEffect(() => {
    if (user?.uid) {
      loadPremiumFromFirestore();
    }
  }, [user?.uid, loadPremiumFromFirestore]);

  // Set up RevenueCat customer info listener
  useEffect(() => {
    if (isExpoGo || !purchaseService) return;

    const listener = purchaseService.addCustomerInfoListener((customerInfo) => {
      logger.log('RevenueCat: Customer info updated');
      const hasPremium = customerInfo.entitlements.active[purchaseService.ENTITLEMENT_ID] !== undefined;
      if (hasPremium !== isPremium) {
        setIsPremium(hasPremium);
        savePremiumStatus(hasPremium);
      }
    });

    return () => {
      if (listener?.remove) {
        listener.remove();
      }
    };
  }, [isPremium, savePremiumStatus]);

  /**
   * Retry IAP connection (for when initial connection fails)
   */
  const retryConnection = useCallback(async () => {
    logger.log('IAP: Retrying connection...');
    setIsLoading(true);
    await initializeRevenueCat();
  }, [initializeRevenueCat]);

  const value = {
    isPremium,
    isLoading,
    isPurchasing,
    isIapAvailable: isIapAvailable && !isExpoGo,
    isExpoGo,
    isRevenueCatEnabled: true,
    purchasePremium,
    restorePurchases,
    getProductInfo,
    retryConnection,
    presentPaywall,
    showCustomerCenter,
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
