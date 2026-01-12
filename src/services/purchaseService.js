/**
 * RevenueCat Purchase Service
 *
 * Handles all RevenueCat SDK interactions for in-app purchases.
 * Manages initialization, purchases, restores, and entitlement checks.
 */

import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import logger from '../utils/logger';

// RevenueCat API Keys (Production)
const REVENUECAT_API_KEY_IOS = 'appl_wdjPBYDohYXJnxCuXaioQTDyRkj';
const REVENUECAT_API_KEY_ANDROID = 'goog_mFzpkfXNDhOlHCgDHoyZXlOrXgV';

// Entitlement and Product IDs
export const ENTITLEMENT_ID = 'PlayBeacon Premium';
export const PRODUCT_ID_NO_ADS = 'com.playbeacon.app.removeads3';

// Track initialization state
let isInitialized = false;

/**
 * Initialize RevenueCat SDK
 * Should be called once at app startup
 */
export async function initializePurchases(userId = null) {
  if (isInitialized) {
    logger.log('RevenueCat: Already initialized');
    return true;
  }

  try {
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

    logger.log('RevenueCat: Initializing...');

    // Configure with or without user ID
    if (userId) {
      await Purchases.configure({ apiKey, appUserID: userId });
      logger.log('RevenueCat: Configured with user ID:', userId);
    } else {
      await Purchases.configure({ apiKey });
      logger.log('RevenueCat: Configured with anonymous user');
    }

    isInitialized = true;
    logger.log('RevenueCat: Initialization complete');
    return true;
  } catch (error) {
    logger.error('RevenueCat: Initialization failed:', error);
    return false;
  }
}

/**
 * Login user to RevenueCat (for cross-device sync)
 */
export async function loginUser(userId) {
  if (!isInitialized) {
    await initializePurchases(userId);
    return;
  }

  try {
    const { customerInfo } = await Purchases.logIn(userId);
    logger.log('RevenueCat: User logged in:', userId);
    return customerInfo;
  } catch (error) {
    logger.error('RevenueCat: Login failed:', error);
    throw error;
  }
}

/**
 * Logout user from RevenueCat
 */
export async function logoutUser() {
  try {
    const customerInfo = await Purchases.logOut();
    logger.log('RevenueCat: User logged out');
    return customerInfo;
  } catch (error) {
    logger.error('RevenueCat: Logout failed:', error);
    throw error;
  }
}

/**
 * Check if user has premium entitlement
 */
export async function checkPremiumStatus() {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    logger.log('RevenueCat: Premium status:', isPremium);
    return isPremium;
  } catch (error) {
    logger.error('RevenueCat: Failed to check premium status:', error);
    return false;
  }
}

/**
 * Get available offerings (products)
 */
export async function getOfferings() {
  try {
    const offerings = await Purchases.getOfferings();
    logger.log('RevenueCat: Offerings loaded:', offerings.current?.identifier);
    return offerings;
  } catch (error) {
    logger.error('RevenueCat: Failed to get offerings:', error);
    return null;
  }
}

/**
 * Get current offering packages
 */
export async function getCurrentPackages() {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current && offerings.current.availablePackages.length > 0) {
      return offerings.current.availablePackages;
    }
    return [];
  } catch (error) {
    logger.error('RevenueCat: Failed to get packages:', error);
    return [];
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(pkg) {
  try {
    logger.log('RevenueCat: Purchasing package:', pkg.identifier);
    const { customerInfo } = await Purchases.purchasePackage(pkg);

    // Check if purchase granted premium entitlement
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    logger.log('RevenueCat: Purchase complete, premium:', isPremium);

    return {
      success: true,
      isPremium,
      customerInfo,
    };
  } catch (error) {
    if (error.userCancelled) {
      logger.log('RevenueCat: Purchase cancelled by user');
      return { success: false, cancelled: true };
    }

    logger.error('RevenueCat: Purchase failed:', error);
    return { success: false, error };
  }
}

/**
 * Purchase by product ID
 */
export async function purchaseProduct(productId) {
  try {
    const offerings = await Purchases.getOfferings();

    if (!offerings.current) {
      throw new Error('No offerings available');
    }

    // Find the package with the matching product
    const pkg = offerings.current.availablePackages.find(
      p => p.product.identifier === productId
    );

    if (!pkg) {
      throw new Error(`Product not found: ${productId}`);
    }

    return await purchasePackage(pkg);
  } catch (error) {
    logger.error('RevenueCat: Purchase by product ID failed:', error);
    return { success: false, error };
  }
}

/**
 * Restore purchases
 */
export async function restorePurchases() {
  try {
    logger.log('RevenueCat: Restoring purchases...');
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    logger.log('RevenueCat: Restore complete, premium:', isPremium);

    return {
      success: true,
      isPremium,
      customerInfo,
    };
  } catch (error) {
    logger.error('RevenueCat: Restore failed:', error);
    return { success: false, error };
  }
}

/**
 * Get customer info
 */
export async function getCustomerInfo() {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    logger.error('RevenueCat: Failed to get customer info:', error);
    return null;
  }
}

