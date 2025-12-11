/**
 * Unit Tests for Validation Utilities
 *
 * Tests input sanitization and validation functions
 * to ensure security and data integrity.
 */

import {
  sanitizeCollectionName,
  validateCollectionName,
  sanitizeCollectionDescription,
  validateCollectionDescription,
  sanitizeRobloxUsername,
  validateRobloxUsername,
  sanitizeNumericId,
  validateNumericId,
  sanitizeFeedback,
  validateFeedback,
  sanitizeLimit,
  sanitizeOffset,
} from '../../utils/validation';

describe('Validation Utilities', () => {
  // ==========================================
  // Collection Name Tests
  // ==========================================
  describe('sanitizeCollectionName', () => {
    it('should trim whitespace', () => {
      expect(sanitizeCollectionName('  My Collection  ')).toBe('My Collection');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeCollectionName('My <script>alert("xss")</script> Collection')).toBe('My scriptalert("xss")/script Collection');
      expect(sanitizeCollectionName('Test {injection}')).toBe('Test injection');
    });

    it('should limit length to 100 characters', () => {
      const longName = 'a'.repeat(150);
      expect(sanitizeCollectionName(longName).length).toBe(100);
    });

    it('should return empty string for null/undefined', () => {
      expect(sanitizeCollectionName(null)).toBe('');
      expect(sanitizeCollectionName(undefined)).toBe('');
    });

    it('should return empty string for non-string inputs', () => {
      expect(sanitizeCollectionName(123)).toBe('');
      expect(sanitizeCollectionName({})).toBe('');
      expect(sanitizeCollectionName([])).toBe('');
    });
  });

  describe('validateCollectionName', () => {
    it('should accept valid names', () => {
      expect(validateCollectionName('My Games').valid).toBe(true);
      expect(validateCollectionName('A').valid).toBe(true);
      expect(validateCollectionName('RPG Games 2024').valid).toBe(true);
    });

    it('should reject empty names', () => {
      const result = validateCollectionName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Collection name is required');
    });

    it('should reject whitespace-only names', () => {
      const result = validateCollectionName('   ');
      expect(result.valid).toBe(false);
    });

    it('should reject null/undefined', () => {
      expect(validateCollectionName(null).valid).toBe(false);
      expect(validateCollectionName(undefined).valid).toBe(false);
    });
  });

  // ==========================================
  // Collection Description Tests
  // ==========================================
  describe('sanitizeCollectionDescription', () => {
    it('should trim whitespace', () => {
      expect(sanitizeCollectionDescription('  Description  ')).toBe('Description');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeCollectionDescription('Desc <script>bad</script>')).toBe('Desc scriptbad/script');
    });

    it('should limit length to 500 characters', () => {
      const longDesc = 'a'.repeat(600);
      expect(sanitizeCollectionDescription(longDesc).length).toBe(500);
    });

    it('should return empty string for null/undefined', () => {
      expect(sanitizeCollectionDescription(null)).toBe('');
      expect(sanitizeCollectionDescription(undefined)).toBe('');
    });
  });

  describe('validateCollectionDescription', () => {
    it('should accept valid descriptions', () => {
      expect(validateCollectionDescription('A collection of games').valid).toBe(true);
    });

    it('should accept empty/null descriptions (optional field)', () => {
      expect(validateCollectionDescription('').valid).toBe(true);
      expect(validateCollectionDescription(null).valid).toBe(true);
      expect(validateCollectionDescription(undefined).valid).toBe(true);
    });
  });

  // ==========================================
  // Roblox Username Tests
  // ==========================================
  describe('sanitizeRobloxUsername', () => {
    it('should trim whitespace', () => {
      expect(sanitizeRobloxUsername('  Player123  ')).toBe('Player123');
    });

    it('should remove special characters', () => {
      expect(sanitizeRobloxUsername('Player@123!')).toBe('Player123');
      expect(sanitizeRobloxUsername('Player<script>')).toBe('Playerscript');
    });

    it('should allow underscores', () => {
      expect(sanitizeRobloxUsername('Player_Name')).toBe('Player_Name');
    });

    it('should limit length to 20 characters', () => {
      const longName = 'a'.repeat(30);
      expect(sanitizeRobloxUsername(longName).length).toBe(20);
    });

    it('should return empty string for null/undefined', () => {
      expect(sanitizeRobloxUsername(null)).toBe('');
      expect(sanitizeRobloxUsername(undefined)).toBe('');
    });
  });

  describe('validateRobloxUsername', () => {
    it('should accept valid usernames', () => {
      expect(validateRobloxUsername('Player123').valid).toBe(true);
      expect(validateRobloxUsername('Cool_Player').valid).toBe(true);
      expect(validateRobloxUsername('ABC').valid).toBe(true);
    });

    it('should reject usernames starting with numbers', () => {
      const result = validateRobloxUsername('123Player');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot start with a number');
    });

    it('should reject usernames shorter than 3 characters', () => {
      const result = validateRobloxUsername('AB');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });

    it('should reject empty usernames', () => {
      expect(validateRobloxUsername('').valid).toBe(false);
      expect(validateRobloxUsername(null).valid).toBe(false);
    });
  });

  // ==========================================
  // Numeric ID Tests
  // ==========================================
  describe('sanitizeNumericId', () => {
    it('should accept valid numbers', () => {
      expect(sanitizeNumericId(12345)).toBe(12345);
      expect(sanitizeNumericId('67890')).toBe(67890);
    });

    it('should floor decimal numbers', () => {
      expect(sanitizeNumericId(123.456)).toBe(123);
    });

    it('should convert negative to positive', () => {
      expect(sanitizeNumericId(-123)).toBe(123);
    });

    it('should return null for invalid inputs', () => {
      expect(sanitizeNumericId('abc')).toBe(null);
      expect(sanitizeNumericId(null)).toBe(null);
      expect(sanitizeNumericId(undefined)).toBe(null);
      expect(sanitizeNumericId({})).toBe(null);
    });
  });

  describe('validateNumericId', () => {
    it('should accept valid positive IDs', () => {
      expect(validateNumericId(12345).valid).toBe(true);
      expect(validateNumericId('67890').valid).toBe(true);
    });

    it('should reject zero', () => {
      const result = validateNumericId(0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('greater than 0');
    });

    it('should reject invalid inputs', () => {
      expect(validateNumericId('abc').valid).toBe(false);
      expect(validateNumericId(null).valid).toBe(false);
    });

    it('should use custom field name in error', () => {
      const result = validateNumericId('abc', 'Universe ID');
      expect(result.error).toContain('Universe ID');
    });
  });

  // ==========================================
  // Feedback Tests
  // ==========================================
  describe('sanitizeFeedback', () => {
    it('should accept valid feedback values', () => {
      expect(sanitizeFeedback(-1)).toBe(-1);
      expect(sanitizeFeedback(0)).toBe(0);
      expect(sanitizeFeedback(1)).toBe(1);
    });

    it('should accept string feedback values', () => {
      expect(sanitizeFeedback('-1')).toBe(-1);
      expect(sanitizeFeedback('0')).toBe(0);
      expect(sanitizeFeedback('1')).toBe(1);
    });

    it('should return null for invalid values', () => {
      expect(sanitizeFeedback(2)).toBe(null);
      expect(sanitizeFeedback(-2)).toBe(null);
      expect(sanitizeFeedback('abc')).toBe(null);
      expect(sanitizeFeedback(null)).toBe(null);
    });
  });

  describe('validateFeedback', () => {
    it('should accept valid feedback', () => {
      expect(validateFeedback(-1).valid).toBe(true);
      expect(validateFeedback(0).valid).toBe(true);
      expect(validateFeedback(1).valid).toBe(true);
    });

    it('should reject invalid feedback', () => {
      expect(validateFeedback(5).valid).toBe(false);
      expect(validateFeedback('invalid').valid).toBe(false);
    });
  });

  // ==========================================
  // Pagination Tests
  // ==========================================
  describe('sanitizeLimit', () => {
    it('should accept valid limits', () => {
      expect(sanitizeLimit(50)).toBe(50);
      expect(sanitizeLimit('25')).toBe(25);
    });

    it('should enforce maximum limit', () => {
      expect(sanitizeLimit(200)).toBe(100);
      expect(sanitizeLimit(500, 50)).toBe(50);
    });

    it('should return default for invalid inputs', () => {
      expect(sanitizeLimit('abc')).toBe(10);
      expect(sanitizeLimit(-5)).toBe(10);
      expect(sanitizeLimit(0)).toBe(10);
    });
  });

  describe('sanitizeOffset', () => {
    it('should accept valid offsets', () => {
      expect(sanitizeOffset(10)).toBe(10);
      expect(sanitizeOffset('50')).toBe(50);
      expect(sanitizeOffset(0)).toBe(0);
    });

    it('should return 0 for invalid inputs', () => {
      expect(sanitizeOffset('abc')).toBe(0);
      expect(sanitizeOffset(-5)).toBe(0);
      expect(sanitizeOffset(null)).toBe(0);
    });
  });

  // ==========================================
  // Security Tests (XSS Prevention)
  // ==========================================
  describe('XSS Prevention', () => {
    const xssAttempts = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert("xss")>',
      '"><script>alert("xss")</script>',
      "'; DROP TABLE users; --",
      '${process.env.SECRET}',
      '{{constructor.constructor("return this")()}}',
    ];

    it('should sanitize XSS attempts in collection names', () => {
      xssAttempts.forEach(attempt => {
        const sanitized = sanitizeCollectionName(attempt);
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
        expect(sanitized).not.toContain('{');
        expect(sanitized).not.toContain('}');
      });
    });

    it('should sanitize XSS attempts in descriptions', () => {
      xssAttempts.forEach(attempt => {
        const sanitized = sanitizeCollectionDescription(attempt);
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
      });
    });

    it('should sanitize XSS attempts in usernames', () => {
      xssAttempts.forEach(attempt => {
        const sanitized = sanitizeRobloxUsername(attempt);
        // Username should only contain alphanumeric and underscore
        expect(sanitized).toMatch(/^[a-zA-Z0-9_]*$/);
      });
    });
  });
});
