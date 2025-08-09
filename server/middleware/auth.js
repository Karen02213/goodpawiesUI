// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const crypto = require('crypto');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'goodpawiesuser',
  password: process.env.DB_PASSWORD || 'goodpawiespass',
  database: process.env.DB_NAME || 'goodpawiesdb'
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

/**
 * Middleware to verify JWT access token
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'ACCESS_DENIED', 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session is still active
    const connection = await mysql.createConnection(dbConfig);
    const [sessions] = await connection.execute(
      `SELECT userid, is_active FROM user_sessions 
       WHERE session_id = ? AND expires_at > NOW() AND is_active = TRUE`,
      [decoded.sessionId]
    );
    await connection.end();

    if (sessions.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'SESSION_EXPIRED', 
        message: 'Session has expired' 
      });
    }

    req.user = {
      id: decoded.userId,
      username: decoded.username,
      sessionId: decoded.sessionId,
      permissions: decoded.permissions || []
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'TOKEN_EXPIRED', 
        message: 'Access token has expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'INVALID_TOKEN', 
        message: 'Invalid access token' 
      });
    }

    console.error('Token verification error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'INTERNAL_ERROR', 
      message: 'Internal server error' 
    });
  }
};

/**
 * Middleware to verify refresh token
 */
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'REFRESH_TOKEN_REQUIRED', 
        message: 'Refresh token is required' 
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    // Check if refresh token exists in database and is not revoked
    const connection = await mysql.createConnection(dbConfig);
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    const [tokens] = await connection.execute(
      `SELECT userid, expires_at FROM refresh_tokens 
       WHERE token_hash = ? AND revoked = FALSE AND expires_at > NOW()`,
      [tokenHash]
    );
    await connection.end();

    if (tokens.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'INVALID_REFRESH_TOKEN', 
        message: 'Invalid or expired refresh token' 
      });
    }

    req.refreshTokenData = {
      userId: decoded.userId,
      username: decoded.username,
      tokenHash: tokenHash
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'INVALID_REFRESH_TOKEN', 
        message: 'Invalid or expired refresh token' 
      });
    }

    console.error('Refresh token verification error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'INTERNAL_ERROR', 
      message: 'Internal server error' 
    });
  }
};

/**
 * Middleware to check user permissions
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'UNAUTHORIZED', 
        message: 'User not authenticated' 
      });
    }

    if (!req.user.permissions.includes(permission) && !req.user.permissions.includes('admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'FORBIDDEN', 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

/**
 * Middleware to validate user owns resource
 */
const requireOwnership = (userIdField = 'userid') => {
  return (req, res, next) => {
    const resourceUserId = req.params[userIdField] || req.body[userIdField] || req.query[userIdField];
    
    if (!resourceUserId) {
      return res.status(400).json({ 
        success: false, 
        error: 'MISSING_USER_ID', 
        message: 'User ID is required' 
      });
    }

    if (parseInt(resourceUserId) !== req.user.id && !req.user.permissions.includes('admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'FORBIDDEN', 
        message: 'Access denied: You can only access your own resources' 
      });
    }

    next();
  };
};

/**
 * Middleware for optional authentication (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session is still active
    const connection = await mysql.createConnection(dbConfig);
    const [sessions] = await connection.execute(
      `SELECT userid, is_active FROM user_sessions 
       WHERE session_id = ? AND expires_at > NOW() AND is_active = TRUE`,
      [decoded.sessionId]
    );
    await connection.end();

    if (sessions.length > 0) {
      req.user = {
        id: decoded.userId,
        username: decoded.username,
        sessionId: decoded.sessionId,
        permissions: decoded.permissions || []
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // For optional auth, we don't return errors, just set user to null
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