/**
 * Add listener for customer info updates
 */
export function addCustomerInfoListener(callback) {
  return Purchases.addCustomerInfoUpdateListener(callback);
}

/**
 * Get product info for display
 */
export async function getProductInfo() {
  try {
    const offerings = await Purchases.getOfferings();

    if (offerings.current && offerings.current.availablePackages.length > 0) {
      const pkg = offerings.current.availablePackages[0];
      const product = pkg.product;

      return {
        title: product.title || 'Remove Ads',
        description: product.description || 'Remove all ads forever with a one-time purchase.',
        price: product.priceString || '$1.99',
        currency: product.currencyCode || 'USD',
        productId: product.identifier,
        package: pkg,
      };
    }

    // Fallback defaults
    return {
      title: 'Remove Ads',
      description: 'Remove all ads forever with a one-time purchase.',
      price: '$1.99',
      currency: 'USD',
      productId: PRODUCT_ID_NO_ADS,
      package: null,
    };
  } catch (error) {
    logger.error('RevenueCat: Failed to get product info:', error);
    return {
      title: 'Remove Ads',
      description: 'Remove all ads forever with a one-time purchase.',
      price: '$1.99',
      currency: 'USD',
      productId: PRODUCT_ID_NO_ADS,
      package: null,
    };
  }
}

/**
 * Present the RevenueCat paywall
 * Note: Requires react-native-purchases-ui
 */
export async function presentPaywall() {
  try {
    // Import RevenueCatUI only when needed
    const RevenueCatUI = require('react-native-purchases-ui');

    const paywallResult = await RevenueCatUI.presentPaywall();
    logger.log('RevenueCat: Paywall result:', paywallResult);

    return paywallResult;
  } catch (error) {
    logger.error('RevenueCat: Failed to present paywall:', error);
    throw error;
  }
}

/**
 * Present the RevenueCat paywall if needed (user doesn't have entitlement)
 */
export async function presentPaywallIfNeeded() {
  try {
    const RevenueCatUI = require('react-native-purchases-ui');

    const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: ENTITLEMENT_ID,
    });
    logger.log('RevenueCat: Paywall if needed result:', paywallResult);

    return paywallResult;
  } catch (error) {
    logger.error('RevenueCat: Failed to present paywall if needed:', error);
    throw error;
  }
}

/**
 * Show Customer Center for managing subscriptions
 */
export async function showCustomerCenter() {
  try {
    const RevenueCatUI = require('react-native-purchases-ui');

    await RevenueCatUI.presentCustomerCenter();
    logger.log('RevenueCat: Customer center presented');
  } catch (error) {
    logger.error('RevenueCat: Failed to show customer center:', error);
    throw error;
  }
}

export default {
  initializePurchases,
  loginUser,
  logoutUser,
  checkPremiumStatus,
  getOfferings,
  getCurrentPackages,
  purchasePackage,
  purchaseProduct,
  restorePurchases,
  getCustomerInfo,
  addCustomerInfoListener,
  getProductInfo,
  presentPaywall,
  presentPaywallIfNeeded,
  showCustomerCenter,
  ENTITLEMENT_ID,
  PRODUCT_ID_NO_ADS,
};
