// server/db/authQueries.js
// Authentication-related database queries - modular, atomic, and ACID compliant
const db = require('./index');
const crypto = require('crypto');

/**
 * Register new user (atomic transaction)
 */
async function registerUser({ username, email, phonePrefix, phoneNumber, passwordHash, fullName, fullSurname }) {
  const operations = [
    // Call stored procedure for user registration
    {
      query: 'CALL sp_register_user(?, ?, ?, ?, ?, ?, ?, @user_id, @result)',
      params: [username, email, phonePrefix, phoneNumber, passwordHash, fullName, fullSurname]
    }
  ];

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Execute stored procedure
    await connection.execute(operations[0].query, operations[0].params);

    // Get output parameters
    const [output] = await connection.execute('SELECT @user_id as user_id, @result as result');
    const { user_id, result } = output[0];

    await connection.commit();

    return { userId: user_id, result };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Get user by identifier (username, email, or phone) with NOLOCK
 */
async function getUserByIdentifier(identifier) {
  const query = `
    SELECT u.id as userid, u.s_username, u.s_password_hash, u.s_email, u.account_locked, u.lock_until, u.failed_login_attempts, uimg.image_id as avatar
    FROM users u
    LEFT JOIN user_images uimg ON u.id = uimg.userid AND uimg.b_active = 1
    WHERE (u.s_username = ? OR u.s_email = ? OR CONCAT(u.s_phone_prefix, u.s_phone_number) = ?) AND u.b_active = 1
  `;

  const results = await db.executeWithNoLock(query, [identifier, identifier, identifier]);
  if (results[0]) {
    return {
      userid: results[0].userid,
      username: results[0].s_username,
      password_hash: results[0].s_password_hash,
      email: results[0].s_email,
      account_locked: results[0].account_locked,
      lock_until: results[0].lock_until,
      failed_login_attempts: results[0].failed_login_attempts,
      avatar: results[0].avatar
    };
  }
  return null;
}

/**
 * Update login attempts and lock status (atomic)
 */
async function updateLoginAttempts(userId, success = false) {
  if (success) {
    // Reset attempts on successful login
    const query = `UPDATE users SET failed_login_attempts = 0, account_locked = FALSE, lock_until = NULL, last_login = NOW() WHERE id = ?`;
    return await db.executeTransaction([{ query, params: [userId] }]);
  } else {
    // Increment failed attempts
    const operations = [
      {
        query: `UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?`,
        params: [userId]
      }
    ];

    // Check if we need to lock the account (after 5 failed attempts)
    const lockQuery = `
      UPDATE users 
      SET account_locked = TRUE, lock_until = DATE_ADD(NOW(), INTERVAL 30 MINUTE) 
      WHERE id = ? AND failed_login_attempts >= 5
    `;
    operations.push({ query: lockQuery, params: [userId] });

    return await db.executeTransaction(operations);
  }
}

/**
 * Create user session (atomic)
 */
async function createUserSession(userId, sessionId, expiresAt, ipAddress, userAgent) {
  const query = `
    INSERT INTO user_sessions (userid, session_id, expires_at, ip_address, user_agent) 
    VALUES (?, ?, ?, ?, ?)
  `;

  return await db.executeTransaction([{
    query,
    params: [userId, sessionId, expiresAt, ipAddress, userAgent]
  }]);
}

/**
 * Store refresh token (atomic)
 */
async function storeRefreshToken(userId, tokenHash, expiresAt, userAgent, ipAddress) {
  const query = `
    INSERT INTO refresh_tokens (userid, token_hash, expires_at, user_agent, ip_address) 
    VALUES (?, ?, ?, ?, ?)
  `;

  return await db.executeTransaction([{
    query,
    params: [userId, tokenHash, expiresAt, userAgent, ipAddress]
  }]);
}

/**
 * Get refresh token data with NOLOCK
 */
async function getRefreshTokenData(refreshTokenHash, sessionId) {
  const query = `
    SELECT rt.userid, rt.expires_at, u.s_username, us.session_id 
    FROM refresh_tokens rt
    JOIN users u ON rt.userid = u.id
    JOIN user_sessions us ON rt.userid = us.userid AND us.session_id = ?
    WHERE rt.token_hash = ? AND rt.revoked = FALSE AND rt.expires_at > NOW() AND us.is_active = TRUE
  `;

  const results = await db.executeWithNoLock(query, [sessionId, refreshTokenHash]);
  return results[0] || null;
}

/**
 * Update refresh token usage (atomic)
 */
async function updateRefreshTokenUsage(tokenHash) {
  const query = `UPDATE refresh_tokens SET last_used = NOW() WHERE token_hash = ?`;

  return await db.executeTransaction([{
    query,
    params: [tokenHash]
  }]);
}

/**
 * Check session validity with NOLOCK
 */
async function isSessionValid(sessionId) {
  const query = `
    SELECT userid, is_active FROM user_sessions 
    WHERE session_id = ? AND expires_at > NOW() AND is_active = TRUE
  `;

  const results = await db.executeWithNoLock(query, [sessionId]);
  return results[0] || null;
}

/**
 * Revoke session (atomic)
 */
async function revokeSession(sessionId) {
  const operations = [
    {
      query: `UPDATE user_sessions SET is_active = FALSE WHERE session_id = ?`,
      params: [sessionId]
    },
    {
      query: `UPDATE refresh_tokens rt
              JOIN user_sessions us ON rt.userid = us.userid
              SET rt.revoked = TRUE 
              WHERE us.session_id = ?`,
      params: [sessionId]
    }
  ];

  return await db.executeTransaction(operations);
}

/**
 * Revoke all user sessions (atomic)
 */
async function revokeAllUserSessions(userId) {
  const operations = [
    {
      query: `UPDATE user_sessions SET is_active = FALSE WHERE userid = ?`,
      params: [userId]
    },
    {
      query: `UPDATE refresh_tokens SET revoked = TRUE WHERE userid = ?`,
      params: [userId]
    }
  ];

  return await db.executeTransaction(operations);
}

/**
 * Get user profile data with NOLOCK
 */
async function getUserProfileData(userId) {
  const query = `
    SELECT u.id as userid, u.s_username as username, u.s_email as email, u.s_full_name as fullName, u.s_full_surname as fullSurname,
           CONCAT(u.s_phone_prefix, u.s_phone_number) as phone, u.s_city as city,
           u.email_verified, u.phone_verified, u.two_factor_enabled,
           u.dt_created_at as created_at, u.last_login,
           ui.s_description as description,
           uimg.image_id as avatar
    FROM users u
    LEFT JOIN user_info ui ON u.id = ui.userid AND ui.b_active = 1
    LEFT JOIN user_images uimg ON u.id = uimg.userid AND uimg.b_active = 1
    WHERE u.id = ? AND u.b_active = 1
  `;

  const results = await db.executeWithNoLock(query, [userId]);
  return results[0] || null;
}

/**
 * Get user active sessions with NOLOCK
 */
async function getUserSessions(userId, currentSessionId = null) {
  const query = `
    SELECT session_id, ip_address, user_agent, created_at, last_activity,
           CASE WHEN session_id = ? THEN true ELSE false END as is_current
    FROM user_sessions 
    WHERE userid = ? AND is_active = TRUE AND expires_at > NOW()
    ORDER BY last_activity DESC
  `;

  return await db.executeWithNoLock(query, [currentSessionId, userId]);
}

/**
 * Get session ownership with NOLOCK
 */
async function getSessionOwnership(sessionId) {
  const query = `SELECT userid FROM user_sessions WHERE session_id = ? AND is_active = TRUE`;

  const results = await db.executeWithNoLock(query, [sessionId]);
  return results[0] || null;
}

/**
 * Update user password (atomic)
 */
async function updateUserPassword(userId, newPasswordHash, currentSessionId) {
  const operations = [
    {
      query: `UPDATE users SET s_password_hash = ?, password_changed_at = NOW() WHERE id = ?`,
      params: [newPasswordHash, userId]
    },
    {
      query: `UPDATE user_sessions SET is_active = FALSE 
              WHERE userid = ? AND session_id != ?`,
      params: [userId, currentSessionId]
    },
    {
      query: `UPDATE refresh_tokens rt
              JOIN user_sessions us ON rt.userid = us.userid
              SET rt.revoked = TRUE 
              WHERE rt.userid = ? AND us.session_id != ?`,
      params: [userId, currentSessionId]
    }
  ];

  return await db.executeTransaction(operations);
}

/**
 * Get user password hash with NOLOCK
 */
async function getUserPasswordHash(userId) {
  const query = `SELECT s_password_hash FROM users WHERE id = ?`;

  const results = await db.executeWithNoLock(query, [userId]);
  return results[0]?.s_password_hash || null;
}

/**
 * Create password reset token (atomic)
 */
async function createPasswordResetToken(userId, tokenHash, expiresAt) {
  const operations = [
    {
      query: `UPDATE password_reset_tokens SET used = TRUE WHERE userid = ? AND used = FALSE`,
      params: [userId]
    },
    {
      query: `INSERT INTO password_reset_tokens (userid, token_hash, expires_at) VALUES (?, ?, ?)`,
      params: [userId, tokenHash, expiresAt]
    }
  ];

  return await db.executeTransaction(operations);
}

/**
 * Verify and use password reset token (atomic)
 */
async function verifyPasswordResetToken(tokenHash) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check token validity
    const [tokens] = await connection.execute(
      `SELECT userid FROM password_reset_tokens 
       WHERE token_hash = ? AND used = FALSE AND expires_at > NOW()`,
      [tokenHash]
    );

    if (tokens.length === 0) {
      await connection.rollback();
      return null;
    }

    // Mark token as used
    await connection.execute(
      `UPDATE password_reset_tokens SET used = TRUE WHERE token_hash = ?`,
      [tokenHash]
    );

    await connection.commit();
    return tokens[0].userid;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Cleanup expired data (atomic)
 */
async function cleanupExpiredData() {
  const operations = [
    {
      query: `DELETE FROM refresh_tokens WHERE expires_at < NOW()`,
      params: []
    },
    {
      query: `DELETE FROM user_sessions WHERE expires_at < NOW()`,
      params: []
    },
    {
      query: `DELETE FROM password_reset_tokens WHERE expires_at < NOW()`,
      params: []
    },
    {
      query: `DELETE FROM login_attempts WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
      params: []
    }
  ];

  return await db.executeTransaction(operations);
}

/**
 * Get user by ID with NOLOCK
 */
async function getUserById(userId) {
  const query = `
    SELECT id as userid, s_username as username, s_email as email, b_active as is_active, dt_created_at as created_at, dt_updated_at as updated_at
    FROM users
    WHERE id = ?
  `;

  const results = await db.executeWithNoLock(query, [userId]);
  return results[0] || null;
}

/**
 * Get refresh token by hash
 */
async function getRefreshToken(tokenHash) {
  const query = `
    SELECT userid, expires_at, created_at
    FROM refresh_tokens
    WHERE token_hash = ? AND revoked = FALSE AND expires_at > NOW()
  `;

  const results = await db.executeWithNoLock(query, [tokenHash]);
  return results[0] || null;
}

/**
 * Delete refresh token by hash
 */
async function deleteRefreshToken(tokenHash) {
  const query = `DELETE FROM refresh_tokens WHERE token_hash = ?`;
  return await db.execute(query, [tokenHash]);
}

/**
 * Deactivate user session
 */
async function deactivateUserSession(userId, sessionId) {
  const query = `
    UPDATE user_sessions 
    SET is_active = FALSE, updated_at = NOW() 
    WHERE userid = ? AND session_id = ?
  `;
  return await db.execute(query, [userId, sessionId]);
}

/**
 * Deactivate session by ID only
 */
async function deactivateSessionById(sessionId) {
  const query = `
    UPDATE user_sessions 
    SET is_active = FALSE, last_activity = NOW(), expires_at = NOW()
    WHERE session_id = ?
  `;
  return await db.execute(query, [sessionId]);
}

/**
 * Deactivate all user sessions
 */
async function deactivateAllUserSessions(userId) {
  const query = `
    UPDATE user_sessions 
    SET is_active = FALSE, last_activity = NOW(), expires_at = NOW()
    WHERE userid = ?
  `;
  return await db.execute(query, [userId]);
}

/**
 * Revoke refresh tokens by session
 */
async function revokeRefreshTokensBySession(sessionId) {
  const query = `
    UPDATE refresh_tokens rt
    JOIN user_sessions us ON rt.userid = us.userid
    SET rt.revoked = TRUE, rt.expires_at = NOW()
    WHERE us.session_id = ?
  `;
  return await db.execute(query, [sessionId]);
}

/**
 * Revoke all user refresh tokens
 */
async function revokeAllUserRefreshTokens(userId) {
  const query = `
    UPDATE refresh_tokens 
    SET revoked = TRUE, expires_at = NOW() 
    WHERE userid = ?
  `;
  return await db.execute(query, [userId]);
}

/**
 * Clean expired refresh tokens
 */
async function cleanExpiredRefreshTokens() {
  const query = `DELETE FROM refresh_tokens WHERE expires_at < NOW()`;
  return await db.execute(query, []);
}

/**
 * Clean expired sessions
 */
async function cleanExpiredSessions() {
  const query = `DELETE FROM user_sessions WHERE expires_at < NOW()`;
  return await db.execute(query, []);
}

/**
 * Clean expired password reset tokens
 */
async function cleanExpiredPasswordResetTokens() {
  const query = `DELETE FROM password_reset_tokens WHERE expires_at < NOW()`;
  return await db.execute(query, []);
}

/**
 * Clean old login attempts (older than 24 hours)
 */
async function cleanOldLoginAttempts() {
  const query = `DELETE FROM login_attempts WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 24 HOUR)`;
  return await db.execute(query, []);
}

module.exports = {
  registerUser,
  getUserByIdentifier,
  getUserById,
  updateLoginAttempts,
  createUserSession,
  storeRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  getRefreshTokenData,
  updateRefreshTokenUsage,
  isSessionValid,
  deactivateUserSession,
  deactivateSessionById,
  deactivateAllUserSessions,
  revokeSession,
  revokeRefreshTokensBySession,
  revokeAllUserSessions,
  revokeAllUserRefreshTokens,
  getUserProfileData,
  getUserSessions,
  getSessionOwnership,
  updateUserPassword,
  getUserPasswordHash,
  createPasswordResetToken,
  verifyPasswordResetToken,
  cleanExpiredRefreshTokens,
  cleanExpiredSessions,
  cleanExpiredPasswordResetTokens,
  cleanOldLoginAttempts,
  cleanupExpiredData,
};
