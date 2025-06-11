// backend/utils/logger.js - Simple Version
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Add custom methods
logger.database = (action, details) => logger.info(`[DB] ${action}`, details);
logger.api = (method, endpoint, status, time) => logger.info(`[API] ${method} ${endpoint} ${status} ${time}ms`);
logger.psychology = (event, sessionId, data) => logger.info(`[PSY] ${event} ${sessionId}`, data);

export default logger;