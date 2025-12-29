/**
 * Input validation utilities for the PlayBeacon mobile app
 * Provides sanitization and validation functions to prevent security vulnerabilities
 */

/**
 * Sanitize collection name input
 * Prevents XSS and injection attacks
 */
export const sanitizeCollectionName = (name) => {
  if (!name || typeof name !== 'string') {
    return '';
  }

  // Remove leading/trailing whitespace
  let sanitized = name.trim();

  // Limit length to 100 characters
  sanitized = sanitized.slice(0, 100);

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>{}]/g, '');

  return sanitized;
};

/**
 * Validate collection name
 * Returns { valid: boolean, error: string }
 */
export const validateCollectionName = (name) => {
  const sanitized = sanitizeCollectionName(name);

  if (!sanitized) {
    return { valid: false, error: 'Collection name is required' };
  }

  if (sanitized.length < 1) {
    return { valid: false, error: 'Collection name must be at least 1 character' };
  }

  if (sanitized.length > 100) {
    return { valid: false, error: 'Collection name must be less than 100 characters' };
  }

  // Check for only whitespace
  if (/^\s*$/.test(sanitized)) {
    return { valid: false, error: 'Collection name cannot be only whitespace' };
  }

  return { valid: true, error: null };
};

/**
 * Sanitize collection description input
 */
export const sanitizeCollectionDescription = (description) => {
  if (!description || typeof description !== 'string') {
    return '';
  }

  // Remove leading/trailing whitespace
  let sanitized = description.trim();

  // Limit length to 500 characters
  sanitized = sanitized.slice(0, 500);

  // Remove potentially dangerous characters but allow more than name
  sanitized = sanitized.replace(/[<>{}]/g, '');

  return sanitized;
};

/**
 * Validate collection description
 */
export const validateCollectionDescription = (description) => {
  if (!description) {
    return { valid: true, error: null }; // Description is optional
  }

  const sanitized = sanitizeCollectionDescription(description);

  if (sanitized.length > 500) {
    return { valid: false, error: 'Description must be less than 500 characters' };
  }

  return { valid: true, error: null };
};

// TEMPORARILY DISABLED: Roblox import feature pending Roblox approval
// /**
//  * Sanitize Roblox username input
//  */
// export const sanitizeRobloxUsername = (username) => {
//   if (!username || typeof username !== 'string') {
//     return '';
//   }

//   // Remove leading/trailing whitespace
//   let sanitized = username.trim();

//   // Limit length to 20 characters (Roblox max)
//   sanitized = sanitized.slice(0, 20);

//   // Only allow alphanumeric and underscore (Roblox username rules)
//   sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '');

//   return sanitized;
// };

// /**
//  * Validate Roblox username
//  */
// export const validateRobloxUsername = (username) => {
//   const sanitized = sanitizeRobloxUsername(username);

//   if (!sanitized) {
//     return { valid: false, error: 'Username is required' };
//   }

//   if (sanitized.length < 3) {
//     return { valid: false, error: 'Username must be at least 3 characters' };
//   }

//   if (sanitized.length > 20) {
//     return { valid: false, error: 'Username must be less than 20 characters' };
//   }

//   // Check if username starts with a number (not allowed by Roblox)
//   if (/^\d/.test(sanitized)) {
//     return { valid: false, error: 'Username cannot start with a number' };
//   }

//   // Check for invalid characters
//   if (!/^[a-zA-Z0-9_]+$/.test(sanitized)) {
//     return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
//   }

//   return { valid: true, error: null };
// };

/**
 * Sanitize numeric input (for universe IDs, etc.)
 */
export const sanitizeNumericId = (id) => {
  if (typeof id === 'number') {
    return Math.floor(Math.abs(id));
  }

  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    if (isNaN(parsed)) {
      return null;
    }
    return Math.floor(Math.abs(parsed));
  }

  return null;
};

/**
 * Validate numeric ID (universe ID, user ID, etc.)
 */
export const validateNumericId = (id, fieldName = 'ID') => {
  const sanitized = sanitizeNumericId(id);

  if (sanitized === null || sanitized === undefined) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }

  if (sanitized <= 0) {
    return { valid: false, error: `${fieldName} must be greater than 0` };
  }

  return { valid: true, error: null };
};

/**
 * Sanitize feedback value (must be -1, 0, or 1)
 */
export const sanitizeFeedback = (feedback) => {
  const num = parseInt(feedback, 10);

  if (num === -1 || num === 0 || num === 1) {
    return num;
  }

  return null;
};

/**
 * Validate feedback value
 */
export const validateFeedback = (feedback) => {
  const sanitized = sanitizeFeedback(feedback);

  if (sanitized === null) {
    return { valid: false, error: 'Feedback must be -1, 0, or 1' };
  }

  return { valid: true, error: null };
};

/**
 * Sanitize limit parameter for API calls
 */
export const sanitizeLimit = (limit, maxLimit = 100) => {
  const num = parseInt(limit, 10);

  if (isNaN(num) || num <= 0) {
    return 10; // Default
  }

  return Math.min(num, maxLimit);
};

/**
 * Sanitize offset parameter for pagination
 */
export const sanitizeOffset = (offset) => {
  const num = parseInt(offset, 10);

  if (isNaN(num) || num < 0) {
    return 0; // Default
  }

  return num;
};
