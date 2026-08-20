/**
 * In-app store review prompt.
 *
 * Asks for a rating at a success moment (a game saved to a collection),
 * once per install, and only after the user has saved a few games so the
 * prompt lands on people who actually use the app. The OS further
 * rate-limits how often the dialog really appears, so calling
 * requestReview() is safe even if our own guards ever regress.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import logger from '../utils/logger';

const SAVE_COUNT_KEY = '@playbeacon/review_save_count';
const ASKED_KEY = '@playbeacon/review_asked';
const SAVES_BEFORE_ASKING = 3;

export async function recordSaveAndMaybeAskForReview() {
  try {
    const alreadyAsked = await AsyncStorage.getItem(ASKED_KEY);
    if (alreadyAsked) {
      return;
    }

    const raw = await AsyncStorage.getItem(SAVE_COUNT_KEY);
    const count = (parseInt(raw, 10) || 0) + 1;
    await AsyncStorage.setItem(SAVE_COUNT_KEY, String(count));

    if (count < SAVES_BEFORE_ASKING) {
      return;
    }

    if (!(await StoreReview.isAvailableAsync())) {
      return;
    }

    await AsyncStorage.setItem(ASKED_KEY, '1');
    await StoreReview.requestReview();
  } catch (error) {
    // Never let the review prompt interfere with the save flow.
    logger.error('Review prompt failed:', error);
  }
}
