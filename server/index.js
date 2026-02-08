// server/index.js - Simplified Main Server File
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import utilities and middleware
const { pool } = require('./db/index');
const { apiRateLimiter } = require('./middleware/rateLimiting');
const { cleanupExpiredTokens } = require('./utils/auth');
const { globalErrorHandler } = require('./utils/errors');
const { success, errors, send } = require('./utils/response');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const petRoutes = require('./routes/pets');
const qrRoutes = require('./routes/qr');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

// Logging middleware (log every request, structured for audit/data analysis)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('HTTP_REQUEST', {
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: Date.now() - start,
      userAgent: req.headers['user-agent'],
      referer: req.headers['referer'] || req.headers['referrer'] || '',
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });
  });
  next();
});

// Security, CORS, and body parsing middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "http://localhost:3000", "http://192.168.1.73:3000", process.env.CLIENT_URL || "http://localhost:3000"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));

const isDev = (process.env.NODE_ENV || 'development') === 'development';
const envAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://goodpawies.local'
];

const allowedOrigins = new Set([...defaultAllowedOrigins, ...envAllowedOrigins]);

const isAllowedDevOrigin = (origin) => {
  if (!origin) return true;
  if (!isDev) return false;
  try {
    const { hostname, protocol, port } = new URL(origin);
    const isHttp = protocol === 'http:';
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isLan = /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) || /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
    return isHttp && (isLocalhost || isLan) && (!port || port === '3000');
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    if (isAllowedDevOrigin(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/api', apiRateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/chat', chatRoutes);

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check and legacy endpoints
app.get('/api/health', async (req, res) => {
  try {
    const db = require('./db');
    await db.executeWithNoLock('SELECT 1 as health');
    send(res, success({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    }));
  } catch (error) {
    send(res, {
      ...errors.INTERNAL_ERROR(),
      statusCode: 503,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected'
      }
    });
  }
});

app.get('/api/hello', (req, res) => {
  send(res, success({
    message: 'Hello from GoodPawies API!',
    version: '2.0.0'
  }));
});

// Error handling and server startup
app.use(globalErrorHandler);

// Cleanup expired tokens every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

// Graceful shutdown handlers
const shutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  await pool.end();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 GoodPawies API Server running on http://0.0.0.0:${PORT}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔒 Security: Enhanced authentication enabled`);
});
