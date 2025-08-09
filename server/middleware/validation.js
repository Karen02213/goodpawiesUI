// server/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

/**
 * Validation rules for user registration
 */
const validateRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .trim(),
    
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .isLength({ max: 50 })
    .withMessage('Email must not exceed 50 characters'),
    
  body('phonePrefix')
    .matches(/^\+[1-9]\d{0,3}$/)
    .withMessage('Phone prefix must be a valid country code (e.g., +1, +44)')
    .isLength({ max: 5 })
    .withMessage('Phone prefix must not exceed 5 characters'),
    
  body('phoneNumber')
    .matches(/^\d{7,15}$/)
    .withMessage('Phone number must contain only digits and be 7-15 characters long'),
    
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
    
  body('fullName')
    .isLength({ min: 1, max: 30 })
    .withMessage('Full name must be between 1 and 30 characters')
    .matches(/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'-]+$/)
    .withMessage('Full name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
    
  body('fullSurname')
    .isLength({ min: 1, max: 30 })
    .withMessage('Full surname must be between 1 and 30 characters')
    .matches(/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'-]+$/)
    .withMessage('Full surname can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
    
  handleValidationErrors
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('identifier')
    .notEmpty()
    .withMessage('Username, email, or phone number is required')
    .isLength({ max: 100 })
    .withMessage('Identifier must not exceed 100 characters')
    .trim(),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password must not exceed 128 characters'),
    
  handleValidationErrors
];

/**
 * Validation rules for password change
 */
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
    
  handleValidationErrors
];

/**
 * Validation rules for pet registration
 */
const validatePetRegistration = [
  body('petname')
    .isLength({ min: 1, max: 30 })
    .withMessage('Pet name must be between 1 and 30 characters')
    .matches(/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'-]+$/)
    .withMessage('Pet name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
    
  body('type')
    .isLength({ min: 1, max: 30 })
    .withMessage('Pet type must be between 1 and 30 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Pet type can only contain letters and spaces')
    .trim(),
    
  body('breed')
    .isLength({ min: 1, max: 30 })
    .withMessage('Pet breed must be between 1 and 30 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Pet breed can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
    
  body('description')
    .isLength({ min: 1, max: 200 })
    .withMessage('Pet description must be between 1 and 200 characters')
    .trim(),
    
  handleValidationErrors
];

/**
 * Validation rules for user ID parameter
 */
const validateUserId = [
  param('userid')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
    
  handleValidationErrors
];

/**
 * Validation rules for pet ID parameter
 */
const validatePetId = [
  param('petid')
    .isInt({ min: 1 })
    .withMessage('Pet ID must be a positive integer'),
    
  handleValidationErrors
];

/**
 * Validation rules for pagination
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  handleValidationErrors
];

/**
 * Validation rules for refresh token
 */
const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isJWT()
    .withMessage('Invalid refresh token format'),
    
  handleValidationErrors
];

/**
 * Validation rules for QR code generation
 */
const validateQRGeneration = [
  body('url')
    .isURL()
    .withMessage('Must be a valid URL'),
    
  body('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
    
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .trim(),
    
  handleValidationErrors
];

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (req, res, next) => {
  const xssChars = /<script|javascript:|on\w+\s*=/gi;
  
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        if (xssChars.test(obj[key])) {
          return res.status(400).json({
            success: false,
            error: 'INVALID_INPUT',
            message: 'Potentially dangerous input detected'
          });
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };
  
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  
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
