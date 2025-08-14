// server/utils/auth.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'goodpawiesuser',
  password: process.env.DB_PASSWORD || 'goodpawiespass',
  database: process.env.DB_NAME || 'goodpawiesdb'
};

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
    const connection = await mysql.createConnection(dbConfig);
    
    // Calculate expiration times
    const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Insert session into database
    await connection.execute(
      `INSERT INTO user_sessions (userid, session_id, expires_at, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, sessionId, sessionExpiry, ipAddress, userAgent]
    );
    
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
    
    // Store refresh token hash in database
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await connection.execute(
      `INSERT INTO refresh_tokens (userid, token_hash, expires_at, user_agent, ip_address) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, refreshTokenHash, refreshTokenExpiry, userAgent, ipAddress]
    );
    
    await connection.end();
    
    return {
      accessToken,
      refreshToken,
      sessionId,
      expiresIn: 90 * 60, // 15 minutes in seconds
      tokenType: 'Bearer'
    };
  } catch (error) {
    console.error('Session creation error:', error);
    throw new Error('Failed to create session');
  }
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken, ipAddress, userAgent) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if refresh token exists and is valid
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const [tokens] = await connection.execute(
      `SELECT rt.userid, rt.expires_at, u.s_username, us.session_id 
       FROM refresh_tokens rt
       JOIN users u ON rt.userid = u.id
       JOIN user_sessions us ON rt.userid = us.userid AND us.session_id = ?
       WHERE rt.token_hash = ? AND rt.revoked = FALSE AND rt.expires_at > NOW() AND us.is_active = TRUE`,
      [decoded.sessionId, refreshTokenHash]
    );
    
    if (tokens.length === 0) {
      await connection.end();
      throw new Error('Invalid refresh token');
    }
    
    const { userid, s_username, session_id } = tokens[0];
    
    // Update refresh token usage
    await connection.execute(
      `UPDATE refresh_tokens SET last_used = NOW() WHERE token_hash = ?`,
      [refreshTokenHash]
    );
    
    await connection.end();
    
    // Generate new access token
    const accessTokenPayload = {
      userId: userid,
      username: s_username,
      sessionId: session_id,
      permissions: [], // You might want to fetch actual permissions from database
      type: 'access'
    };
    
    const newAccessToken = generateAccessToken(accessTokenPayload);
    
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
    const connection = await mysql.createConnection(dbConfig);
    
    // Deactivate session
    await connection.execute(
      `UPDATE user_sessions SET is_active = FALSE WHERE session_id = ?`,
      [sessionId]
    );
    
    // Revoke all refresh tokens for this session
    await connection.execute(
      `UPDATE refresh_tokens rt
       JOIN user_sessions us ON rt.userid = us.userid
       SET rt.revoked = TRUE 
       WHERE us.session_id = ?`,
      [sessionId]
    );
    
    await connection.end();
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
    const connection = await mysql.createConnection(dbConfig);
    
    // Deactivate all sessions
    await connection.execute(
      `UPDATE user_sessions SET is_active = FALSE WHERE userid = ?`,
      [userId]
    );
    
    // Revoke all refresh tokens
    await connection.execute(
      `UPDATE refresh_tokens SET revoked = TRUE WHERE userid = ?`,
      [userId]
    );
    
    await connection.end();
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
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Invalidate any existing reset tokens for this user
    await connection.execute(
      `UPDATE password_reset_tokens SET used = TRUE WHERE userid = ? AND used = FALSE`,
      [userId]
    );
    
    // Insert new reset token
    await connection.execute(
      `INSERT INTO password_reset_tokens (userid, token_hash, expires_at) VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt]
    );
    
    await connection.end();
    
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
    
    const connection = await mysql.createConnection(dbConfig);
    
    const [tokens] = await connection.execute(
      `SELECT userid FROM password_reset_tokens 
       WHERE token_hash = ? AND used = FALSE AND expires_at > NOW()`,
      [tokenHash]
    );
    
    if (tokens.length === 0) {
      await connection.end();
      return null;
    }
    
    // Mark token as used
    await connection.execute(
      `UPDATE password_reset_tokens SET used = TRUE WHERE token_hash = ?`,
      [tokenHash]
    );
    
    await connection.end();
    
    return tokens[0].userid;
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
    const connection = await mysql.createConnection(dbConfig);
    
    // Remove expired refresh tokens
    await connection.execute(`DELETE FROM refresh_tokens WHERE expires_at < NOW()`);
    
    // Remove expired sessions
    await connection.execute(`DELETE FROM user_sessions WHERE expires_at < NOW()`);
    
    // Remove expired password reset tokens
    await connection.execute(`DELETE FROM password_reset_tokens WHERE expires_at < NOW()`);
    
    // Remove old login attempts (older than 24 hours)
    await connection.execute(`DELETE FROM login_attempts WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 24 HOUR)`);
    
    await connection.end();
    
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
