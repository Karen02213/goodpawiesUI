// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authQueries = require('../db/authQueries');
const logger = require('../utils/logger');

const { errors, send } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

/**
 * Common audit logging for auth operations
 */
const auditLog = (action, status, details, req, startTime) => {
  logger.audit(action, status, {
    ...details,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.path,
    responseTime: Date.now() - startTime
  });
};
/**
 * Middleware to verify JWT access token - simplified with common patterns
 */
const verifyToken = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      auditLog('access_denied', 'missing_token', {}, req, startTime);
      return send(res, errors.UNAUTHORIZED());
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const sessionValid = await authQueries.isSessionValid(decoded.sessionId);

    if (!sessionValid) {
      auditLog('session_expired', 'invalid_session', { 
        userId: decoded.userId, 
        sessionId: decoded.sessionId 
      }, req, startTime);
      return send(res, { ...errors.UNAUTHORIZED(), message: 'Session has expired' });
    }

    req.user = {
      id: decoded.userId,
      username: decoded.username,
      sessionId: decoded.sessionId,
      permissions: decoded.permissions || []
    };

    auditLog('token_verified', 'success', {
      userId: decoded.userId,
      username: decoded.username,
      sessionId: decoded.sessionId
    }, req, startTime);

    next();
  } catch (error) {
    const errorType = error.name === 'TokenExpiredError' ? 'token_expired' :
                     error.name === 'JsonWebTokenError' ? 'invalid_token' : 'verification_error';
    
    auditLog('token_verification_failed', errorType, { error: error.message }, req, startTime);

    if (error.name === 'TokenExpiredError') {
      return send(res, { ...errors.UNAUTHORIZED(), message: 'Access token has expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return send(res, { ...errors.UNAUTHORIZED(), message: 'Invalid access token' });
    }

    console.error('Token verification error:', error);
    return send(res, errors.INTERNAL_ERROR());
  }
};

/**
 * Middleware to verify refresh token - simplified
 */
const verifyRefreshToken = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      auditLog('refresh_token_missing', 'validation_failed', {}, req, startTime);
      return send(res, { ...errors.UNAUTHORIZED(), message: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const tokenRecord = await authQueries.getRefreshToken(tokenHash);

    if (!tokenRecord || tokenRecord.expires_at < new Date()) {
      auditLog('refresh_token_invalid', 'token_expired_or_revoked', { userId: decoded.userId }, req, startTime);
      return send(res, { ...errors.UNAUTHORIZED(), message: 'Invalid or expired refresh token' });
    }

    req.refreshTokenData = {
      userId: decoded.userId,
      username: decoded.username,
      tokenHash: tokenHash
    };

    auditLog('refresh_token_verified', 'success', {
      userId: decoded.userId,
      username: decoded.username
    }, req, startTime);

    next();
  } catch (error) {
    auditLog('refresh_token_verification_failed', 'jwt_error', { error: error.message }, req, startTime);

    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return send(res, { ...errors.UNAUTHORIZED(), message: 'Invalid or expired refresh token' });
    }

    console.error('Refresh token verification error:', error);
    return send(res, errors.INTERNAL_ERROR());
  }
};

/**
 * Simplified permission and ownership middleware
 */
const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) return send(res, errors.UNAUTHORIZED());
  if (!req.user.permissions.includes(permission) && !req.user.permissions.includes('admin')) {
    return send(res, errors.FORBIDDEN('Insufficient permissions'));
  }
  next();
};

const requireOwnership = (userIdField = 'userid') => (req, res, next) => {
  const resourceUserId = req.params[userIdField] || req.body[userIdField] || req.query[userIdField];
  
  if (!resourceUserId) {
    return send(res, { ...errors.VALIDATION_ERROR(), message: 'User ID is required' });
  }

  if (parseInt(resourceUserId) !== req.user.id && !req.user.permissions.includes('admin')) {
    return send(res, errors.FORBIDDEN('You can only access your own resources'));
  }

  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const sessionValid = await authQueries.isSessionValid(decoded.sessionId);

    req.user = sessionValid ? {
      id: decoded.userId,
      username: decoded.username,
      sessionId: decoded.sessionId,
      permissions: decoded.permissions || []
    } : null;

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  verifyToken,
  verifyRefreshToken,
  requirePermission,
  requireOwnership,
  optionalAuth
};
