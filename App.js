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

    // Adds more context data to events (IP address, cookies, user, etc.)
    // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
    sendDefaultPii: true,

    // Enable Logs
    enableLogs: true,

    // Configure Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
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