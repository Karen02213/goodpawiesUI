// server/utils/response.js
// Standardized response utilities to reduce redundancy

/**
 * Standard success response formatter
 */
const success = (data = null, message = 'Success', statusCode = 200) => ({
  success: true,
  message,
  ...(data && { data }),
  statusCode
});

/**
 * Standard error response formatter
 */
const error = (errorCode, message, statusCode = 400, details = null) => ({
  success: false,
  error: errorCode,
  message,
  statusCode,
  ...(details && { details })
});

/**
 * Paginated response formatter
 */
const paginated = (items, pagination, message = 'Success') => ({
  success: true,
  message,
  data: {
    items,
    pagination
  }
});

/**
 * Common error responses
 */
const errors = {
  NOT_FOUND: (resource = 'Resource') => error('NOT_FOUND', `${resource} not found`, 404),
  UNAUTHORIZED: () => error('UNAUTHORIZED', 'Authentication required', 401),
  FORBIDDEN: (message = 'Access denied') => error('FORBIDDEN', message, 403),
  VALIDATION_ERROR: (details) => error('VALIDATION_ERROR', 'Invalid input data', 400, details),
  INTERNAL_ERROR: () => error('INTERNAL_ERROR', 'Internal server error', 500),
  RATE_LIMIT: (retryAfter) => ({ 
    ...error('RATE_LIMIT_EXCEEDED', 'Too many requests', 429), 
    retryAfter 
  }),
  CONFLICT: (message) => error('CONFLICT', message, 409)
};

/**
 * Send standardized response
 */
const send = (res, response) => {
  const { statusCode = 200, ...body } = response;
  return res.status(statusCode).json(body);
};

module.exports = {
  success,
  error,
  paginated,
  errors,
  send
};
