// client/src/utils/validation.js
// Centralized validation functions for client-side forms

// Username validation (same as server)
export function validateUsername(username) {
  if (!username || username.length < 3 || username.length > 30) return 'Username must be between 3 and 30 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
  return null;
}

// Password validation (same as server)
export function validatePassword(password) {
  if (!password || password.length < 8 || password.length > 128) return 'Password must be between 8 and 128 characters';
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) return 'Password must contain at least one lowercase letter (a-z), one uppercase letter (A-Z), one number (0-9), and one special character (@$!%*?&)';
  return null;
}

// Email validation
export function validateEmail(email) {
  if (!email) return 'Email is required';
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Must be a valid email address';
  if (email.length > 50) return 'Email must not exceed 50 characters';
  return null;
}

// Phone prefix validation
export function validatePhonePrefix(prefix) {
  if (!/^\+[1-9]\d{0,3}$/.test(prefix)) return 'Phone prefix must be a valid country code (e.g., +1, +44)';
  if (prefix.length > 5) return 'Phone prefix must not exceed 5 characters';
  return null;
}

// Phone number validation
export function validatePhoneNumber(number) {
  if (!/^\d{7,10}$/.test(number)) return 'Phone number must contain only digits and be 7-10 characters long';
  return null;
}

// Full name validation
export function validateFullName(name) {
  if (!name || name.length < 1 || name.length > 30) return 'Full name must be between 1 and 30 characters';
  if (!/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'-]+$/.test(name)) return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
  return null;
}

// Full surname validation
export function validateFullSurname(name) {
  if (!name || name.length < 1 || name.length > 30) return 'Full surname must be between 1 and 30 characters';
  if (!/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'-]+$/.test(name)) return 'Full surname can only contain letters, spaces, hyphens, and apostrophes';
  return null;
}



// Utility to run all validations for registration
export function validateRegistrationForm({ username, password, email, phonePrefix, phoneNumber, fullName, fullSurname }) {
  return [
    validateUsername(username),
    validatePassword(password),
    validateEmail(email),
    validatePhonePrefix(phonePrefix),
    validatePhoneNumber(phoneNumber),
    validateFullName(fullName),
    validateFullSurname(fullSurname)
  ].filter(Boolean);
}
