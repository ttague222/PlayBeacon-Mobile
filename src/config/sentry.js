/**
 * Sentry-compatible Error Tracking Interface
 *
 * This module provides a Sentry-compatible API but uses our custom
 * Firestore-based error tracking (crashlytics.js) under the hood.
 *
 * This allows existing code that imports from sentry.js to work
 * without modification while using our production-ready solution.
 */

import crashlytics, {
  initializeCrashlytics,
  captureException as crashCaptureException,
  captureMessage as crashCaptureMessage,
  setUser as crashSetUser,
  addBreadcrumb as crashAddBreadcrumb,
} from './crashlytics';

/**
 * Initialize error tracking
 */
export const initializeSentry = () => {
  initializeCrashlytics();
};

/**
 * Manually capture an exception
 */
export const captureException = (error, context = {}) => {
  return crashCaptureException(error, context);
};

/**
 * Manually capture a message
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  return crashCaptureMessage(message, level, context);
};

/**
 * Set user context for error tracking
 */
export const setUser = (user) => {
  crashSetUser(user);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (category, message, data = {}) => {
  crashAddBreadcrumb(category, message, data);
};

export default {
  init: initializeSentry,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
};
