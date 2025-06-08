// fullstack-psychology/backend/middleware/validation.js - Input Validation Middleware
import Joi from 'joi';
import logger from '../utils/logger.js';

// Mental state validation schema
const mentalStateSchema = Joi.object({
    focus: Joi.number().min(0).max(100).required(),
    creativity: Joi.number().min(0).max(100).required(),
    stress: Joi.number().min(0).max(100).required(),
    energy: Joi.number().min(0).max(100).required()
});

// Brainwave validation schema
const brainwaveSchema = Joi.object({
    alpha: Joi.number().min(0).max(20).required(),
    beta: Joi.number().min(0).max(40).required(),
    theta: Joi.number().min(0).max(15).required(),
    gamma: Joi.number().min(20).max(100).required(),
    delta: Joi.number().min(0).max(5).required()
});

// Session validation schemas
const createSessionSchema = Joi.object({
    sessionId: Joi.string().alphanum().min(3).max(100).optional(),
    userAgent: Joi.string().max(500).required(),
    mentalState: mentalStateSchema.required(),
    location: Joi.object({
        country: Joi.string().length(2).uppercase().optional(),
        timezone: Joi.string().max(50).optional()
    }).optional()
});

const updateSessionSchema = Joi.object({
    mentalState: mentalStateSchema.optional(),
    interactions: Joi.number().min(0).optional(),
    endTime: Joi.date().optional(),
    location: Joi.object({
        country: Joi.string().length(2).uppercase().optional(),
        timezone: Joi.string().max(50).optional()
    }).optional()
});

// Consciousness validation schema
const consciousnessSchema = Joi.object({
    sessionId: Joi.string().required(),
    mentalState: mentalStateSchema.required(),
    brainwaves: brainwaveSchema.optional(),
    cognitiveLoad: Joi.number().min(0).max(100).optional(),
    attentionLevel: Joi.number().min(0).max(100).optional(),
    emotionalState: Joi.string().valid(
        'relaxed', 'focused', 'creative', 'energetic', 'stressed',
        'flow_state', 'focused_creative', 'highly_creative',
        'active_concentration', 'relaxed_focus', 'peak_performance',
        'distracted', 'overwhelmed'
    ).optional(),
    environmentalFactors: Joi.object({
        timeOfDay: Joi.string().valid('morning', 'afternoon', 'evening', 'night').required(),
        sessionProgress: Joi.number().min(0).max(1).required()
    }).optional()
});

// Psychology test validation schemas
const reactionTestSchema = Joi.object({
    sessionId: Joi.string().required(),
    results: Joi.object({
        attempts: Joi.array().items(Joi.number().positive()).min(1).max(10).required(),
        average: Joi.number().positive().required(),
        best: Joi.number().positive().required(),
        worst: Joi.number().positive().required(),
        consistency: Joi.number().min(0).max(1).optional(),
        improvement: Joi.number().optional()
    }).required(),
    difficulty: Joi.number().min(1).max(5).optional(),
    mentalStateAtStart: mentalStateSchema.required(),
    mentalStateAtEnd: mentalStateSchema.required()
});

const memoryTestSchema = Joi.object({
    sessionId: Joi.string().required(),
    results: Joi.object({
        rounds: Joi.array().items(
            Joi.object({
                length: Joi.number().min(1).max(20).required(),
                correct: Joi.boolean().required(),
                time: Joi.number().positive().required()
            })
        ).min(1).required(),
        maxSequence: Joi.number().min(0).required(),
        totalCorrect: Joi.number().min(0).required(),
        totalAttempts: Joi.number().min(1).required(),
        averageResponseTime: Joi.number().positive().optional()
    }).required(),
    difficulty: Joi.number().min(1).max(5).optional(),
    mentalStateAtStart: mentalStateSchema.required(),
    mentalStateAtEnd: mentalStateSchema.required()
});

const colorTestSchema = Joi.object({
    sessionId: Joi.string().required(),
    results: Joi.object({
        tests: Joi.array().items(
            Joi.object({
                difficulty: Joi.number().min(1).max(30).required(),
                correct: Joi.boolean().required(),
                responseTime: Joi.number().positive().required()
            })
        ).min(1).required(),
        correctAnswers: Joi.number().min(0).required(),
        totalTests: Joi.number().min(1).required(),
        averageResponseTime: Joi.number().positive().optional(),
        sensitivityThreshold: Joi.number().positive().optional()
    }).required(),
    difficulty: Joi.number().min(1).max(5).optional(),
    mentalStateAtStart: mentalStateSchema.required(),
    mentalStateAtEnd: mentalStateSchema.required()
});

