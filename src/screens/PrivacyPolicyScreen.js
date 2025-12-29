/**
 * Privacy Policy Screen
 *
 * Opens the Privacy Policy in the device's browser.
 * This allows policy updates without requiring app updates.
 */

import { useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import logger from '../utils/logger';

const PRIVACY_POLICY_URL = 'https://watchlightinteractive.com/playbeacon-privacy-policy';

export default function PrivacyPolicyScreen({ navigation, onClose }) {
  useEffect(() => {
    const openPrivacyPolicy = async () => {
      try {
        // Try using expo-web-browser first (more reliable in-app browser)
        await WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);
      } catch (webBrowserError) {
        logger.warn('WebBrowser failed, trying Linking:', webBrowserError);

        try {
          // Fallback to Linking
          const canOpen = await Linking.canOpenURL(PRIVACY_POLICY_URL);
          if (canOpen) {
            await Linking.openURL(PRIVACY_POLICY_URL);
          } else {
            throw new Error('Cannot open URL');
          }
        } catch (linkingError) {
          logger.error('Failed to open Privacy Policy URL:', linkingError);
          Alert.alert(
            'Unable to Open',
            'Could not open the Privacy Policy. Please visit watchlightinteractive.com/playbeacon-privacy-policy in your browser.',
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

    openPrivacyPolicy();
  }, [navigation, onClose]);

  // Return null - this screen just redirects to the browser
  return null;
}
