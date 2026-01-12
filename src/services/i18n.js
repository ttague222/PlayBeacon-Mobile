/**
 * PlayBeacon i18n Configuration
 *
 * Internationalization setup using i18next and react-i18next.
 * Supports English and Spanish with device language auto-detection.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import es from '../locales/es.json';

const LANGUAGE_KEY = '@playbeacon_language';

// Supported languages
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Espanol' },
};

// Get stored language preference or device language
const getInitialLanguage = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (storedLanguage && LANGUAGES[storedLanguage]) {
      return storedLanguage;
    }
  } catch (error) {
    console.log('[i18n] Error reading stored language:', error);
  }

  // Fall back to device language
  const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
  return LANGUAGES[deviceLanguage] ? deviceLanguage : 'en';
};

// Initialize i18n
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

  return i18n;
};

// Change language and persist preference
export const changeLanguage = async (languageCode) => {
  if (!LANGUAGES[languageCode]) {
    console.warn('[i18n] Unsupported language:', languageCode);
    return false;
  }

  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
    await i18n.changeLanguage(languageCode);
    return true;
  } catch (error) {
    console.error('[i18n] Error changing language:', error);
    return false;
  }
};

// Get current language
export const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

// Initialize on module load
initI18n();

export default i18n;
