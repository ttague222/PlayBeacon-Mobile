/**
 * Production-safe logger utility
 * Only outputs logs in development mode (__DEV__)
 * In production, logs are silently ignored for performance
 */

const isDev = __DEV__;

const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },

  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  error: (...args) => {
    if (isDev) {
      console.error(...args);
    }
  },

  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  },

  debug: (...args) => {
    if (isDev) {
      console.debug(...args);
    }
  },
};

export default logger;
