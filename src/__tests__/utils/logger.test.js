/**
 * Unit Tests for Logger Utility
 *
 * Tests production-safe logging behavior that only outputs in development mode.
 */

// Store original __DEV__ value
const originalDev = global.__DEV__;

describe('Logger Utility', () => {
  let consoleSpy;
  let logger;

  beforeEach(() => {
    // Clear module cache to allow re-importing with different __DEV__ values
    jest.resetModules();

    // Spy on console methods
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
    };
  });

  afterEach(() => {
    // Restore console methods
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    // Restore __DEV__
    global.__DEV__ = originalDev;
  });

  describe('in development mode (__DEV__ = true)', () => {
    beforeEach(() => {
      global.__DEV__ = true;
      // Re-import logger with new __DEV__ value
      logger = require('../../utils/logger').default;
    });

    it('should call console.log when logger.log is called', () => {
      logger.log('test message');
      expect(consoleSpy.log).toHaveBeenCalledWith('test message');
    });

    it('should call console.warn when logger.warn is called', () => {
      logger.warn('warning message');
      expect(consoleSpy.warn).toHaveBeenCalledWith('warning message');
    });

    it('should call console.error when logger.error is called', () => {
      logger.error('error message');
      expect(consoleSpy.error).toHaveBeenCalledWith('error message');
    });

    it('should call console.info when logger.info is called', () => {
      logger.info('info message');
      expect(consoleSpy.info).toHaveBeenCalledWith('info message');
    });

    it('should call console.debug when logger.debug is called', () => {
      logger.debug('debug message');
      expect(consoleSpy.debug).toHaveBeenCalledWith('debug message');
    });

    it('should pass multiple arguments to console methods', () => {
      logger.log('message', { data: 'test' }, 123);
      expect(consoleSpy.log).toHaveBeenCalledWith('message', { data: 'test' }, 123);
    });

    it('should pass error objects correctly', () => {
      const error = new Error('Test error');
      logger.error('An error occurred:', error);
      expect(consoleSpy.error).toHaveBeenCalledWith('An error occurred:', error);
    });
  });

  describe('in production mode (__DEV__ = false)', () => {
    beforeEach(() => {
      global.__DEV__ = false;
      jest.resetModules();
      logger = require('../../utils/logger').default;
    });

    it('should NOT call console.log when logger.log is called', () => {
      logger.log('test message');
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should NOT call console.warn when logger.warn is called', () => {
      logger.warn('warning message');
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    it('should NOT call console.error when logger.error is called', () => {
      logger.error('error message');
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('should NOT call console.info when logger.info is called', () => {
      logger.info('info message');
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });

    it('should NOT call console.debug when logger.debug is called', () => {
      logger.debug('debug message');
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it('should silently ignore multiple arguments', () => {
      logger.log('message', { data: 'test' }, 123);
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should silently ignore error objects', () => {
      const error = new Error('Test error');
      logger.error('An error occurred:', error);
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });
  });

  describe('API completeness', () => {
    beforeEach(() => {
      global.__DEV__ = true;
      jest.resetModules();
      logger = require('../../utils/logger').default;
    });

    it('should have all standard logging methods', () => {
      expect(typeof logger.log).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should be a valid default export', () => {
      expect(logger).toBeDefined();
      expect(typeof logger).toBe('object');
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      global.__DEV__ = true;
      jest.resetModules();
      logger = require('../../utils/logger').default;
    });

    it('should handle undefined arguments', () => {
      expect(() => logger.log(undefined)).not.toThrow();
      expect(consoleSpy.log).toHaveBeenCalledWith(undefined);
    });

    it('should handle null arguments', () => {
      expect(() => logger.log(null)).not.toThrow();
      expect(consoleSpy.log).toHaveBeenCalledWith(null);
    });

    it('should handle empty calls', () => {
      expect(() => logger.log()).not.toThrow();
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should handle array arguments', () => {
      logger.log([1, 2, 3]);
      expect(consoleSpy.log).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('should handle nested objects', () => {
      const nested = { a: { b: { c: 'deep' } } };
      logger.log(nested);
      expect(consoleSpy.log).toHaveBeenCalledWith(nested);
    });

    it('should handle circular references without crashing', () => {
      const obj = { name: 'test' };
      obj.self = obj;
      expect(() => logger.log(obj)).not.toThrow();
    });
  });
});