// Query parameter validation schemas
const sessionIdSchema = Joi.object({
    sessionId: Joi.string().required()
});

const analyticsQuerySchema = Joi.object({
    timeframe: Joi.string().valid('1h', '24h', '7d', '30d').optional(),
    sessionId: Joi.string().optional(),
    testType: Joi.string().valid('reaction_time', 'memory_sequence', 'color_perception').optional()
});

const paginationSchema = Joi.object({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
    sort: Joi.string().valid('timestamp', 'accuracy', 'completionTime', 'createdAt').optional(),
    order: Joi.string().valid('asc', 'desc').optional()
});

// Generic validation middleware factory
const validateRequest = (schema, property = 'body') => {
    return (req, res, next) => {
        const data = req[property];
        
        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });
        
        if (error) {
            const errorMessage = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));
            
            logger.warn('Validation error:', {
                endpoint: req.originalUrl,
                method: req.method,
                errors: errorMessage,
                ip: req.ip
            });
            
            return res.status(400).json({
                error: 'Validation failed',
                details: errorMessage,
                timestamp: new Date().toISOString()
            });
        }
        
        // Replace the original data with validated and sanitized data
        req[property] = value;
        next();
    };
};

// Specific validation middleware functions
export const validateCreateSession = validateRequest(createSessionSchema);
export const validateUpdateSession = validateRequest(updateSessionSchema);
export const validateConsciousness = validateRequest(consciousnessSchema);
export const validateReactionTest = validateRequest(reactionTestSchema);
export const validateMemoryTest = validateRequest(memoryTestSchema);
export const validateColorTest = validateRequest(colorTestSchema);

export const validateSessionId = validateRequest(sessionIdSchema, 'params');
export const validateAnalyticsQuery = validateRequest(analyticsQuerySchema, 'query');
export const validatePagination = validateRequest(paginationSchema, 'query');

// Composite validation for combined parameters
export const validateSessionParams = (req, res, next) => {
    validateSessionId(req, res, (err) => {
        if (err) return next(err);
        validatePagination(req, res, next);
    });
};

// Custom validation for psychology test type
export const validateTestType = (req, res, next) => {
    const { testType } = req.params;
    const validTypes = ['reaction_time', 'memory_sequence', 'color_perception', 'attention_span', 'pattern_recognition'];
    
    if (!validTypes.includes(testType)) {
        return res.status(400).json({
            error: 'Invalid test type',
            validTypes: validTypes,
            received: testType
        });
    }
    
    next();
};

// Validate psychology test data based on type
export const validatePsychologyTest = (req, res, next) => {
    const { testType } = req.body;
    
    if (!testType) {
        return res.status(400).json({
            error: 'Test type is required',
            validTypes: ['reaction_time', 'memory_sequence', 'color_perception']
        });
    }
    
    let schema;
    switch (testType) {
        case 'reaction_time':
            schema = reactionTestSchema;
            break;
        case 'memory_sequence':
            schema = memoryTestSchema;
            break;
        case 'color_perception':
            schema = colorTestSchema;
            break;
        default:
            return res.status(400).json({
                error: 'Unsupported test type',
                supportedTypes: ['reaction_time', 'memory_sequence', 'color_perception']
            });
    }
    
    validateRequest(schema)(req, res, next);
};

// Session existence validation middleware
export const validateSessionExists = async (req, res, next) => {
    try {
        const Session = (await import('../models/Session.js')).default;
        const { sessionId } = req.params;
        
        const session = await Session.findOne({ sessionId });
        if (!session) {
            return res.status(404).json({
                error: 'Session not found',
                sessionId: sessionId
            });
        }
        
        req.session = session;
        next();
    } catch (error) {
        logger.error('Error validating session existence:', error);
        res.status(500).json({
            error: 'Failed to validate session',
            message: error.message
        });
    }
};

// Rate limiting validation helper
export const validateRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Clean old requests
        for (const [id, timestamps] of requests.entries()) {
            requests.set(id, timestamps.filter(time => time > windowStart));
            if (requests.get(id).length === 0) {
                requests.delete(id);
            }
        }
        
        // Check current client
        const clientRequests = requests.get(clientId) || [];
        
        if (clientRequests.length >= maxRequests) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                maxRequests,
                windowMs,
                retryAfter: Math.ceil((clientRequests[0] + windowMs - now) / 1000)
            });
        }
        
        // Add current request
        clientRequests.push(now);
        requests.set(clientId, clientRequests);
        
        next();
    };
};

export { validateRequest };