/**
 * Age Verification Storage Utility
 *
 * COPPA-compliant age verification gate.
 * Stores user's age verification status locally.
 *
 * Note: We don't store actual age/birthdate - only whether
 * the user has completed the age verification step.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from './logger';

const AGE_VERIFICATION_KEY = '@playbeacon_age_verified';
const PARENTAL_CONSENT_KEY = '@playbeacon_parental_consent';

/**
 * Check if user has completed age verification
 */
export const getAgeVerificationStatus = async () => {
  try {
    const value = await AsyncStorage.getItem(AGE_VERIFICATION_KEY);
    if (value !== null) {
      return JSON.parse(value);
    }
    return null; // Not yet verified
  } catch (error) {
    logger.error('Error reading age verification status:', error);
    return null;
  }
};

/**
 * Save age verification status
 * @param {Object} status - { isChild: boolean, hasParentalConsent: boolean }
 */
export const setAgeVerificationStatus = async (status) => {
  try {
    await AsyncStorage.setItem(AGE_VERIFICATION_KEY, JSON.stringify(status));
    return true;
  } catch (error) {
    logger.error('Error saving age verification status:', error);
    return false;
  }
};

/**
 * Clear age verification (for testing or account reset)
 */
export const clearAgeVerificationStatus = async () => {
  try {
    await AsyncStorage.removeItem(AGE_VERIFICATION_KEY);
    await AsyncStorage.removeItem(PARENTAL_CONSENT_KEY);
    return true;
  } catch (error) {
    logger.error('Error clearing age verification status:', error);
    return false;
  }
};

/**
 * Check if user is under 13 (COPPA age threshold)
 */
export const isUnder13 = async () => {
  const status = await getAgeVerificationStatus();
  return status?.isChild === true;
};

/**
 * Check if parental consent has been given (for under-13 users)
 */
export const hasParentalConsent = async () => {
  const status = await getAgeVerificationStatus();
  return status?.hasParentalConsent === true;
};
