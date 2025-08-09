// server/auth.js - Professional Authentication System
require('dotenv').config();
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const helmet = require('helmet');

// Import custom middleware and utilities
const { verifyToken, verifyRefreshToken, optionalAuth } = require('./middleware/auth');
const { 
  validateRegistration, 
  validateLogin, 
  validatePasswordChange, 
  validateRefreshToken,
  sanitizeInput 
} = require('./middleware/validation');
const { 
  authRateLimiter, 
  registrationRateLimiter, 
  passwordResetRateLimiter,
  trackLoginAttempt,
  setLoginSuccess 
} = require('./middleware/rateLimiting');
const {
  hashPassword,
  verifyPassword,
  createSession,
  refreshAccessToken,
  revokeSession,
  revokeAllUserSessions,
  createPasswordResetToken,
  verifyPasswordResetToken,
  encryptData,
  decryptData
} = require('./utils/auth');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'goodpawiesuser',
  password: process.env.DB_PASSWORD || 'goodpawiespass',
  database: process.env.DB_NAME || 'goodpawiesdb'
};

// Apply security middleware
router.use(helmet());
router.use(sanitizeInput);

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post('/register', 
  registrationRateLimiter,
  validateRegistration,
  async (req, res) => {
    let connection;
    try {
      const { username, email, phonePrefix, phoneNumber, password, fullName, fullSurname } = req.body;
      
      // Hash password
      const passwordHash = await hashPassword(password);
      
      // Connect to database
      connection = await mysql.createConnection(dbConfig);
      
      // Call stored procedure to register user
      const [result] = await connection.execute(
        'CALL sp_register_user(?, ?, ?, ?, ?, ?, ?, @user_id, @result)',
        [username, email, phonePrefix, phoneNumber, passwordHash, fullName, fullSurname]
      );
      
      // Get the output parameters
      const [output] = await connection.execute('SELECT @user_id as user_id, @result as result');
      const { user_id, result: registrationResult } = output[0];
      
      if (registrationResult === 'USER_EXISTS') {
        return res.status(409).json({
          success: false,
          error: 'USER_EXISTS',
          message: 'Username, email, or phone number already exists'
        });
      }
      
      if (registrationResult !== 'SUCCESS') {
        return res.status(400).json({
          success: false,
          error: 'REGISTRATION_FAILED',
          message: 'Failed to register user'
        });
      }
      
      // Create session for the new user
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';
      
      const sessionData = await createSession(user_id, username, ipAddress, userAgent);
      
      // Set secure HTTP-only cookie
      res.cookie('refreshToken', sessionData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          userId: user_id,
          username,
          email,
          accessToken: sessionData.accessToken,
          tokenType: sessionData.tokenType,
          expiresIn: sessionData.expiresIn
        }
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Internal server error during registration'
      });
    } finally {
      if (connection) await connection.end();
    }
  }
);

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
router.post('/login',
  authRateLimiter,
  validateLogin,
  trackLoginAttempt,
  async (req, res) => {
    let connection;
    try {
      const { identifier, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';
      
      // Hash password for comparison
      const tempHash = await hashPassword(password);
      
      connection = await mysql.createConnection(dbConfig);
      
      // First, get user data to verify password properly
      const [users] = await connection.execute(
        `SELECT id, s_username, s_password_hash, s_email, account_locked, lock_until, failed_login_attempts
         FROM users 
         WHERE (s_username = ? OR s_email = ? OR CONCAT(s_phone_prefix, s_phone_number) = ?) AND b_active = 1`,
        [identifier, identifier, identifier]
      );
      
      if (users.length === 0) {
        res.locals.loginSuccess = false;
        return res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid username/email or password'
        });
      }
      
      const user = users[0];
      
      // Check if account is locked
      if (user.account_locked && (user.lock_until === null || new Date(user.lock_until) > new Date())) {
        res.locals.loginSuccess = false;
        return res.status(423).json({
          success: false,
          error: 'ACCOUNT_LOCKED',
          message: 'Account is temporarily locked due to too many failed attempts'
        });
      }
      
      // Verify password
      const passwordValid = await verifyPassword(user.s_password_hash, password);
      
      if (!passwordValid) {
        res.locals.loginSuccess = false;
        
        // Increment failed attempts
        await connection.execute(
          `UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?`,
          [user.id]
        );
        
        // Lock account if too many failed attempts
        if (user.failed_login_attempts + 1 >= 5) {
          await connection.execute(
            `UPDATE users SET account_locked = TRUE, lock_until = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?`,
            [user.id]
          );
        }
        
        return res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid username/email or password'
        });
      }
      
      // Reset failed attempts on successful login
      await connection.execute(
        `UPDATE users SET failed_login_attempts = 0, account_locked = FALSE, lock_until = NULL, last_login = NOW() WHERE id = ?`,
        [user.id]
      );
      
      res.locals.loginSuccess = true;
      
      // Create session
      const sessionData = await createSession(user.id, user.s_username, ipAddress, userAgent);
      
      // Set secure HTTP-only cookie
      res.cookie('refreshToken', sessionData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          userId: user.id,
          username: user.s_username,
          email: user.s_email,
          accessToken: sessionData.accessToken,
          tokenType: sessionData.tokenType,
          expiresIn: sessionData.expiresIn
        }
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.locals.loginSuccess = false;
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Internal server error during login'
      });
    } finally {
      if (connection) await connection.end();
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh',
  verifyRefreshToken,
  async (req, res) => {
    try {
      const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';
      
      const tokenData = await refreshAccessToken(refreshToken, ipAddress, userAgent);
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokenData
      });
      
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: 'TOKEN_REFRESH_FAILED',
        message: 'Failed to refresh token'
      });
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout user and revoke session
 */
