import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { AdProvider } from './src/context/AdContext';
import AppNavigator from './src/navigation/AppNavigator';
// import { initializeSentry } from './src/config/sentry';

// Note: Sentry initialization is commented out due to compatibility issues with current Expo SDK
// To enable error tracking in production:
// 1. Set up a Sentry project at https://sentry.io
// 2. Add EXPO_PUBLIC_SENTRY_DSN to .env.production
// 3. Uncomment the import and initialization below
// initializeSentry();

export default function App() {
  return (
    <AuthProvider>
      <AdProvider>
        <AppNavigator />
      </AdProvider>
    </AuthProvider>
  );
}
