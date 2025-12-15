import React, { useEffect } from 'react';
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

// Track if Sentry initialized successfully
let sentryInitialized = false;

// Safely initialize Sentry - wrapped in try/catch to prevent white screen crashes
try {
  const Sentry = require('@sentry/react-native');
  const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,

      // COPPA Compliance: Do NOT send PII (IP address, cookies, user data, etc.)
      // This app is intended for children under 13
      sendDefaultPii: false,

      // Enable error logging only (not verbose)
      enableLogs: false,

      // Disable Session Replay entirely for COPPA compliance and stability
      // mobileReplayIntegration can cause iOS crashes if not properly configured
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,

      // Filter sensitive data from breadcrumbs
      beforeBreadcrumb(breadcrumb) {
        // Don't send navigation breadcrumbs with user data
        if (breadcrumb.category === 'navigation') {
          return null;
        }
        return breadcrumb;
      },
    });
    sentryInitialized = true;
  }
} catch (error) {
  // Silently fail Sentry initialization to prevent app crashes
  console.warn('Sentry initialization failed:', error);
}

function App() {
  // Initialize custom crashlytics inside React lifecycle (safer)
  useEffect(() => {
    try {
      const { initializeSentry } = require('./src/config/sentry');
      initializeSentry();
    } catch (error) {
      console.warn('Custom error tracking initialization failed:', error);
    }
  }, []);
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Only wrap with Sentry if it initialized successfully
// This prevents white screen crashes on iOS if Sentry has issues
let ExportedApp = App;
if (sentryInitialized) {
  try {
    const Sentry = require('@sentry/react-native');
    ExportedApp = Sentry.wrap(App);
  } catch (error) {
    console.warn('Failed to wrap app with Sentry:', error);
  }
}

export default ExportedApp;