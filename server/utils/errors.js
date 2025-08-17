// server/utils/errors.js
// Centralized error handling utilities

const logger = require('./logger');
const { errors, send } = require('./response');

/**
 * Async wrapper to catch errors in route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Standard audit logging for routes
 */
const auditAction = (action, details = {}) => {
  return (req, res, next) => {
    const startTime = Date.now();
    res.locals.auditAction = action;
    res.locals.auditDetails = details;
    res.locals.startTime = startTime;
    
    const originalSend = res.send;
    res.send = function(body) {
      const responseTime = Date.now() - startTime;
      const success = res.statusCode >= 200 && res.statusCode < 400;
      
      logger.audit(action, success ? 'SUCCESS' : 'FAILED', {
        ...details,
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        responseTime,
        statusCode: res.statusCode
      });
      
      return originalSend.call(this, body);
    };
    
    next();
  };
};

/**
 * Ownership validation middleware factory
 */
const validateOwnership = (getOwnerIdFn, resourceType = 'resource') => {
  return asyncHandler(async (req, res, next) => {
    const ownerId = await getOwnerIdFn(req);
    
    if (!ownerId) {
      return send(res, errors.NOT_FOUND(resourceType));
    }
    
    if (ownerId !== req.user.id && !req.user.permissions?.includes('admin')) {
      return send(res, errors.FORBIDDEN(`You can only access your own ${resourceType}`));
    }
    
    next();
  });
};

/**
 * Global error handler middleware
 */
const globalErrorHandler = (error, req, res, next) => {
  logger.error('Unhandled error', { 
    error: error.message, 
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id
  });
  
  // Handle specific error types
  if (error.type === 'entity.parse.failed') {
    return send(res, errors.VALIDATION_ERROR([{
      field: 'body',
      message: 'Invalid JSON format',
      value: 'Invalid JSON'
    }]));
  }
  
  if (error.name === 'ValidationError') {
    return send(res, errors.VALIDATION_ERROR(error.details));
  }
  
  // Default to internal server error
  return send(res, errors.INTERNAL_ERROR());
};

module.exports = {
  asyncHandler,
  auditAction,
  validateOwnership,
  globalErrorHandler
};
