/**
 * Privacy Policy Screen
 *
 * Opens the Privacy Policy in the device's browser.
 * This allows policy updates without requiring app updates.
 */

import { useEffect } from 'react';
import { Linking } from 'react-native';

const PRIVACY_POLICY_URL = 'https://watchlightinteractive.com/playbeacon-privacy-policy';

export default function PrivacyPolicyScreen({ navigation, onClose }) {
  useEffect(() => {
    // Open the privacy policy URL in the browser
    Linking.openURL(PRIVACY_POLICY_URL);

    // Close/go back after opening
    if (onClose) {
      onClose();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  }, [navigation, onClose]);

  // Return null - this screen just redirects to the browser
  return null;
}
