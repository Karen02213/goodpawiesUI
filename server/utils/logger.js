const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logDir = path.join(__dirname, '../logs');

const transport = new DailyRotateFile({
  filename: path.join(logDir, 'server-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
    winston.format.json()
  ),
  transports: [
    transport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message} ${meta && meta.metadata && Object.keys(meta.metadata).length ? JSON.stringify(meta.metadata) : ''}`;
        })
      ),
    }),
  ],
});

// Helper for structured audit logs
logger.audit = (action, event, details = {}) => {
  const auditLog = {
    action,
    event,
    ...details,
    timestamp: new Date().toISOString(),
  };
  logger.info('AUDIT', auditLog);
};
module.exports = logger;
