// server/middleware/rateLimiting.js
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const { executeQuery, executeTransaction } = require('../utils/database');
const { errors, send } = require('../utils/response');

/**
 * Store for rate limiting using database
 */
class DatabaseStore {
  constructor(tableName = 'rate_limit_attempts') {
    this.tableName = tableName;
    this.windowMs = 15 * 60 * 1000; // 15 minutes
  }

  async increment(key) {
    try {
      const keyStr = typeof key === 'object' && key !== null ? (key.key || key.toString()) : String(key);
      
      // Clean old attempts and count current ones
      const operations = [
        {
          query: `DELETE FROM ${this.tableName} WHERE attempt_time < ?`,
          params: [new Date(Date.now() - this.windowMs)]
        },
        {
          query: `INSERT INTO ${this.tableName} (identifier, attempt_time, ip_address) VALUES (?, NOW(), ?)`,
          params: [keyStr, keyStr.split(':')[0]]
        }
      ];
      
      await executeTransaction(operations);
      
      // Get current count
      const results = await executeQuery(
        `SELECT COUNT(*) as count FROM ${this.tableName} WHERE identifier = ? AND attempt_time > ?`,
        [keyStr, new Date(Date.now() - this.windowMs)]
      );
      
      return {
        totalHits: results[0].count,
        resetTime: new Date(Date.now() + this.windowMs)
      };
    } catch (error) {
      console.error('Rate limit store error:', error);
      return {
        totalHits: 1,
        resetTime: new Date(Date.now() + this.windowMs)
      };
    }
  }

  async decrement(key) {
    // Not implemented for this use case
    return;
  }

  async resetKey(key) {
    try {
      const keyStr = typeof key === 'object' && key !== null ? (key.key || key.toString()) : String(key);
      await executeQuery(`DELETE FROM ${this.tableName} WHERE identifier = ?`, [keyStr]);
    } catch (error) {
      console.error('Rate limit reset error:', error);
    }
  }
}

/**
 * Create rate limit table if it doesn't exist
 */
const createRateLimitTable = async () => {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS rate_limit_attempts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        identifier VARCHAR(100) NOT NULL,
        attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        INDEX idx_rate_limit_identifier (identifier),
        INDEX idx_rate_limit_time (attempt_time)
      )
    `);
  } catch (error) {
    console.error('Failed to create rate limit table:', error);
  }
};

// Initialize table
createRateLimitTable();

/**
 * General rate limiter factory - reduces redundancy in rate limiter creation
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests, please try again later.',
    keyGenerator,
    standardHeaders = true,
    legacyHeaders = false,
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: errors.RATE_LIMIT(Math.ceil(windowMs / 1000)),
    keyGenerator,
    standardHeaders,
    legacyHeaders,
  });
};

// Rate limiter configurations - centralized to reduce redundancy
const rateLimitConfigs = {
  auth: {
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again in 1 minute.',
    keyGenerator: (req) => {
      const identifier = req.body.identifier || req.body.username || req.body.email || '';
      return `${ipKeyGenerator(req)}:${identifier}`;
    }
  },
  api: {
    windowMs: 5 * 60 * 1000,
    max: 1000,
    message: 'Too many API requests, please slow down.'
  },
  registration: {
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many registration attempts, please try again in an hour.'
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many password reset attempts, please try again in an hour.',
    keyGenerator: (req) => {
      const identifier = req.body.identifier || req.body.email || '';
      return `${ipKeyGenerator(req)}:${identifier}`;
    }
  }
};

// Create all rate limiters using the factory
const authRateLimiter = createRateLimiter(rateLimitConfigs.auth);
const apiRateLimiter = createRateLimiter(rateLimitConfigs.api);
const registrationRateLimiter = createRateLimiter(rateLimitConfigs.registration);
const passwordResetRateLimiter = createRateLimiter(rateLimitConfigs.passwordReset);

/**
 * Custom login attempt tracker with database
 */
const trackLoginAttempt = async (req, res, next) => {
  try {
    const identifier = req.body.identifier || '';
    const ip = req.ip;
    const userAgent = req.get('User-Agent') || '';
    const success = res.locals.loginSuccess || false;

    // Record the login attempt and clean old ones
    const operations = [
      {
        query: 'INSERT INTO login_attempts (identifier, ip_address, user_agent, success) VALUES (?, ?, ?, ?)',
        params: [identifier, ip, userAgent, success]
      },
      {
        query: 'DELETE FROM login_attempts WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 24 HOUR)',
        params: []
      }
    ];

    await executeTransaction(operations);

    // Check recent failed attempts for this identifier
    const results = await executeQuery(
      `SELECT COUNT(*) as count FROM login_attempts 
       WHERE identifier = ? AND success = FALSE AND attempt_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      [identifier]
    );

    if (results[0].count >= 21 && !success) {
      return send(res, { ...errors.RATE_LIMIT(3600), message: 'Too many failed login attempts. Please try again in an hour.' });
    }

    next();
  } catch (error) {
    console.error('Login attempt tracking error:', error);
    next();
  }
};

/**
 * Middleware to set login success status
 */
const setLoginSuccess = (success) => {
  return (req, res, next) => {
    res.locals.loginSuccess = success;
    next();
  };
};

module.exports = {
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
  trackLoginAttempt,
  setLoginSuccess
};
