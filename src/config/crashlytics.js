/**
 * Crashlytics Error Tracking
 *
 * Provides error tracking for production using a custom lightweight solution
 * that logs errors to Firestore for monitoring (since Crashlytics requires native modules).
 *
 * For full native Crashlytics support, use @react-native-firebase/crashlytics
 * in a custom dev client build.
 *
 * COPPA Note: No personal data is collected - only anonymous error metadata.
 */

import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import logger from '../utils/logger';

// Configuration
const CONFIG = {
  enabled: process.env.NODE_ENV === 'production',
  collectionName: 'error_logs',
  maxBreadcrumbs: 20,
  sampleRate: 1.0, // 1.0 = 100% of errors logged
};

// In-memory breadcrumb trail (for debugging context)
let breadcrumbs = [];
let userContext = {};
let sessionId = null;

/**
 * Generate a unique session ID
 */
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Initialize error tracking
 */
export const initializeCrashlytics = () => {
  if (!CONFIG.enabled) {
    logger.log('[Crashlytics] Disabled in development mode');
    return;
  }

  sessionId = generateSessionId();
  logger.log('[Crashlytics] Initialized with session:', sessionId);

  // Set up global error handlers
  setupGlobalErrorHandlers();
};

/**
 * Set up global error handlers for uncaught exceptions
 */
const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  const originalHandler = global.onunhandledrejection;
  global.onunhandledrejection = (event) => {
    captureException(event.reason, {
      type: 'unhandled_promise_rejection',
    });
    if (originalHandler) {
      originalHandler(event);
    }
  };

  // Handle React Native errors via ErrorUtils
  if (global.ErrorUtils) {
    const originalGlobalHandler = global.ErrorUtils.getGlobalHandler();
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      captureException(error, {
        isFatal,
        type: 'global_error',
      });
      originalGlobalHandler?.(error, isFatal);
    });
  }
};

/**
 * Set user context for error tracking
 * COPPA Compliant: Only stores anonymous user ID
 */
export const setUser = (user) => {
  if (!user) {
    userContext = {};
    return;
  }

  // Only store anonymous, non-identifying information
  userContext = {
    uid: user.uid,
    isAnonymous: user.isAnonymous ?? true,
    // Never store email, name, or other PII for COPPA compliance
  };
};

/**
 * Add a breadcrumb for debugging context
 */
export const addBreadcrumb = (category, message, data = {}) => {
  const breadcrumb = {
    category,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  breadcrumbs.push(breadcrumb);

  // Keep only the most recent breadcrumbs
  if (breadcrumbs.length > CONFIG.maxBreadcrumbs) {
    breadcrumbs = breadcrumbs.slice(-CONFIG.maxBreadcrumbs);
  }
};

/**
 * Capture and log an exception
 */
export const captureException = async (error, context = {}) => {
  if (!CONFIG.enabled) {
    logger.error('[Crashlytics] Error captured (dev mode):', error);
    return null;
  }

  // Sample rate check
  if (Math.random() > CONFIG.sampleRate) {
    return null;
  }

  try {
    const errorLog = {
      // Error details
      message: error?.message || String(error),
      stack: error?.stack || null,
      name: error?.name || 'Error',

      // Context
      context: sanitizeContext(context),
      breadcrumbs: [...breadcrumbs],

      // User context (COPPA compliant - anonymous only)
      user: userContext,

      // Session info
      sessionId,
      timestamp: serverTimestamp(),

      // Environment
      environment: process.env.NODE_ENV || 'production',
      platform: getPlatform(),
      appVersion: getAppVersion(),
    };

    // Log to Firestore
    const docRef = await addDoc(collection(db, CONFIG.collectionName), errorLog);

    logger.log('[Crashlytics] Error logged:', docRef.id);
    return docRef.id;
  } catch (logError) {
    // Don't let error logging break the app
    logger.error('[Crashlytics] Failed to log error:', logError);
    return null;
  }
};

/**
 * Capture a message (for warnings, info, etc.)
 */
export const captureMessage = async (message, level = 'info', context = {}) => {
  if (!CONFIG.enabled) {
    logger.log(`[Crashlytics] Message (${level}):`, message);
    return null;
  }

  try {
    const messageLog = {
      type: 'message',
      message,
      level,
      context: sanitizeContext(context),
      user: userContext,
      sessionId,
      timestamp: serverTimestamp(),
      environment: process.env.NODE_ENV || 'production',
    };

    const docRef = await addDoc(collection(db, CONFIG.collectionName), messageLog);
    return docRef.id;
  } catch (logError) {
    logger.error('[Crashlytics] Failed to log message:', logError);
    return null;
  }
};

/**
 * Sanitize context data to prevent sensitive data leakage
 */
const sanitizeContext = (context) => {
  const sanitized = { ...context };

  // Remove any potentially sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'email', 'phone', 'address'];

  const removeSensitive = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    const result = Array.isArray(obj) ? [] : {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        result[key] = removeSensitive(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  return removeSensitive(sanitized);
};

/**
 * Get platform info
 */
const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    return {
      os: Platform.OS,
      version: Platform.Version,
    };
  } catch {
    return { os: 'unknown', version: 'unknown' };
  }
};

/**
 * Get app version
 */
const getAppVersion = () => {
  try {
    // This will be available in native builds
    const Constants = require('expo-constants').default;
    return Constants.expoConfig?.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
};

/**
 * Clear breadcrumbs
 */
export const clearBreadcrumbs = () => {
  breadcrumbs = [];
};

/**
 * Get current session ID
 */
export const getSessionId = () => sessionId;

// Export default object for convenience
export default {
  init: initializeCrashlytics,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  clearBreadcrumbs,
  getSessionId,
};
