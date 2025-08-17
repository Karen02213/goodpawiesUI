// server/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');
const { errors, send } = require('../utils/response');

/**
 * Middleware to handle validation errors - centralized error formatting
 */
const handleValidationErrors = (req, res, next) => {
  const validationErrors = validationResult(req);
  
  if (!validationErrors.isEmpty()) {
    const details = validationErrors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    return send(res, errors.VALIDATION_ERROR(details));
  }
  
  next();
};

/**
 * Common validation patterns to reduce redundancy
 */
const patterns = {
  name: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'-]+$/,
  username: /^[a-zA-Z0-9_]+$/,
  phonePrefix: /^\+[1-9]\d{0,3}$/,
  phoneNumber: /^\d{7,15}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  petName: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'-]+$/,
  petType: /^[a-zA-Z\s]+$/,
  petBreed: /^[a-zA-Z\s'-]+$/
};

/**
 * Common validation rule factory
 */
const createValidation = (field, rules) => {
  const validation = body(field);
  rules.forEach(rule => {
    if (rule.type === 'length') validation.isLength(rule.options).withMessage(rule.message);
    if (rule.type === 'matches') validation.matches(rule.pattern).withMessage(rule.message);
    if (rule.type === 'email') validation.isEmail().withMessage(rule.message).normalizeEmail();
    if (rule.type === 'notEmpty') validation.notEmpty().withMessage(rule.message);
    if (rule.type === 'trim') validation.trim();
  });
  return validation;
};
/**
 * Validation rules for user registration - using patterns to reduce redundancy
 */
const validateRegistration = [
  createValidation('username', [
    { type: 'length', options: { min: 3, max: 30 }, message: 'Username must be between 3 and 30 characters' },
    { type: 'matches', pattern: patterns.username, message: 'Username can only contain letters, numbers, and underscores' },
    { type: 'trim' }
  ]),
  
  createValidation('email', [
    { type: 'email', message: 'Must be a valid email address' },
    { type: 'length', options: { max: 50 }, message: 'Email must not exceed 50 characters' }
  ]),
  
  createValidation('phonePrefix', [
    { type: 'matches', pattern: patterns.phonePrefix, message: 'Phone prefix must be a valid country code (e.g., +1, +44)' },
    { type: 'length', options: { max: 5 }, message: 'Phone prefix must not exceed 5 characters' }
  ]),
  
  createValidation('phoneNumber', [
    { type: 'matches', pattern: patterns.phoneNumber, message: 'Phone number must contain only digits and be 7-15 characters long' }
  ]),
  
  createValidation('password', [
    { type: 'length', options: { min: 8, max: 128 }, message: 'Password must be between 8 and 128 characters' },
    { type: 'matches', pattern: patterns.password, message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character' }
  ]),
  
  createValidation('fullName', [
    { type: 'length', options: { min: 1, max: 30 }, message: 'Full name must be between 1 and 30 characters' },
    { type: 'matches', pattern: patterns.name, message: 'Full name can only contain letters, spaces, hyphens, and apostrophes' },
    { type: 'trim' }
  ]),
  
  createValidation('fullSurname', [
    { type: 'length', options: { min: 1, max: 30 }, message: 'Full surname must be between 1 and 30 characters' },
    { type: 'matches', pattern: patterns.name, message: 'Full surname can only contain letters, spaces, hyphens, and apostrophes' },
    { type: 'trim' }
  ]),
  
  handleValidationErrors
];

/**
 * Simplified validation rules using common patterns
 */
const validateLogin = [
  body('identifier').notEmpty().withMessage('Username, email, or phone number is required')
    .isLength({ max: 100 }).withMessage('Identifier must not exceed 100 characters').trim(),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ max: 128 }).withMessage('Password must not exceed 128 characters'),
  handleValidationErrors
];

const validatePasswordChange = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  createValidation('newPassword', [
    { type: 'length', options: { min: 8, max: 128 }, message: 'New password must be between 8 and 128 characters' },
    { type: 'matches', pattern: patterns.password, message: 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character' }
  ]),
  handleValidationErrors
];

const validatePetRegistration = [
  createValidation('petname', [
    { type: 'length', options: { min: 1, max: 30 }, message: 'Pet name must be between 1 and 30 characters' },
    { type: 'matches', pattern: patterns.petName, message: 'Pet name can only contain letters, spaces, hyphens, and apostrophes' },
    { type: 'trim' }
  ]),
  createValidation('type', [
    { type: 'length', options: { min: 1, max: 30 }, message: 'Pet type must be between 1 and 30 characters' },
    { type: 'matches', pattern: patterns.petType, message: 'Pet type can only contain letters and spaces' },
    { type: 'trim' }
  ]),
  createValidation('breed', [
    { type: 'length', options: { min: 1, max: 30 }, message: 'Pet breed must be between 1 and 30 characters' },
    { type: 'matches', pattern: patterns.petBreed, message: 'Pet breed can only contain letters, spaces, hyphens, and apostrophes' },
    { type: 'trim' }
  ]),
  body('description').isLength({ min: 1, max: 200 }).withMessage('Pet description must be between 1 and 200 characters').trim(),
  handleValidationErrors
];

// Parameter and query validation - simplified using common patterns
const validateUserId = [param('userid').isInt({ min: 1 }).withMessage('User ID must be a positive integer'), handleValidationErrors];
const validatePetId = [param('petid').isInt({ min: 1 }).withMessage('Pet ID must be a positive integer'), handleValidationErrors];
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];
const validateRefreshToken = [body('refreshToken').notEmpty().withMessage('Refresh token is required').isJWT().withMessage('Invalid refresh token format'), handleValidationErrors];
const validateQRGeneration = [
  body('url').isURL().withMessage('Must be a valid URL'),
  body('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  body('name').isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters').trim(),
  handleValidationErrors
];

/**
 * Sanitize input to prevent XSS - improved error handling
 */
const sanitizeInput = (req, res, next) => {
  const xssChars = /<script|javascript:|on\w+\s*=/gi;
  
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        if (xssChars.test(obj[key])) {
          return send(res, errors.VALIDATION_ERROR([{
            field: key,
            message: 'Potentially dangerous input detected',
            value: 'XSS_DETECTED'
          }]));
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        const result = sanitizeObject(obj[key]);
        if (result) return result;
      }
    }
  };
  
  const result = sanitizeObject({ ...req.body, ...req.query, ...req.params });
  if (result) return result;
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validatePetRegistration,
  validateUserId,
  validatePetId,
  validatePagination,
  validateRefreshToken,
  validateQRGeneration,
  sanitizeInput,
  handleValidationErrors
};
