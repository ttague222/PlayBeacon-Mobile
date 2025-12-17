/**
 * Terms of Service Screen
 *
 * Opens the Terms of Service in the device's browser.
 * This allows policy updates without requiring app updates.
 */

import { useEffect } from 'react';
import { Linking } from 'react-native';

const TERMS_OF_SERVICE_URL = 'https://watchlightinteractive.com/playbeacon-terms-of-service';

export default function TermsOfServiceScreen({ navigation, onClose }) {
  useEffect(() => {
    // Open the terms of service URL in the browser
    Linking.openURL(TERMS_OF_SERVICE_URL);

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
