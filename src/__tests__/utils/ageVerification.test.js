/**
 * Unit Tests for Age Verification Utilities
 *
 * Tests COPPA-compliant age verification functions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAgeVerificationStatus,
  setAgeVerificationStatus,
  clearAgeVerificationStatus,
  isUnder13,
  hasParentalConsent,
} from '../../utils/ageVerification';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Age Verification Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getAgeVerificationStatus Tests
  // ==========================================
  describe('getAgeVerificationStatus', () => {
    it('should return null when no status is stored', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await getAgeVerificationStatus();

      expect(result).toBe(null);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@playbeacon_age_verified');
    });

    it('should return parsed status when stored', async () => {
      const mockStatus = { isChild: true, hasParentalConsent: true };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStatus));

      const result = await getAgeVerificationStatus();

      expect(result).toEqual(mockStatus);
    });

    it('should return null on error', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await getAgeVerificationStatus();

      expect(result).toBe(null);
    });
  });

  // ==========================================
  // setAgeVerificationStatus Tests
  // ==========================================
  describe('setAgeVerificationStatus', () => {
    it('should store status correctly for child with consent', async () => {
      AsyncStorage.setItem.mockResolvedValue();

      const status = { isChild: true, hasParentalConsent: true };
      const result = await setAgeVerificationStatus(status);

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@playbeacon_age_verified',
        JSON.stringify(status)
      );
    });

    it('should store status correctly for adult', async () => {
      AsyncStorage.setItem.mockResolvedValue();

      const status = { isChild: false, hasParentalConsent: false };
      const result = await setAgeVerificationStatus(status);

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@playbeacon_age_verified',
        JSON.stringify(status)
      );
    });

    it('should return false on error', async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const result = await setAgeVerificationStatus({ isChild: true, hasParentalConsent: true });

      expect(result).toBe(false);
    });
  });

  // ==========================================
  // clearAgeVerificationStatus Tests
  // ==========================================
  describe('clearAgeVerificationStatus', () => {
    it('should clear both storage keys', async () => {
      AsyncStorage.removeItem.mockResolvedValue();

      const result = await clearAgeVerificationStatus();

      expect(result).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@playbeacon_age_verified');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@playbeacon_parental_consent');
    });

    it('should return false on error', async () => {
      AsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      const result = await clearAgeVerificationStatus();

      expect(result).toBe(false);
    });
  });

  // ==========================================
  // isUnder13 Tests
  // ==========================================
  describe('isUnder13', () => {
    it('should return true when user is a child', async () => {
      AsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({ isChild: true, hasParentalConsent: true })
      );

      const result = await isUnder13();

      expect(result).toBe(true);
    });

    it('should return false when user is not a child', async () => {
      AsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({ isChild: false, hasParentalConsent: false })
      );

      const result = await isUnder13();

      expect(result).toBe(false);
    });

    it('should return false when no status exists', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await isUnder13();

      expect(result).toBe(false);
    });
  });

  // ==========================================
  // hasParentalConsent Tests
  // ==========================================
  describe('hasParentalConsent', () => {
    it('should return true when parental consent is given', async () => {
      AsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({ isChild: true, hasParentalConsent: true })
      );

      const result = await hasParentalConsent();

      expect(result).toBe(true);
    });

    it('should return false when parental consent is not given', async () => {
      AsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({ isChild: true, hasParentalConsent: false })
      );

      const result = await hasParentalConsent();

      expect(result).toBe(false);
    });

    it('should return false when no status exists', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await hasParentalConsent();

      expect(result).toBe(false);
    });
  });

  // ==========================================
  // COPPA Compliance Tests
  // ==========================================
  describe('COPPA Compliance', () => {
    it('should not store actual birthdate or age', async () => {
      AsyncStorage.setItem.mockResolvedValue();

      // Status should only contain boolean flags, not actual age data
      const status = { isChild: true, hasParentalConsent: true };
      await setAgeVerificationStatus(status);

      const storedData = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);

      // Verify no age/birthdate data is stored
      expect(storedData).not.toHaveProperty('age');
      expect(storedData).not.toHaveProperty('birthdate');
      expect(storedData).not.toHaveProperty('birthYear');
      expect(storedData).not.toHaveProperty('dateOfBirth');

      // Only boolean flags should be stored
      expect(typeof storedData.isChild).toBe('boolean');
      expect(typeof storedData.hasParentalConsent).toBe('boolean');
    });

    it('should require parental consent for children', async () => {
      // This tests the logical requirement that children need consent
      AsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({ isChild: true, hasParentalConsent: false })
      );

      const isChild = await isUnder13();
      const hasConsent = await hasParentalConsent();

      expect(isChild).toBe(true);
      expect(hasConsent).toBe(false);
      // App logic should prevent access without consent
    });
  });

  // ==========================================
  // Edge Cases
  // ==========================================
  describe('Edge Cases', () => {
    it('should handle corrupted storage data', async () => {
      AsyncStorage.getItem.mockResolvedValue('invalid json{');

      const result = await getAgeVerificationStatus();

      // Should return null on parse error
      expect(result).toBe(null);
    });

    it('should handle empty object storage', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({}));

      const isChild = await isUnder13();
      const hasConsent = await hasParentalConsent();

      // Should default to false for missing properties
      expect(isChild).toBe(false);
      expect(hasConsent).toBe(false);
    });
  });
});
