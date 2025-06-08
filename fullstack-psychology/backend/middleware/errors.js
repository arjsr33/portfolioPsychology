// fullstack-psychology/backend/middleware/errors.js - Error Handling Middleware
import logger from '../utils/logger.js';

// Custom error classes
export class ValidationError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
        this.field = field;
    }
}

export class NotFoundError extends Error {
    constructor(resource = 'Resource') {
        super(`${resource} not found`);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

export class DatabaseError extends Error {
    constructor(message, originalError = null) {
        super(message);
        this.name = 'DatabaseError';
        this.statusCode = 500;
        this.originalError = originalError;
    }
}

export class RateLimitError extends Error {
    constructor(message = 'Rate limit exceeded') {
        super(message);
        this.name = 'RateLimitError';
        this.statusCode = 429;
    }
}

// Error response formatter
const formatErrorResponse = (error, req) => {
    const timestamp = new Date().toISOString();
    const requestId = req.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const baseResponse = {
        error: true,
        message: error.message || 'An error occurred',
        timestamp,
        requestId,
        path: req.originalUrl,
        method: req.method
    };

    // Add development-specific error details
    if (process.env.NODE_ENV === 'development') {
        baseResponse.stack = error.stack;
        baseResponse.details = {
            name: error.name,
            statusCode: error.statusCode
        };
    }

    // Add specific error type information
    if (error.name === 'ValidationError' && error.field) {
        baseResponse.field = error.field;
    }

    if (error.name === 'MongoError' || error.name === 'MongooseError') {
        baseResponse.type = 'database_error';
        if (process.env.NODE_ENV === 'development') {
            baseResponse.mongoCode = error.code;
        }
    }

    return baseResponse;
};

// Main error handling middleware
export const errorHandler = (error, req, res, next) => {
    // Log the error
    logger.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        params: req.params,
        query: req.query
    });

    let statusCode = 500;
    let response = formatErrorResponse(error, req);

    // Handle specific error types
    switch (error.name) {
        case 'ValidationError':
            statusCode = 400;
            response.type = 'validation_error';
            break;

        case 'NotFoundError':
            statusCode = 404;
            response.type = 'not_found_error';
            break;

        case 'RateLimitError':
            statusCode = 429;
            response.type = 'rate_limit_error';
            response.retryAfter = '15 minutes';
            break;

        case 'CastError':
            statusCode = 400;
            response.message = 'Invalid ID format';
            response.type = 'cast_error';
            break;

        case 'MongoError':
        case 'MongooseError':
            statusCode = 500;
            response.type = 'database_error';
            
            // Handle specific MongoDB errors
            if (error.code === 11000) {
                statusCode = 409;
                response.message = 'Duplicate entry - resource already exists';
                response.type = 'duplicate_error';
                
                // Extract field from duplicate key error
                const field = Object.keys(error.keyPattern || {})[0];
                if (field) {
                    response.field = field;
                    response.message = `${field} already exists`;
                }
            } else if (error.code === 121) {
                statusCode = 400;
                response.message = 'Document validation failed';
                response.type = 'document_validation_error';
            }
            break;

        case 'JsonWebTokenError':
            statusCode = 401;
            response.message = 'Invalid token';
            response.type = 'token_error';
            break;

        case 'TokenExpiredError':
            statusCode = 401;
            response.message = 'Token expired';
            response.type = 'token_expired_error';
            break;

        case 'SyntaxError':
            if (error.message.includes('JSON')) {
                statusCode = 400;
                response.message = 'Invalid JSON in request body';
                response.type = 'json_syntax_error';
            }
            break;

        default:
            // Check for custom status codes
            if (error.statusCode) {
                statusCode = error.statusCode;
            }
            
            // Generic server error
            if (statusCode === 500) {
                response.message = 'Internal server error';
                response.type = 'internal_server_error';
                
                // Don't expose internal error details in production
                if (process.env.NODE_ENV === 'production') {
                    delete response.stack;
                    delete response.details;
                }
            }
    }

    // Add helpful suggestions for common errors
    if (statusCode === 400) {
        response.suggestions = [
            'Check your request format and data types',
            'Ensure all required fields are provided',
            'Verify that numeric values are within valid ranges'
        ];
    }

    if (statusCode === 404) {
        response.suggestions = [
            'Check the URL path and endpoint',
            'Verify that the resource ID exists',
            'Make sure you\'re using the correct HTTP method'
        ];
    }

    if (statusCode === 429) {
        response.suggestions = [
            'Wait before making another request',
            'Implement exponential backoff in your client',
            'Consider caching responses to reduce API calls'
        ];
    }

    // Set appropriate headers
    res.status(statusCode);
    
    if (statusCode === 429) {
        res.set('Retry-After', '900'); // 15 minutes in seconds
    }

    // Send the error response
    res.json(response);
};

// 404 Not Found handler
export const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError('Endpoint');
    error.message = `Cannot ${req.method} ${req.originalUrl}`;
    
    const response = formatErrorResponse(error, req);
    response.type = 'endpoint_not_found';
    response.availableEndpoints = {
        consciousness: [
            'GET /api/consciousness/session/:sessionId',
            'POST /api/consciousness/session',
            'PUT /api/consciousness/session/:sessionId/state',
            'GET /api/consciousness/session/:sessionId/brainwaves'
        ],
        psychology: [
            'POST /api/psychology/tests/reaction',
            'POST /api/psychology/tests/memory',
            'POST /api/psychology/tests/color',
            'GET /api/psychology/analytics'
        ],
        demo: [
            'GET /demo',
            'GET /demo/api',
            'GET /demo/database',
            'GET /health'
        ]
    };

    logger.warn('404 Not Found:', {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    res.status(404).json(response);
};

// Async error wrapper
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Database connection error handler
export const handleDatabaseError = (error) => {
    logger.error('Database connection error:', error);
    
    if (error.name === 'MongoNetworkError') {
        return new DatabaseError('Failed to connect to database - network error', error);
    }
    
    if (error.name === 'MongooseServerSelectionError') {
        return new DatabaseError('Database server unavailable', error);
    }
    
    if (error.message.includes('authentication')) {
        return new DatabaseError('Database authentication failed', error);
    }
    
    return new DatabaseError('Database connection failed', error);
};

// Validation error helper
export const createValidationError = (message, field = null) => {
    return new ValidationError(message, field);
};

// Not found error helper
export const createNotFoundError = (resource = 'Resource') => {
    return new NotFoundError(resource);
};

// Request logging middleware for errors
export const requestLogger = (req, res, next) => {
    // Add request ID for tracking
    req.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log incoming request
    logger.info('Incoming request:', {
        id: req.id,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentType: req.get('Content-Type')
    });
    
    // Log response when finished
    const originalSend = res.json;
    res.json = function(data) {
        logger.info('Response sent:', {
            requestId: req.id,
            statusCode: res.statusCode,
            method: req.method,
            url: req.originalUrl,
            responseTime: Date.now() - req.startTime
        });
        
        return originalSend.call(this, data);
    };
    
    req.startTime = Date.now();
    next();
};

// Health check error handler
export const healthCheckError = (error) => {
    logger.error('Health check failed:', error);
    return {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: error.message,
        uptime: process.uptime()
    };
};