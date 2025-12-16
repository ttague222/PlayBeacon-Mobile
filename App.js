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

// Track initialization state
let sentryInitialized = false;
let Sentry = null;

// Safely initialize Sentry with comprehensive error handling
try {
  Sentry = require('@sentry/react-native');
  const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (sentryDsn && Sentry) {
    Sentry.init({
      dsn: sentryDsn,
      // COPPA Compliance: Do NOT send PII
      sendDefaultPii: false,
      enableLogs: false,
      // Disable Session Replay for stability
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      // Filter sensitive data
      beforeBreadcrumb(breadcrumb) {
        if (breadcrumb.category === 'navigation') {
          return null;
        }
        return breadcrumb;
      },
    });
    sentryInitialized = true;
    console.log('[App] Sentry initialized successfully');
  } else {
    console.log('[App] Sentry DSN not provided, skipping initialization');
  }
} catch (error) {
  console.warn('[App] Sentry initialization failed:', error?.message || error);
}

// Initialize custom error tracking (Firestore-based)
try {
  const { initializeSentry } = require('./src/config/sentry');
  initializeSentry();
} catch (error) {
  console.warn('[App] Custom error tracking initialization failed:', error?.message || error);
}

function AppContent() {
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

// Only wrap with Sentry if it initialized successfully
let ExportedApp;
if (sentryInitialized && Sentry) {
  try {
    ExportedApp = Sentry.wrap(AppContent);
    console.log('[App] App wrapped with Sentry');
  } catch (error) {
    console.warn('[App] Failed to wrap app with Sentry:', error?.message || error);
    ExportedApp = AppContent;
  }
} else {
  ExportedApp = AppContent;
}

export default ExportedApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
