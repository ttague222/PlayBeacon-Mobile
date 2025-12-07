// Note: Sentry is currently disabled due to compatibility issues with Expo SDK
// These are stub functions that do nothing but prevent import errors

/**
 * Initialize Sentry error tracking
 * Currently disabled - this is a no-op stub function
 */
export const initializeSentry = () => {
  // Sentry disabled
};

/**
 * Manually capture an exception
 * Currently disabled - this is a no-op stub function
 */
export const captureException = (error, context = {}) => {
  // Sentry disabled
};

/**
 * Manually capture a message
 * Currently disabled - this is a no-op stub function
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  // Sentry disabled
};

/**
 * Set user context for error tracking
 * Currently disabled - this is a no-op stub function
 */
export const setUser = (user) => {
  // Sentry disabled
};

/**
 * Add breadcrumb for debugging
 * Currently disabled - this is a no-op stub function
 */
export const addBreadcrumb = (category, message, data = {}) => {
  // Sentry disabled
};

export default {
  init: () => {},
  captureException: () => {},
  captureMessage: () => {},
  setUser: () => {},
  addBreadcrumb: () => {},
};
