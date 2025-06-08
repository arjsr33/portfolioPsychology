// fullstack-psychology/backend/utils/logger.js - Winston Logger Configuration
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
};

// Add colors to winston
winston.addColors(colors);

// Custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        // Add metadata if present
        if (Object.keys(meta).length > 0) {
            log += `\n${JSON.stringify(meta, null, 2)}`;
        }
        
        return log;
    })
);

// Custom format for file output
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create transports array
const transports = [
    // Console transport for development
    new winston.transports.Console({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        format: consoleFormat
    })
];

// Add file transports for production
if (process.env.NODE_ENV === 'production') {
    // General log file
    transports.push(
        new winston.transports.File({
            filename: path.join(__dirname, '..', 'logs', 'app.log'),
            level: 'info',
            format: fileFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5
        })
    );
    
    // Error log file
    transports.push(
        new winston.transports.File({
            filename: path.join(__dirname, '..', 'logs', 'error.log'),
            level: 'error',
            format: fileFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5
        })
    );
    
    // HTTP requests log
    transports.push(
        new winston.transports.File({
            filename: path.join(__dirname, '..', 'logs', 'http.log'),
            level: 'http',
            format: fileFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 3
        })
    );
}

// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    levels,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: {
        service: 'psychology-backend',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
    },
    transports
});

// Enhanced logging methods for specific use cases

// Database operations logging
logger.database = (operation, details) => {
    logger.info('Database operation', {
        category: 'database',
        operation,
        ...details
    });
};

// API request logging
logger.api = (method, endpoint, statusCode, duration, details = {}) => {
    logger.http('API request', {
        category: 'api',
        method,
        endpoint,
        statusCode,
        duration,
        ...details
    });
};

// Performance logging
logger.performance = (operation, duration, details = {}) => {
    const level = duration > 1000 ? 'warn' : 'info'; // Warn on slow operations
    logger[level]('Performance metric', {
        category: 'performance',
        operation,
        duration,
        slow: duration > 1000,
        ...details
    });
};

// Security logging
logger.security = (event, details = {}) => {
    logger.warn('Security event', {
        category: 'security',
        event,
        timestamp: new Date().toISOString(),
        ...details
    });
};

// Business logic logging
logger.business = (event, details = {}) => {
    logger.info('Business event', {
        category: 'business',
        event,
        ...details
    });
};

// Psychology-specific logging
logger.psychology = (event, sessionId, details = {}) => {
    logger.info('Psychology event', {
        category: 'psychology',
        event,
        sessionId,
        ...details
    });
};

// Validation logging
logger.validation = (field, value, error) => {
    logger.warn('Validation failed', {
        category: 'validation',
        field,
        value: typeof value === 'object' ? JSON.stringify(value) : value,
        error
    });
};

// Request correlation helper
logger.withRequest = (requestId) => {
    return {
        info: (message, meta = {}) => logger.info(message, { requestId, ...meta }),
        warn: (message, meta = {}) => logger.warn(message, { requestId, ...meta }),
        error: (message, meta = {}) => logger.error(message, { requestId, ...meta }),
        debug: (message, meta = {}) => logger.debug(message, { requestId, ...meta })
    };
};

// Startup logging
logger.startup = (message, details = {}) => {
    logger.info(`🚀 ${message}`, {
        category: 'startup',
        ...details
    });
};

// Shutdown logging
logger.shutdown = (message, details = {}) => {
    logger.info(`💤 ${message}`, {
        category: 'shutdown',
        ...details
    });
};

// Log system information on startup
if (process.env.NODE_ENV !== 'test') {
    logger.startup('Logger initialized', {
        level: logger.level,
        environment: process.env.NODE_ENV,
        transports: transports.length,
        logFiles: process.env.NODE_ENV === 'production'
    });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack,
        category: 'system'
    });
    
    // Exit gracefully
    setTimeout(() => process.exit(1), 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', {
        reason: reason instanceof Error ? reason.message : reason,
        stack: reason instanceof Error ? reason.stack : undefined,
        promise: promise.toString(),
        category: 'system'
    });
});

export default logger;