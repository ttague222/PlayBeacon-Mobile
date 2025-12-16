import { registerRootComponent } from 'expo';
import { Alert, Platform } from 'react-native';

// Global error tracking for debugging white screen issues
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Send crash report to API (fire and forget, no auth required for crash reports)
const sendCrashReport = async (error, errorInfo = {}) => {
  try {
    const crashData = {
      message: error?.message || String(error),
      stack: error?.stack || 'No stack trace',
      componentStack: errorInfo?.componentStack || null,
      platform: Platform.OS,
      version: Platform.Version,
      timestamp: new Date().toISOString(),
      phase: errorInfo?.phase || 'unknown',
    };

    // Use fetch directly to avoid any dependency issues
    await fetch(`${API_BASE_URL}/crash-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(crashData),
    }).catch(() => {
      // Silently fail if API is unreachable
    });

    console.error('[CrashReporter] Error logged:', crashData.message);
  } catch (e) {
    // Don't let crash reporting itself crash the app
    console.error('[CrashReporter] Failed to send report:', e);
  }
};

// Set up global error handlers BEFORE importing App
// This catches errors that happen during module initialization
const originalHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error('[GlobalErrorHandler] Caught error:', error?.message || error);
  sendCrashReport(error, { phase: 'global', isFatal });

  // Still call original handler
  if (originalHandler) {
    originalHandler(error, isFatal);
  }
});

// Also catch unhandled promise rejections
if (typeof global !== 'undefined') {
  const originalRejectionHandler = global.onunhandledrejection;
  global.onunhandledrejection = (event) => {
    console.error('[UnhandledRejection] Caught:', event?.reason?.message || event?.reason);
    sendCrashReport(event?.reason || new Error('Unhandled rejection'), { phase: 'promise' });

    if (originalRejectionHandler) {
      originalRejectionHandler(event);
    }
  };
}

// Now import App (this is where most crashes happen)
let App;
try {
  console.log('[Index] Starting app import...');
  App = require('./App').default;
  console.log('[Index] App imported successfully');
} catch (error) {
  console.error('[Index] CRITICAL: App failed to import:', error?.message || error);
  sendCrashReport(error, { phase: 'app_import' });

  // Create a fallback error display component
  const { View, Text, StyleSheet, ScrollView } = require('react-native');

  App = () => (
    <View style={fallbackStyles.container}>
      <ScrollView contentContainerStyle={fallbackStyles.scroll}>
        <Text style={fallbackStyles.title}>App Failed to Load</Text>
        <Text style={fallbackStyles.subtitle}>Error during initialization:</Text>
        <Text style={fallbackStyles.error}>{error?.message || String(error)}</Text>
        <Text style={fallbackStyles.stack}>{error?.stack || 'No stack trace'}</Text>
        <Text style={fallbackStyles.hint}>This error has been reported.</Text>
      </ScrollView>
    </View>
  );
}

const fallbackStyles = {
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  scroll: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
  },
  error: {
    fontSize: 14,
    color: '#ffd93d',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  stack: {
    fontSize: 10,
    color: '#888888',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 20,
  },
  hint: {
    fontSize: 12,
    color: '#6bcb77',
    marginTop: 20,
  },
};

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
