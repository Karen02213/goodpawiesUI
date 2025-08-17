// server/utils/auth.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const authQueries = require('../db/authQueries');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Encryption Configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.scryptSync('goodpawies-encryption-key', 'salt', 32);

/**
 * Hash password using Argon2
 */
const hashPassword = async (password) => {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Verify password using Argon2
 */
const verifyPassword = async (hashedPassword, plainPassword) => {
  try {
    return await argon2.verify(hashedPassword, plainPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
};

/**
 * Generate secure session ID
 */
const generateSessionId = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate access token (JWT)
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'goodpawies-api',
    audience: 'goodpawies-client'
  });
};

/**
 * Generate refresh token (JWT)
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'goodpawies-api',
    audience: 'goodpawies-client'
  });
};

/**
 * Create a new session
 */
const createSession = async (userId, username, ipAddress, userAgent, permissions = []) => {
  try {
    const sessionId = generateSessionId();
    
    // Calculate expiration times
    const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Insert session using modular query
    await authQueries.createUserSession(userId, sessionId, sessionExpiry, ipAddress, userAgent);
    
    // Generate tokens
    const accessTokenPayload = {
      userId,
      username,
      sessionId,
      permissions,
      type: 'access'
    };
    
    const refreshTokenPayload = {
      userId,
      username,
      sessionId,
      type: 'refresh'
    };
    
    const accessToken = generateAccessToken(accessTokenPayload);
    const refreshToken = generateRefreshToken(refreshTokenPayload);
    
    // Store refresh token hash using modular query
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await authQueries.storeRefreshToken(userId, refreshTokenHash, refreshTokenExpiry, userAgent, ipAddress);
    
    return {
      accessToken,
      refreshToken,
      sessionId,
      expiresIn: 15 * 60, // 15 minutes in seconds
      tokenType: 'Bearer'
    };
  } catch (error) {
    console.error('Session creation error:', error);
    throw new Error('Failed to create session');
  }
};

/**
 * Verify refresh token and issue new access token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    // Generate token hash
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    // Verify token exists and is valid using modular query
    const tokenRecord = await authQueries.getRefreshToken(tokenHash);
    
    if (!tokenRecord || tokenRecord.expires_at < new Date()) {
      throw new Error('Token expired or invalid');
    }
    
    // Get user data using modular query
    const user = await authQueries.getUserById(decoded.userId);
    
    if (!user || !user.is_active) {
      throw new Error('User not found or inactive');
    }
    
    // Check if session is valid using modular query
    const sessionValid = await authQueries.isSessionValid(decoded.sessionId);
    if (!sessionValid) {
      // Clean up invalid refresh token
      await authQueries.deleteRefreshToken(tokenHash);
      throw new Error('Session invalid');
    }
    
    // Generate new access token
    const newAccessTokenPayload = {
      userId: decoded.userId,
      username: decoded.username,
      sessionId: decoded.sessionId,
      permissions: user.permissions || [],
      type: 'access'
    };
    
    const newAccessToken = generateAccessToken(newAccessTokenPayload);
    
    return {
      accessToken: newAccessToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
      tokenType: 'Bearer'
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    throw new Error('Failed to refresh token');
  }
};

/**
 * Revoke session and all associated tokens
 */
const revokeSession = async (sessionId) => {
  try {
    // Deactivate session using modular query
    await authQueries.deactivateSessionById(sessionId);
    
    // Revoke all refresh tokens for this session using modular query
    await authQueries.revokeRefreshTokensBySession(sessionId);
    
    return true;
  } catch (error) {
    console.error('Session revocation error:', error);
    throw new Error('Failed to revoke session');
  }
};

/**
 * Revoke all sessions for a user
 */
const revokeAllUserSessions = async (userId) => {
  try {
    // Deactivate all sessions for user using modular query
    await authQueries.deactivateAllUserSessions(userId);
    
    // Revoke all refresh tokens for user using modular query
    await authQueries.revokeAllUserRefreshTokens(userId);
    
    return true;
  } catch (error) {
    console.error('All sessions revocation error:', error);
    throw new Error('Failed to revoke all sessions');
  }
};

/**
 * Encrypt sensitive data
 */
const encryptData = (text) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt sensitive data
 */
const decryptData = (encryptedData) => {
  try {
    const { encrypted, iv, authTag } = encryptedData;
    
    const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Generate secure random token
 */
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Create password reset token
 */
const createPasswordResetToken = async (userId) => {
  try {
    const token = generateSecureToken(32);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Invalidate any existing reset tokens for this user and create new token using modular query
    await authQueries.createPasswordResetToken(userId, tokenHash, expiresAt);
    
    return token;
  } catch (error) {
    console.error('Password reset token creation error:', error);
    throw new Error('Failed to create password reset token');
  }
};

/**
 * Verify password reset token
 */
const verifyPasswordResetToken = async (token) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Verify and mark token as used using modular query
    const userId = await authQueries.verifyPasswordResetToken(tokenHash);
    
    return userId;
  } catch (error) {
    console.error('Password reset token verification error:', error);
    return null;
  }
};

/**
 * Clean expired tokens and sessions
 */
const cleanupExpiredTokens = async () => {
  try {
    // Remove expired refresh tokens using modular query
    await authQueries.cleanExpiredRefreshTokens();
    
    // Remove expired sessions using modular query
    await authQueries.cleanExpiredSessions();
    
    // Remove expired password reset tokens using modular query
    await authQueries.cleanExpiredPasswordResetTokens();
    
    // Remove old login attempts using modular query
    await authQueries.cleanOldLoginAttempts();
    
    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateSessionId,
  generateAccessToken,
  generateRefreshToken,
  createSession,
  refreshAccessToken,
  revokeSession,
  revokeAllUserSessions,
  encryptData,
  decryptData,
  generateSecureToken,
  createPasswordResetToken,
  verifyPasswordResetToken,
  cleanupExpiredTokens
};
