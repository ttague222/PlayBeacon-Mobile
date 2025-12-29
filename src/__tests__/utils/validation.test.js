/**
 * Validation Utility Tests
 *
 * Comprehensive tests for input validation and sanitization functions.
 */

import {
  sanitizeCollectionName,
  validateCollectionName,
  sanitizeCollectionDescription,
  validateCollectionDescription,
  // TEMPORARILY DISABLED: Roblox import feature pending Roblox approval
  // sanitizeRobloxUsername,
  // validateRobloxUsername,
  sanitizeNumericId,
  validateNumericId,
  sanitizeFeedback,
  validateFeedback,
  sanitizeLimit,
  sanitizeOffset,
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('sanitizeCollectionName', () => {
    it('should return empty string for null/undefined', () => {
      expect(sanitizeCollectionName(null)).toBe('');
      expect(sanitizeCollectionName(undefined)).toBe('');
    });

    it('should return empty string for non-string values', () => {
      expect(sanitizeCollectionName(123)).toBe('');
      expect(sanitizeCollectionName({})).toBe('');
      expect(sanitizeCollectionName([])).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeCollectionName('  Test  ')).toBe('Test');
      expect(sanitizeCollectionName('\tTabbed\t')).toBe('Tabbed');
      expect(sanitizeCollectionName('\n\nNewlines\n\n')).toBe('Newlines');
    });

    it('should limit length to 100 characters', () => {
      const longName = 'a'.repeat(150);
      expect(sanitizeCollectionName(longName).length).toBe(100);
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeCollectionName('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
      expect(sanitizeCollectionName('Test{inject}')).toBe('Testinject');
      expect(sanitizeCollectionName('Valid Name')).toBe('Valid Name');
    });

    it('should handle XSS attempts', () => {
      const result = sanitizeCollectionName('<img src=x onerror=alert(1)>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });
  });

  describe('validateCollectionName', () => {
    it('should return invalid for empty names', () => {
      expect(validateCollectionName('').valid).toBe(false);
      expect(validateCollectionName('').error).toBe('Collection name is required');
    });

    it('should return invalid for null/undefined', () => {
      expect(validateCollectionName(null).valid).toBe(false);
      expect(validateCollectionName(undefined).valid).toBe(false);
    });

    it('should return invalid for whitespace-only names', () => {
      expect(validateCollectionName('   ').valid).toBe(false);
      expect(validateCollectionName('\t\t').valid).toBe(false);
    });

    it('should return valid for proper names', () => {
      expect(validateCollectionName('My Collection').valid).toBe(true);
      expect(validateCollectionName('My Collection').error).toBeNull();
    });

    it('should accept names at boundary lengths', () => {
      expect(validateCollectionName('A').valid).toBe(true);
      expect(validateCollectionName('a'.repeat(100)).valid).toBe(true);
    });
  });

  describe('sanitizeCollectionDescription', () => {
    it('should return empty string for null/undefined', () => {
      expect(sanitizeCollectionDescription(null)).toBe('');
      expect(sanitizeCollectionDescription(undefined)).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeCollectionDescription('  Description  ')).toBe('Description');
    });

    it('should limit length to 500 characters', () => {
      const longDesc = 'a'.repeat(600);
      expect(sanitizeCollectionDescription(longDesc).length).toBe(500);
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeCollectionDescription('<script>bad</script>')).toBe('scriptbad/script');
    });
  });

  describe('validateCollectionDescription', () => {
    it('should return valid for empty/null (optional field)', () => {
      expect(validateCollectionDescription('').valid).toBe(true);
      expect(validateCollectionDescription(null).valid).toBe(true);
      expect(validateCollectionDescription(undefined).valid).toBe(true);
    });

    it('should return valid for normal descriptions', () => {
      expect(validateCollectionDescription('A nice collection of games').valid).toBe(true);
    });

    it('should handle descriptions at max length', () => {
      expect(validateCollectionDescription('a'.repeat(500)).valid).toBe(true);
    });
  });

  // TEMPORARILY DISABLED: Roblox import feature pending Roblox approval
  // describe('sanitizeRobloxUsername', () => {
  //   it('should return empty string for null/undefined', () => {
  //     expect(sanitizeRobloxUsername(null)).toBe('');
  //     expect(sanitizeRobloxUsername(undefined)).toBe('');
  //   });

  //   it('should trim whitespace', () => {
  //     expect(sanitizeRobloxUsername('  Player123  ')).toBe('Player123');
  //   });

  //   it('should limit length to 20 characters', () => {
  //     const longUsername = 'a'.repeat(30);
  //     expect(sanitizeRobloxUsername(longUsername).length).toBe(20);
  //   });

  //   it('should only allow alphanumeric and underscore', () => {
  //     expect(sanitizeRobloxUsername('Player_123')).toBe('Player_123');
  //     expect(sanitizeRobloxUsername('Player@123')).toBe('Player123');
  //     expect(sanitizeRobloxUsername('Player 123')).toBe('Player123');
  //     expect(sanitizeRobloxUsername('Player-123')).toBe('Player123');
  //   });

  //   it('should handle special characters', () => {
  //     expect(sanitizeRobloxUsername('<script>')).toBe('script');
  //     expect(sanitizeRobloxUsername("'; DROP TABLE users;--")).toBe('DROPTABLEusers');
  //   });
  // });

  // describe('validateRobloxUsername', () => {
  //   it('should return invalid for empty usernames', () => {
  //     expect(validateRobloxUsername('').valid).toBe(false);
  //     expect(validateRobloxUsername('').error).toBe('Username is required');
  //   });

  //   it('should return invalid for usernames less than 3 characters', () => {
  //     expect(validateRobloxUsername('AB').valid).toBe(false);
  //     expect(validateRobloxUsername('AB').error).toBe('Username must be at least 3 characters');
  //   });

  //   it('should return invalid for usernames starting with number', () => {
  //     expect(validateRobloxUsername('123Player').valid).toBe(false);
  //     expect(validateRobloxUsername('123Player').error).toBe('Username cannot start with a number');
  //   });

  //   it('should return valid for proper usernames', () => {
  //     expect(validateRobloxUsername('Player123').valid).toBe(true);
  //     expect(validateRobloxUsername('Cool_Gamer').valid).toBe(true);
  //     expect(validateRobloxUsername('ABC').valid).toBe(true);
  //   });
  // });

  describe('sanitizeNumericId', () => {
    it('should return number for valid positive numbers', () => {
      expect(sanitizeNumericId(123)).toBe(123);
      expect(sanitizeNumericId(1)).toBe(1);
    });

    it('should apply Math.abs for negative numbers', () => {
      expect(sanitizeNumericId(-123)).toBe(123);
      expect(sanitizeNumericId(-1)).toBe(1);
    });

    it('should floor decimal numbers', () => {
      expect(sanitizeNumericId(123.7)).toBe(123);
      expect(sanitizeNumericId(1.9)).toBe(1);
    });

    it('should parse string numbers', () => {
      expect(sanitizeNumericId('123')).toBe(123);
      expect(sanitizeNumericId('-456')).toBe(456);
    });

    it('should return null for invalid inputs', () => {
      expect(sanitizeNumericId(null)).toBeNull();
      expect(sanitizeNumericId(undefined)).toBeNull();
      expect(sanitizeNumericId('abc')).toBeNull();
      expect(sanitizeNumericId('')).toBeNull();
      expect(sanitizeNumericId({})).toBeNull();
    });

    it('should handle zero', () => {
      expect(sanitizeNumericId(0)).toBe(0);
      expect(sanitizeNumericId('0')).toBe(0);
    });
  });

  describe('validateNumericId', () => {
    it('should return valid for positive numbers', () => {
      expect(validateNumericId(123).valid).toBe(true);
      expect(validateNumericId(1).valid).toBe(true);
    });

    it('should return valid for negative numbers (abs applied)', () => {
      // sanitizeNumericId converts -1 to 1, which is valid
      expect(validateNumericId(-1).valid).toBe(true);
    });

    it('should return invalid for null', () => {
      const result = validateNumericId(null, 'User ID');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('User ID must be a valid number');
    });

    it('should return invalid for non-numeric strings', () => {
      const result = validateNumericId('abc', 'Game ID');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Game ID must be a valid number');
    });

    it('should return invalid for zero (after sanitization)', () => {
      const result = validateNumericId(0, 'Universe ID');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Universe ID must be greater than 0');
    });

    it('should use default field name', () => {
      const result = validateNumericId(null);
      expect(result.error).toBe('ID must be a valid number');
    });
  });

  describe('sanitizeFeedback', () => {
    it('should accept -1, 0, 1', () => {
      expect(sanitizeFeedback(-1)).toBe(-1);
      expect(sanitizeFeedback(0)).toBe(0);
      expect(sanitizeFeedback(1)).toBe(1);
    });

    it('should parse string values', () => {
      expect(sanitizeFeedback('-1')).toBe(-1);
      expect(sanitizeFeedback('0')).toBe(0);
      expect(sanitizeFeedback('1')).toBe(1);
    });

    it('should return null for invalid values', () => {
      expect(sanitizeFeedback(2)).toBeNull();
      expect(sanitizeFeedback(-2)).toBeNull();
      expect(sanitizeFeedback(10)).toBeNull();
      expect(sanitizeFeedback('like')).toBeNull();
      expect(sanitizeFeedback(null)).toBeNull();
    });
  });

  describe('validateFeedback', () => {
    it('should return valid for -1, 0, 1', () => {
      expect(validateFeedback(-1).valid).toBe(true);
      expect(validateFeedback(0).valid).toBe(true);
      expect(validateFeedback(1).valid).toBe(true);
    });

    it('should return invalid for other values', () => {
      expect(validateFeedback(2).valid).toBe(false);
      expect(validateFeedback(2).error).toBe('Feedback must be -1, 0, or 1');
    });
  });

  describe('sanitizeLimit', () => {
    it('should return the limit if within max', () => {
      expect(sanitizeLimit(10, 100)).toBe(10);
      expect(sanitizeLimit(50, 100)).toBe(50);
    });

    it('should cap at max limit', () => {
      expect(sanitizeLimit(150, 100)).toBe(100);
      expect(sanitizeLimit(200, 50)).toBe(50);
    });

    it('should return default (10) for invalid values', () => {
      expect(sanitizeLimit(-1, 100)).toBe(10);
      expect(sanitizeLimit(0, 100)).toBe(10);
      expect(sanitizeLimit('abc', 100)).toBe(10);
      expect(sanitizeLimit(null, 100)).toBe(10);
    });

    it('should parse string numbers', () => {
      expect(sanitizeLimit('25', 100)).toBe(25);
    });

    it('should use default max of 100', () => {
      expect(sanitizeLimit(150)).toBe(100);
    });
  });

  describe('sanitizeOffset', () => {
    it('should return the offset for valid values', () => {
      expect(sanitizeOffset(0)).toBe(0);
      expect(sanitizeOffset(10)).toBe(10);
      expect(sanitizeOffset(100)).toBe(100);
    });

    it('should return 0 for negative values', () => {
      expect(sanitizeOffset(-1)).toBe(0);
      expect(sanitizeOffset(-100)).toBe(0);
    });

    it('should return 0 for invalid values', () => {
      expect(sanitizeOffset('abc')).toBe(0);
      expect(sanitizeOffset(null)).toBe(0);
      expect(sanitizeOffset(undefined)).toBe(0);
    });

    it('should parse string numbers', () => {
      expect(sanitizeOffset('50')).toBe(50);
    });
  });
});
