// server/auth.js - Professional Authentication System
require('dotenv').config();
const express = require('express');
const router = express.Router();
const helmet = require('helmet');
const delay = require('../middleware/delay');
// Import custom middleware and utilities
const { verifyToken, verifyRefreshToken, optionalAuth } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange,
  validateRefreshToken
} = require('../middleware/validation');
const {
  authRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
  trackLoginAttempt,
  setLoginSuccess
} = require('../middleware/rateLimiting');
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
} = require('../utils/auth');

// Import modular database queries
const authQueries = require('../db/authQueries');
const userQueries = require('../db/userQueries');
const logger = require('../utils/logger');

// Apply security middleware
router.use(helmet());

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post('/register',
  registrationRateLimiter,
  validateUserRegistration, delay,
  async (req, res) => {
    const startTime = Date.now();
    try {
      const { username, email, phonePrefix, phoneNumber, password, fullName, fullSurname } = req.body;

      logger.info('User registration attempt', {
        username,
        email,
        phonePrefix: phonePrefix,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Hash password
      const passwordHash = await hashPassword(password);

      // Register user using modular query (atomic transaction)
      const result = await authQueries.registerUser({
        username,
        email,
        phonePrefix,
        phoneNumber,
        passwordHash,
        fullName,
        fullSurname
      });

      if (result.result === 'USER_EXISTS') {
        logger.audit('REGISTRATION_FAILED', 'USER_EXISTS', {
          username,
          email,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          responseTime: Date.now() - startTime
        });

        return res.status(409).json({
          success: false,
          error: 'USER_EXISTS',
          message: 'Username, email, or phone number already exists'
        });
      }

      if (result.result !== 'SUCCESS') {
        logger.error('Registration failed with unknown result', {
          result,
          username,
          email,
          ip: req.ip
        });

        return res.status(400).json({
          success: false,
          error: 'REGISTRATION_FAILED',
          message: 'Registration failed due to invalid data'
        });
      }

      logger.audit('REGISTRATION_SUCCESS', 'USER_CREATED', {
        userId: result.userId,
        username,
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        responseTime: Date.now() - startTime
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          userId: result.userId,
          username: username
        }
      });

    } catch (error) {
      logger.error('Registration endpoint error', {
        error: error.message,
        stack: error.stack,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        responseTime: Date.now() - startTime
      });

      res.status(500).json({
        success: false,
        error: 'REGISTRATION_ERROR',
        message: 'Registration failed due to server error'
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
router.post('/login', delay,
  authRateLimiter,
  validateUserLogin,
  trackLoginAttempt,
  async (req, res) => {
    const startTime = Date.now();
    try {
      const { identifier, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';

      logger.info('User login attempt', {
        identifier: identifier.substring(0, 3) + '***', // Partial identifier for privacy
        ip: ipAddress,
        userAgent: userAgent
      });

      // Get user data using modular query with NOLOCK
      const user = await authQueries.getUserByIdentifier(identifier);

      if (!user) {
        res.locals.loginSuccess = false;

        logger.audit('LOGIN_FAILED', 'USER_NOT_FOUND', {
          identifier: identifier.substring(0, 3) + '***',
          ip: ipAddress,
          userAgent: userAgent,
          responseTime: Date.now() - startTime
        });

        return res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid username/email or password'
        });
      }

      // Check if account is locked
      if (user.account_locked && (user.lock_until === null || new Date(user.lock_until) > new Date())) {
        res.locals.loginSuccess = false;

        logger.audit('LOGIN_FAILED', 'ACCOUNT_LOCKED', {
          userId: user.userid,
          username: user.username,
          ip: ipAddress,
          userAgent: userAgent,
          responseTime: Date.now() - startTime
        });

        return res.status(423).json({
          success: false,
          error: 'ACCOUNT_LOCKED',
          message: 'Account is temporarily locked due to too many failed attempts'
        });
      }

      // Verify password
      const passwordValid = await verifyPassword(user.password_hash, password);

      if (!passwordValid) {
        res.locals.loginSuccess = false;

        // Update login attempts using modular query (atomic)
        await authQueries.updateLoginAttempts(user.userid, false);

        logger.audit('LOGIN_FAILED', 'INVALID_PASSWORD', {
          userId: user.userid,
          username: user.username,
          ip: ipAddress,
          userAgent: userAgent,
          responseTime: Date.now() - startTime
        });

        return res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid username/email or password'
        });
      }

      // Password is valid - reset failed attempts and create session
      await authQueries.updateLoginAttempts(user.userid, true);

      // Create user session
      const sessionData = await createSession(
        user.userid,
        user.username,
        ipAddress,
        userAgent,
        user.permissions || []
      );

      // Track successful login
      res.locals.loginSuccess = true;

      logger.audit('LOGIN_SUCCESS', 'SESSION_CREATED', {
        userId: user.userid,
        username: user.username,
        sessionId: sessionData.sessionId,
        ip: ipAddress,
        userAgent: userAgent,
        responseTime: Date.now() - startTime
      });

      // Fetch full user profile to return immediately
      const userProfile = await authQueries.getUserProfileData(user.userid);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          userId: user.userid,
          username: user.username,
          email: user.email,
          // Include full profile data
          fullName: userProfile?.fullName,
          fullSurname: userProfile?.fullSurname,
          phone: userProfile?.phone,
          city: userProfile?.city,
          avatar: userProfile?.avatar || user.avatar, // Fallback to basic user data if profile fetch fails
          createdAt: userProfile?.created_at,
          // Token data
          accessToken: sessionData.accessToken,
          tokenType: sessionData.tokenType,
          expiresIn: sessionData.expiresIn,
        }
      });

    } catch (error) {
      logger.error('Login endpoint error', {
        error: error.message,
        stack: error.stack,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        responseTime: Date.now() - startTime
      });

      res.locals.loginSuccess = false;
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Internal server error during login'
      });
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', delay,
  verifyRefreshToken,
  async (req, res) => {
    const startTime = Date.now();
    try {
      const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';

      logger.info('Token refresh attempt', {
        ip: ipAddress,
        userAgent: userAgent
      });

      const tokenData = await refreshAccessToken(refreshToken);

      logger.audit('TOKEN_REFRESHED', 'SUCCESS', {
        ip: ipAddress,
        userAgent: userAgent,
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokenData
      });

    } catch (error) {
      logger.error('Token refresh error', {
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        responseTime: Date.now() - startTime
      });

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
router.post('/logout', delay,
  verifyToken,
  async (req, res) => {
    const startTime = Date.now();
    try {
      await revokeSession(req.user.sessionId);

      logger.audit('LOGOUT', 'SUCCESS', {
        userId: req.user.id,
        username: req.user.username,
        sessionId: req.user.sessionId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        responseTime: Date.now() - startTime
      });

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      logger.error('Logout error', {
        error: error.message,
        userId: req.user?.id,
        sessionId: req.user?.sessionId,
        ip: req.ip,
        responseTime: Date.now() - startTime
      });

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
router.post('/logout-all', delay,
  verifyToken,
  async (req, res) => {
    const startTime = Date.now();
    try {
      await revokeAllUserSessions(req.user.id);

      logger.audit('LOGOUT_ALL', 'SUCCESS', {
        userId: req.user.id,
        username: req.user.username,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        responseTime: Date.now() - startTime
      });

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });

    } catch (error) {
      logger.error('Logout all error', {
        error: error.message,
        userId: req.user?.id,
        ip: req.ip,
        responseTime: Date.now() - startTime
      });

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
    const startTime = Date.now();
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      logger.info('Password change attempt', {
        userId: userId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Get current password hash using modular query
      const passwordHash = await authQueries.getUserPasswordHash(userId);

      if (!passwordHash) {
        logger.audit('PASSWORD_CHANGE_FAILED', 'USER_NOT_FOUND', {
          userId: userId,
          ip: req.ip,
          responseTime: Date.now() - startTime
        });

        return res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      // Verify current password
      const passwordValid = await verifyPassword(passwordHash, currentPassword);

      if (!passwordValid) {
        logger.audit('PASSWORD_CHANGE_FAILED', 'INVALID_CURRENT_PASSWORD', {
          userId: userId,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          responseTime: Date.now() - startTime
        });

        return res.status(401).json({
          success: false,
          error: 'INVALID_CURRENT_PASSWORD',
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password using modular query (atomic transaction)
      await authQueries.updateUserPassword(userId, newPasswordHash, req.user.sessionId);

      // Revoke all other sessions except current one using modular queries
      const userSessions = await authQueries.getUserSessions(userId);
      const otherSessions = userSessions.filter(session => session.session_id !== req.user.sessionId);

      for (const session of otherSessions) {
        await authQueries.revokeSession(session.session_id);
      }

      logger.audit('PASSWORD_CHANGED', 'SUCCESS', {
        userId: userId,
        username: req.user.username,
        sessionId: req.user.sessionId,
        otherSessionsRevoked: otherSessions.length,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      logger.error('Change password error', {
        error: error.message,
        userId: req.user?.id,
        ip: req.ip,
        responseTime: Date.now() - startTime
      });

      res.status(500).json({
        success: false,
        error: 'PASSWORD_CHANGE_FAILED',
        message: 'Failed to change password'
      });
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
    const startTime = Date.now();
    try {
      logger.info('User profile request', {
        userId: req.user.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Get user profile data using modular query with NOLOCK
      const userData = await authQueries.getUserProfileData(req.user.id);

      if (!userData) {
        logger.audit('PROFILE_ACCESS_FAILED', 'USER_NOT_FOUND', {
          userId: req.user.id,
          ip: req.ip,
          responseTime: Date.now() - startTime
        });

        return res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      logger.audit('PROFILE_ACCESSED', 'SUCCESS', {
        userId: req.user.id,
        username: req.user.username,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: {
          id: userData.userid,
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName,
          fullSurname: userData.fullSurname,
          phone: userData.phone,
          city: userData.city,
          avatar: userData.avatar,
          description: userData.description,
          emailVerified: userData.email_verified,
          phoneVerified: userData.phone_verified,
          twoFactorEnabled: userData.two_factor_enabled,
          createdAt: userData.created_at,
          lastLogin: userData.last_login
        }
      });

    } catch (error) {
      logger.error('Profile access error', {
        error: error.message,
        userId: req.user?.id,
        ip: req.ip,
        responseTime: Date.now() - startTime
      });

      res.status(500).json({
        success: false,
        error: 'PROFILE_ACCESS_FAILED',
        message: 'Failed to get user profile'
      });
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
    const startTime = Date.now();
    try {
      logger.info('Sessions request', {
        userId: req.user.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Get user sessions using modular query with NOLOCK
      const sessions = await authQueries.getUserSessions(req.user.id);

      logger.audit('SESSIONS_ACCESSED', 'SUCCESS', {
        userId: req.user.id,
        username: req.user.username,
        sessionCount: sessions.length,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        data: sessions.map(session => ({
          sessionId: session.session_id,
          ipAddress: session.ip_address,
          userAgent: session.user_agent,
          createdAt: session.created_at,
          lastActivity: session.last_activity,
          isCurrent: session.session_id === req.user.sessionId
        }))
      });

    } catch (error) {
      logger.error('Sessions access error', {
        error: error.message,
        userId: req.user?.id,
        ip: req.ip,
        responseTime: Date.now() - startTime
      });

      res.status(500).json({
        success: false,
        error: 'SESSIONS_ACCESS_FAILED',
        message: 'Failed to get sessions'
      });
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
    const startTime = Date.now();
    try {
      const { sessionId } = req.params;

      logger.info('Session deletion request', {
        userId: req.user.id,
        sessionId: sessionId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Verify session belongs to user using modular query
      const sessionOwnership = await authQueries.getSessionOwnership(sessionId);

      if (!sessionOwnership || sessionOwnership.userid !== req.user.id) {
        logger.audit('SESSION_DELETE_FAILED', 'SESSION_NOT_FOUND_OR_UNAUTHORIZED', {
          userId: req.user.id,
          requestedSessionId: sessionId,
          ip: req.ip,
          responseTime: Date.now() - startTime
        });

        return res.status(404).json({
          success: false,
          error: 'SESSION_NOT_FOUND',
          message: 'Session not found'
        });
      }

      await revokeSession(sessionId);

      logger.audit('SESSION_DELETED', 'SUCCESS', {
        userId: req.user.id,
        username: req.user.username,
        deletedSessionId: sessionId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        responseTime: Date.now() - startTime
      });

      res.json({
        success: true,
        message: 'Session revoked successfully'
      });

    } catch (error) {
      logger.error('Session deletion error', {
        error: error.message,
        userId: req.user?.id,
        sessionId: req.params?.sessionId,
        ip: req.ip,
        responseTime: Date.now() - startTime
      });

      res.status(500).json({
        success: false,
        error: 'SESSION_REVOKE_FAILED',
        message: 'Failed to revoke session'
      });
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