router.post('/logout',
  verifyToken,
  async (req, res) => {
    try {
      await revokeSession(req.user.sessionId);
      
      // Clear refresh token cookie
      res.clearCookie('refreshToken');
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'LOGOUT_FAILED',
        message: 'Failed to logout'
      });
    }
  }
);

/**
 * POST /api/auth/logout-all
 * Logout from all devices
 */
router.post('/logout-all',
  verifyToken,
  async (req, res) => {
    try {
      await revokeAllUserSessions(req.user.id);
      
      // Clear refresh token cookie
      res.clearCookie('refreshToken');
      
      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });
      
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        success: false,
        error: 'LOGOUT_ALL_FAILED',
        message: 'Failed to logout from all devices'
      });
    }
  }
);

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password',
  verifyToken,
  validatePasswordChange,
  async (req, res) => {
    let connection;
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      connection = await mysql.createConnection(dbConfig);
      
      // Get current password hash
      const [users] = await connection.execute(
        'SELECT s_password_hash FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }
      
      // Verify current password
      const passwordValid = await verifyPassword(users[0].s_password_hash, currentPassword);
      
      if (!passwordValid) {
        return res.status(401).json({
          success: false,
          error: 'INVALID_CURRENT_PASSWORD',
          message: 'Current password is incorrect'
        });
      }
      
      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);
      
      // Update password
      await connection.execute(
        'UPDATE users SET s_password_hash = ?, password_changed_at = NOW() WHERE id = ?',
        [newPasswordHash, userId]
      );
      
      // Revoke all sessions except current one
      await connection.execute(
        `UPDATE user_sessions SET is_active = FALSE 
         WHERE userid = ? AND session_id != ?`,
        [userId, req.user.sessionId]
      );
      
      await connection.execute(
        `UPDATE refresh_tokens rt
         JOIN user_sessions us ON rt.userid = us.userid
         SET rt.revoked = TRUE 
         WHERE rt.userid = ? AND us.session_id != ?`,
        [userId, req.user.sessionId]
      );
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
      
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'PASSWORD_CHANGE_FAILED',
        message: 'Failed to change password'
      });
    } finally {
      if (connection) await connection.end();
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me',
  verifyToken,
  async (req, res) => {
    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);
      
      const [users] = await connection.execute(
        `SELECT u.id, u.s_username, u.s_email, u.s_full_name, u.s_full_surname,
                CONCAT(u.s_phone_prefix, u.s_phone_number) as phone,
                u.email_verified, u.phone_verified, u.two_factor_enabled,
                u.dt_created_at, u.last_login,
                ui.s_description
         FROM users u
         LEFT JOIN user_info ui ON u.id = ui.userid AND ui.b_active = 1
         WHERE u.id = ? AND u.b_active = 1`,
        [req.user.id]
      );
      
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }
      
      const user = users[0];
      
      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.s_username,
          email: user.s_email,
          fullName: user.s_full_name,
          fullSurname: user.s_full_surname,
          phone: user.phone,
          description: user.s_description,
          emailVerified: user.email_verified,
          phoneVerified: user.phone_verified,
          twoFactorEnabled: user.two_factor_enabled,
          createdAt: user.dt_created_at,
          lastLogin: user.last_login
        }
      });
      
    } catch (error) {
      console.error('Get user info error:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Failed to get user information'
      });
    } finally {
      if (connection) await connection.end();
    }
  }
);

/**
 * GET /api/auth/sessions
 * Get user's active sessions
 */
router.get('/sessions',
  verifyToken,
  async (req, res) => {
    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);
      
      const [sessions] = await connection.execute(
        `SELECT session_id, ip_address, user_agent, created_at, last_activity,
                CASE WHEN session_id = ? THEN true ELSE false END as is_current
         FROM user_sessions 
         WHERE userid = ? AND is_active = TRUE AND expires_at > NOW()
         ORDER BY last_activity DESC`,
        [req.user.sessionId, req.user.id]
      );
      
      res.json({
        success: true,
        data: sessions.map(session => ({
          sessionId: session.session_id,
          ipAddress: session.ip_address,
          userAgent: session.user_agent,
          createdAt: session.created_at,
          lastActivity: session.last_activity,
          isCurrent: session.is_current
        }))
      });
      
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Failed to get sessions'
      });
    } finally {
      if (connection) await connection.end();
    }
  }
);

/**
 * DELETE /api/auth/sessions/:sessionId
 * Revoke a specific session
 */
router.delete('/sessions/:sessionId',
  verifyToken,
  async (req, res) => {
    let connection;
    try {
      const { sessionId } = req.params;
      
      // Verify session belongs to user
      connection = await mysql.createConnection(dbConfig);
      const [sessions] = await connection.execute(
        'SELECT userid FROM user_sessions WHERE session_id = ? AND is_active = TRUE',
        [sessionId]
      );
      
      if (sessions.length === 0 || sessions[0].userid !== req.user.id) {
        return res.status(404).json({
          success: false,
          error: 'SESSION_NOT_FOUND',
          message: 'Session not found'
        });
      }
      
      await revokeSession(sessionId);
      
      res.json({
        success: true,
        message: 'Session revoked successfully'
      });
      
    } catch (error) {
      console.error('Revoke session error:', error);
      res.status(500).json({
        success: false,
        error: 'SESSION_REVOKE_FAILED',
        message: 'Failed to revoke session'
      });
    } finally {
      if (connection) await connection.end();
    }
  }
);

/**
 * POST /api/auth/validate
 * Validate current token (for client-side auth checks)
 */
router.post('/validate',
  verifyToken,
  (req, res) => {
    res.json({
      success: true,
      valid: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        sessionId: req.user.sessionId
      }
    });
  }
);

module.exports = router;