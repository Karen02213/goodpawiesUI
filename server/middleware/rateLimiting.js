// server/middleware/rateLimiting.js
// TODO: fix and implement ratelimit correctly and avoid in memory storage
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
const { ipKeyGenerator } = require('express-rate-limit');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'goodpawiesuser',
  password: process.env.DB_PASSWORD || 'goodpawiespass',
  database: process.env.DB_NAME || 'goodpawiesdb'
};

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
      // Ensure key is a string - handle new express-rate-limit API
      let keyStr;
      if (typeof key === 'object' && key !== null) {
        // Handle object key from newer versions of express-rate-limit
        keyStr = key.key || key.toString();
      } else {
        keyStr = String(key);
      }
      
      const connection = await mysql.createConnection(dbConfig);
      
      // Clean old attempts
      await connection.execute(
        `DELETE FROM ${this.tableName} WHERE attempt_time < ?`,
        [new Date(Date.now() - this.windowMs)]
      );
      
      // Count current attempts
      const [rows] = await connection.execute(
        `SELECT COUNT(*) as count FROM ${this.tableName} WHERE identifier = ? AND attempt_time > ?`,
        [keyStr, new Date(Date.now() - this.windowMs)]
      );
      
      // Add new attempt
      await connection.execute(
        `INSERT INTO ${this.tableName} (identifier, attempt_time, ip_address) VALUES (?, NOW(), ?)`,
        [keyStr, keyStr.split(':')[0]] // Extract IP from key
      );
      
      await connection.end();
      
      const totalHits = rows[0].count + 1;
      const resetTime = new Date(Date.now() + this.windowMs);
      
      return {
        totalHits,
        resetTime
      };
    } catch (error) {
      console.error('Rate limit store error:', error);
      // Fallback to allowing request if database fails
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
      // Ensure key is a string
      let keyStr;
      if (typeof key === 'object' && key !== null) {
        keyStr = key.key || key.toString();
      } else {
        keyStr = String(key);
      }
      
      const connection = await mysql.createConnection(dbConfig);
      await connection.execute(
        `DELETE FROM ${this.tableName} WHERE identifier = ?`,
        [keyStr]
      );
      await connection.end();
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
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rate_limit_attempts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        identifier VARCHAR(100) NOT NULL,
        attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        INDEX idx_rate_limit_identifier (identifier),
        INDEX idx_rate_limit_time (attempt_time)
      )
    `);
    await connection.end();
  } catch (error) {
    console.error('Failed to create rate limit table:', error);
  }
};

// Initialize table
createRateLimitTable();

/**
 * General rate limiter - using memory store to avoid double count issues
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // 100 requests per window
    message = 'Too many requests, please try again later.',
    keyGenerator,
    standardHeaders = true,
    legacyHeaders = false,
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    keyGenerator,
    standardHeaders,
    legacyHeaders,
    // Use memory store for now to avoid double count issues
    // store: new DatabaseStore('rate_limit_attempts')
  });
};

/**
 * Strict rate limiter for authentication endpoints
 */
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again in 15 minutes.',
  keyGenerator: (req) => {
    const identifier = req.body.identifier || req.body.username || req.body.email || '';
    return `${ipKeyGenerator(req)}:${identifier}`;
  }
});

/**
 * Moderate rate limiter for API endpoints
 */
const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window
  message: 'Too many API requests, please slow down.',
});

/**
 * Strict rate limiter for registration
 */
const registrationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: 'Too many registration attempts, please try again in an hour.',
});

/**
 * Rate limiter for password reset
 */
const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again in an hour.',
  keyGenerator: (req) => {
    const identifier = req.body.identifier || req.body.email || '';
    return `${ipKeyGenerator(req)}:${identifier}`;
  }
});

/**
 * Custom login attempt tracker with database
 */
const trackLoginAttempt = async (req, res, next) => {
  try {
    const identifier = req.body.identifier || '';
    const ip = req.ip;
    const userAgent = req.get('User-Agent') || '';
    const success = res.locals.loginSuccess || false;

    const connection = await mysql.createConnection(dbConfig);
    
    // Record the login attempt
    await connection.execute(
      `INSERT INTO login_attempts (identifier, ip_address, user_agent, success) 
       VALUES (?, ?, ?, ?)`,
      [identifier, ip, userAgent, success]
    );

    // Clean old attempts (older than 24 hours)
    await connection.execute(
      `DELETE FROM login_attempts WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );

    // Check recent failed attempts for this identifier
    const [failedAttempts] = await connection.execute(
      `SELECT COUNT(*) as count FROM login_attempts 
       WHERE identifier = ? AND success = FALSE AND attempt_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      [identifier]
    );

    await connection.end();

    // If too many failed attempts, block the request
    if (failedAttempts[0].count >= 5 && !success) {
      return res.status(429).json({
        success: false,
        error: 'TOO_MANY_ATTEMPTS',
        message: 'Too many failed login attempts. Please try again in an hour.',
        retryAfter: 3600
      });
    }

    next();
  } catch (error) {
    console.error('Login attempt tracking error:', error);
    // Don't block the request if tracking fails
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
