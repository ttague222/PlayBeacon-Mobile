import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AdProvider } from './src/context/AdContext';
import { PremiumProvider } from './src/context/PremiumContext';
import { AnimationProvider } from './src/context/AnimationContext';
import { BearProvider } from './src/context/BearContext';
import { SoundProvider } from './src/context/SoundContext';
import { CollectionProvider } from './src/context/CollectionContext';
import { NetworkProvider } from './src/context/NetworkContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components';
import { initializeSentry } from './src/config/sentry';
import * as Sentry from '@sentry/react-native';

// Only initialize Sentry if DSN is provided via environment variable
const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,

    // COPPA Compliance: Do NOT send PII (IP address, cookies, user data, etc.)
    // This app is intended for children under 13
    sendDefaultPii: false,

    // Enable error logging only (not verbose)
    enableLogs: false,

    // Configure Session Replay - disabled for privacy (COPPA compliance)
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    integrations: [Sentry.mobileReplayIntegration()],

    // Filter sensitive data from breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Don't send navigation breadcrumbs with user data
      if (breadcrumb.category === 'navigation') {
        return null;
      }
      return breadcrumb;
    },
  });
}

// Initialize error tracking
// Logs errors to Firestore in production for monitoring
initializeSentry();

export default Sentry.wrap(function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NetworkProvider>
          <SoundProvider>
            <AuthProvider>
              <PremiumProvider>
                <AdProvider>
                  <AnimationProvider>
                    <BearProvider>
                      <CollectionProvider>
                        <View style={styles.container}>
                          <AppNavigator />
                        </View>
                      </CollectionProvider>
                    </BearProvider>
                  </AnimationProvider>
                </AdProvider>
              </PremiumProvider>
            </AuthProvider>
          </SoundProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});