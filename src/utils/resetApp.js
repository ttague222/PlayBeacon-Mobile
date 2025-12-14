/**
 * App Reset Utility
 *
 * Clears all local data to reset the app to a fresh state.
 * Used for "Start Fresh" functionality and testing.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import logger from './logger';

/**
 * All AsyncStorage keys used by the app
 */
const ASYNC_STORAGE_KEYS = [
  '@playbeacon_tutorial_completed',
  '@playbeacon_age_verified',
  '@playbeacon_parental_consent',
  '@playbeacon_collection_progress',
  '@playbeacon_ad_tracking',
  '@playbeacon_premium',
  '@playbeacon_sound_settings',
  '@playbeacon_offline_queue',
];

/**
 * SecureStore keys used by the app
 */
const SECURE_STORE_KEYS = [
  '@playbeacon_auth_uid',
  '@playbeacon_linked_google',
];

/**
 * Clear all local data from AsyncStorage and SecureStore
 * This resets the app to a fresh state as if it was just installed.
 *
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function clearAllLocalData() {
  try {
    logger.log('[resetApp] Clearing all local data...');

    // Clear all AsyncStorage keys
    await AsyncStorage.multiRemove(ASYNC_STORAGE_KEYS);
    logger.log('[resetApp] Cleared AsyncStorage keys');

    // Clear SecureStore keys
    for (const key of SECURE_STORE_KEYS) {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        // SecureStore might fail silently if key doesn't exist
        logger.log(`[resetApp] SecureStore key ${key} not found or already cleared`);
      }
    }
    logger.log('[resetApp] Cleared SecureStore keys');

    logger.log('[resetApp] All local data cleared successfully');
    return true;
  } catch (error) {
    logger.error('[resetApp] Failed to clear local data:', error);
    return false;
  }
}

/**
 * Get the list of all storage keys (for debugging)
 */
export function getAllStorageKeys() {
  return {
    asyncStorage: ASYNC_STORAGE_KEYS,
    secureStore: SECURE_STORE_KEYS,
  };
}

export default { clearAllLocalData, getAllStorageKeys };
