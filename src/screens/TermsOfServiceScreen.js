/**
 * Terms of Service Screen
 *
 * Opens the Terms of Service in the device's browser.
 * This allows policy updates without requiring app updates.
 */

import { useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import logger from '../utils/logger';

const TERMS_OF_SERVICE_URL = 'https://watchlightinteractive.com/playbeacon-terms-of-service';

export default function TermsOfServiceScreen({ navigation, onClose }) {
  useEffect(() => {
    const openTerms = async () => {
      try {
        // Try using expo-web-browser first (more reliable in-app browser)
        await WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL);
      } catch (webBrowserError) {
        logger.warn('WebBrowser failed, trying Linking:', webBrowserError);

        try {
          // Fallback to Linking
          const canOpen = await Linking.canOpenURL(TERMS_OF_SERVICE_URL);
          if (canOpen) {
            await Linking.openURL(TERMS_OF_SERVICE_URL);
          } else {
            throw new Error('Cannot open URL');
          }
        } catch (linkingError) {
          logger.error('Failed to open Terms of Service URL:', linkingError);
          Alert.alert(
            'Unable to Open',
            'Could not open the Terms of Service. Please visit watchlightinteractive.com/playbeacon-terms-of-service in your browser.',
            [{ text: 'OK' }]
          );
        }
      }

      // Close/go back after attempting to open
      if (onClose) {
        onClose();
      } else if (navigation?.goBack) {
        navigation.goBack();
      }
    };

    openTerms();
  }, [navigation, onClose]);

  // Return null - this screen just redirects to the browser
  return null;
}
