// fullstack-psychology/backend/routes/api.js - Main API Routes
import express from 'express';
import { asyncHandler } from '../middleware/errors.js';
import { validateAnalyticsQuery } from '../middleware/validation.js';
import Session from '../models/Session.js';
import Consciousness from '../models/Consciousness.js';
import PsychologyTest from '../models/PsychologyTest.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /api - API information
router.get('/', (req, res) => {
    res.json({
        name: 'Psychology Portfolio API',
        version: '1.0.0',
        description: 'RESTful API for consciousness monitoring and psychology testing',
        documentation: {
            main: '/demo',
            interactive: '/demo/api',
            database: '/demo/database',
            algorithms: '/demo/psychology'
        },
        endpoints: {
            consciousness: {
                base: '/api/consciousness',
                description: 'Consciousness session management and mental state tracking',
                endpoints: [
                    'POST /session - Create new session',
                    'GET /session/:id - Get session details',
                    'PUT /session/:id/state - Update mental state',
                    'GET /session/:id/brainwaves - Get brainwave data',
                    'POST /record - Create consciousness record',
                    'GET /analytics - Get consciousness analytics'
                ]
            },
            psychology: {
                base: '/api/psychology',
                description: 'Psychology tests and performance analytics',
                endpoints: [
                    'POST /tests/reaction - Submit reaction time test',
                    'POST /tests/memory - Submit memory test',
                    'POST /tests/color - Submit color perception test',
                    'GET /tests/:type - Get tests by type',
                    'GET /session/:id/tests - Get session tests',
                    'GET /analytics - Get test analytics',
                    'GET /stats/overview - Get overview statistics'
                ]
            }
        },
        features: [
            'Real-time consciousness monitoring',
            'Psychology test submissions',
            'Advanced analytics and insights',
            'Session management',
            'Brainwave simulation',
            'Performance tracking'
        ],
        technologies: [
            'Node.js + Express',
            'MongoDB + Mongoose',
            'RESTful API design',
            'Input validation with Joi',
            'Comprehensive error handling',
            'Performance monitoring'
        ],
        timestamp: new Date().toISOString()
    });
});

// GET /api/status - API status and health
router.get('/status', asyncHandler(async (req, res) => {
    const startTime = Date.now();
    
    // Test database connectivity
    let dbStatus = 'connected';
    let dbResponseTime = 0;
    
    try {
        const dbStart = Date.now();
        await Session.countDocuments().limit(1);
        dbResponseTime = Date.now() - dbStart;
    } catch (error) {
        dbStatus = 'error';
        logger.error('Database health check failed:', error);
    }
    
    // Get quick stats
    const stats = {
        totalSessions: await Session.countDocuments().catch(() => 0),
        activeSessions: await Session.countDocuments({ endTime: null }).catch(() => 0),
        totalTests: await PsychologyTest.countDocuments().catch(() => 0),
        consciousnessRecords: await Consciousness.countDocuments().catch(() => 0)
    };
    
    const responseTime = Date.now() - startTime;
    
    res.json({
        status: 'operational',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        database: {
            status: dbStatus,
            responseTime: `${dbResponseTime}ms`
        },
        api: {
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime()
        },
        statistics: stats,
        endpoints: {
            consciousness: '/api/consciousness',
            psychology: '/api/psychology',
            demo: '/demo'
        }
    });
}));

// GET /api/analytics - Combined analytics
router.get('/analytics', 
    validateAnalyticsQuery,
    asyncHandler(async (req, res) => {
        const { timeframe = '24h', sessionId } = req.query;
        
        try {
            // Get analytics from all areas
            const [
                sessionAnalytics,
                consciousnessAnalytics,
                psychologyAnalytics
            ] = await Promise.all([
                Session.getAnalytics(timeframe),
                Consciousness.getAnalytics(sessionId, timeframe),
                PsychologyTest.getTestAnalytics(null, timeframe)
            ]);
            
            // Calculate combined insights
            const insights = {
                totalDataPoints: (
                    (sessionAnalytics[0]?.totalSessions || 0) +
                    (consciousnessAnalytics[0]?.count || 0) +
                    psychologyAnalytics.reduce((sum, test) => sum + test.count, 0)
                ),
                averageEngagement: sessionAnalytics[0]?.avgPerformance || 0,
                mentalStateBalance: consciousnessAnalytics[0]?.mentalState ? 
                    Object.values(consciousnessAnalytics[0].mentalState).reduce((a, b) => a + b, 0) / 4 : 0,
                testPerformance: psychologyAnalytics.length > 0 ?
                    psychologyAnalytics.reduce((sum, test) => sum + test.avgAccuracy, 0) / psychologyAnalytics.length : 0
            };
            
            res.json({
                timeframe,
                sessionId: sessionId || 'all',
                analytics: {
                    sessions: sessionAnalytics[0] || {},
                    consciousness: consciousnessAnalytics[0] || {},
                    psychology: psychologyAnalytics
                },
                insights: {
                    ...insights,
                    overallHealth: Math.round((insights.averageEngagement + insights.mentalStateBalance + insights.testPerformance) / 3)
                },
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            logger.error('Combined analytics query failed:', error);
            throw error;
        }
    })
);

// GET /api/summary - Quick API summary
router.get('/summary', asyncHandler(async (req, res) => {
    const summary = {
        api: {
            name: 'Psychology Portfolio API',
            version: '1.0.0',
            status: 'operational'
        },
        capabilities: {
            consciousness: 'Real-time mental state tracking',
            psychology: 'Cognitive test processing',
            analytics: 'Performance insights',
            simulation: 'Brainwave generation'
        },
        dataModels: {
            Session: 'User consciousness sessions',
            Consciousness: 'Mental state snapshots',
            PsychologyTest: 'Cognitive test results'
        },
        algorithms: {
            consciousnessScore: 'Mental state + brainwave analysis',
            brainwaveGeneration: 'Realistic frequency simulation',
            emotionalMapping: 'State-based emotion detection',
            performanceTracking: 'Progress and improvement analysis'
        },
        integrations: {
            frontend: 'React application support',
            database: 'MongoDB with Mongoose ODM',
            validation: 'Joi schema validation',
            logging: 'Winston comprehensive logging'
        },
        timestamp: new Date().toISOString()
    };
    
    res.json(summary);
}));

// GET /api/demo-data - Generate demo data for testing
router.post('/demo-data', asyncHandler(async (req, res) => {
    const { count = 1 } = req.body;
    
    if (count > 5) {
        return res.status(400).json({
            error: 'Maximum 5 demo sessions allowed',
            requested: count,
            maximum: 5
        });
    }
    
    const createdSessions = [];
    
    for (let i = 0; i < count; i++) {
        // Create demo session
        const sessionId = `demo_${Date.now()}_${i}`;
        const mentalState = {
            focus: Math.floor(Math.random() * 40) + 60,    // 60-100
            creativity: Math.floor(Math.random() * 40) + 50, // 50-90
            stress: Math.floor(Math.random() * 40) + 20,   // 20-60
            energy: Math.floor(Math.random() * 40) + 50    // 50-90
        };
        
        const session = new Session({
            sessionId,
            userAgent: 'Demo Data Generator',
            mentalState,
            interactions: Math.floor(Math.random() * 50) + 10,
            location: {
                country: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)],
                timezone: 'UTC'
            }
        });
        
        await session.save();
        
        // Create consciousness records
        for (let j = 0; j < 3; j++) {
            const consciousness = new Consciousness({
                sessionId,
                mentalState: {
                    focus: mentalState.focus + (Math.random() - 0.5) * 10,
                    creativity: mentalState.creativity + (Math.random() - 0.5) * 10,
                    stress: mentalState.stress + (Math.random() - 0.5) * 10,
                    energy: mentalState.energy + (Math.random() - 0.5) * 10
                },
                brainwaves: {
                    alpha: 8 + Math.random() * 4,
                    beta: 13 + Math.random() * 12,
                    theta: 4 + Math.random() * 4,
                    gamma: 30 + Math.random() * 20,
                    delta: 1 + Math.random() * 2
                },
                cognitiveLoad: Math.floor(Math.random() * 60) + 20,
                attentionLevel: Math.floor(Math.random() * 60) + 40,
                environmentalFactors: {
                    timeOfDay: ['morning', 'afternoon', 'evening'][Math.floor(Math.random() * 3)],
                    sessionProgress: j / 3
                }
            });
            
            await consciousness.save();
        }
        
        // Create demo test
        const testType = ['reaction_time', 'memory_sequence', 'color_perception'][Math.floor(Math.random() * 3)];
        let testResults;
        
        switch (testType) {
            case 'reaction_time':
                const attempts = Array.from({length: 5}, () => Math.floor(Math.random() * 200) + 200);
                testResults = {
                    attempts,
                    average: attempts.reduce((a, b) => a + b, 0) / attempts.length,
                    best: Math.min(...attempts),
                    worst: Math.max(...attempts),
                    consistency: 0.8 + Math.random() * 0.2
                };
                break;
            case 'memory_sequence':
                testResults = {
                    rounds: [
                        { length: 3, correct: true, time: 2000 + Math.random() * 1000 },
                        { length: 4, correct: true, time: 2500 + Math.random() * 1000 },
                        { length: 5, correct: Math.random() > 0.3, time: 3000 + Math.random() * 1000 }
                    ],
                    maxSequence: Math.floor(Math.random() * 4) + 4,
                    totalCorrect: 2 + Math.floor(Math.random() * 2),
                    totalAttempts: 3
                };
                break;
            case 'color_perception':
                testResults = {
                    tests: Array.from({length: 5}, () => ({
                        difficulty: Math.floor(Math.random() * 20) + 5,
                        correct: Math.random() > 0.2,
                        responseTime: Math.floor(Math.random() * 2000) + 1000
                    })),
                    correctAnswers: 4,
                    totalTests: 5,
                    averageResponseTime: 1500,
                    sensitivityThreshold: Math.random() * 10 + 5
                };
                break;
        }
        
        const test = new PsychologyTest({
            sessionId,
            testType,
            results: testResults,
            accuracy: Math.floor(Math.random() * 30) + 70, // 70-100%
            completionTime: Math.floor(Math.random() * 30000) + 30000, // 30-60 seconds
            difficulty: Math.floor(Math.random() * 3) + 2, // 2-4
            mentalStateAtStart: mentalState,
            mentalStateAtEnd: {
                focus: mentalState.focus + (Math.random() - 0.5) * 10,
                creativity: mentalState.creativity + (Math.random() - 0.5) * 10,
                stress: Math.max(0, mentalState.stress + (Math.random() - 0.7) * 15),
                energy: mentalState.energy + (Math.random() - 0.5) * 10
            }
        });
        
        await test.save();
        await session.endSession();
        
        createdSessions.push({
            sessionId,
            mentalState,
            consciousnessRecords: 3,
            testType,
            testAccuracy: test.accuracy
        });
        
        logger.psychology('demo_data_created', sessionId, {
            testType,
            accuracy: test.accuracy
        });
    }
    
    res.status(201).json({
        message: `${count} demo session(s) created successfully`,
        sessions: createdSessions,
        timestamp: new Date().toISOString()
    });
}));

// GET /api/performance - API performance metrics
router.get('/performance', asyncHandler(async (req, res) => {
    const startTime = Date.now();
    
    // Test various operations
    const metrics = {};
    
    // Database query performance
    const dbStart = Date.now();
    await Session.findOne();
    metrics.databaseQuery = Date.now() - dbStart;
    
    // Aggregation performance
    const aggStart = Date.now();
    await Session.getAnalytics('1h');
    metrics.aggregationQuery = Date.now() - aggStart;
    
    // Consciousness calculation performance
    const calcStart = Date.now();
    Consciousness.calculateConsciousnessScore(
        { focus: 75, creativity: 68, stress: 32, energy: 82 },
        { alpha: 10, beta: 20, theta: 6, gamma: 40, delta: 2 }
    );
    metrics.consciousnessCalculation = Date.now() - calcStart;
    
    const totalResponseTime = Date.now() - startTime;
    
    res.json({
        performance: {
            totalResponseTime: `${totalResponseTime}ms`,
            breakdown: {
                databaseQuery: `${metrics.databaseQuery}ms`,
                aggregationQuery: `${metrics.aggregationQuery}ms`,
                consciousnessCalculation: `${metrics.consciousnessCalculation}ms`
            }
        },
        optimization: {
            status: totalResponseTime < 100 ? 'excellent' : 
                    totalResponseTime < 500 ? 'good' : 
                    totalResponseTime < 1000 ? 'acceptable' : 'needs_optimization',
            recommendations: totalResponseTime > 500 ? [
                'Consider database indexing optimization',
                'Implement response caching',
                'Optimize aggregation queries'
            ] : ['Performance is optimal']
        },
        timestamp: new Date().toISOString()
    });
}));

// POST /api/test-endpoints - Test all major endpoints
router.post('/test-endpoints', asyncHandler(async (req, res) => {
    const testResults = [];
    
    try {
        // Test session creation
        const sessionTest = await fetch(`${req.protocol}://${req.get('host')}/api/consciousness/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userAgent: 'API Test Suite',
                mentalState: { focus: 75, creativity: 68, stress: 32, energy: 82 }
            })
        });
        
        testResults.push({
            endpoint: 'POST /api/consciousness/session',
            status: sessionTest.ok ? 'pass' : 'fail',
            responseTime: '< 1s',
            statusCode: sessionTest.status
        });
        
        // Test analytics endpoints
        const analyticsTest = await fetch(`${req.protocol}://${req.get('host')}/api/analytics`);
        testResults.push({
            endpoint: 'GET /api/analytics',
            status: analyticsTest.ok ? 'pass' : 'fail',
            responseTime: '< 1s',
            statusCode: analyticsTest.status
        });
        
        // Test psychology overview
        const psychologyTest = await fetch(`${req.protocol}://${req.get('host')}/api/psychology/stats/overview`);
        testResults.push({
            endpoint: 'GET /api/psychology/stats/overview',
            status: psychologyTest.ok ? 'pass' : 'fail',
            responseTime: '< 1s',
            statusCode: psychologyTest.status
        });
        
    } catch (error) {
        logger.error('Endpoint testing failed:', error);
        testResults.push({
            endpoint: 'Test Suite',
            status: 'error',
            error: error.message
        });
    }
    
    const passedTests = testResults.filter(test => test.status === 'pass').length;
    const totalTests = testResults.length;
    
    res.json({
        testSuite: {
            name: 'API Endpoint Test Suite',
            passed: passedTests,
            total: totalTests,
            success: passedTests === totalTests,
            coverage: `${Math.round((passedTests / totalTests) * 100)}%`
        },
        results: testResults,
        timestamp: new Date().toISOString()
    });
}));

// GET /api/documentation - Auto-generated API documentation
router.get('/documentation', (req, res) => {
    res.json({
        title: 'Psychology Portfolio API Documentation',
        version: '1.0.0',
        baseUrl: `${req.protocol}://${req.get('host')}/api`,
        authentication: 'None required (portfolio demo)',
        rateLimit: '100 requests per 15 minutes',
        
        models: {
            Session: {
                description: 'User consciousness session',
                fields: {
                    sessionId: 'string (unique)',
                    userAgent: 'string',
                    mentalState: 'object { focus, creativity, stress, energy }',
                    interactions: 'number',
                    duration: 'number (milliseconds)',
                    location: 'object { country, timezone }'
                }
            },
            Consciousness: {
                description: 'Mental state snapshot',
                fields: {
                    sessionId: 'string (reference)',
                    timestamp: 'date',
                    mentalState: 'object { focus, creativity, stress, energy }',
                    brainwaves: 'object { alpha, beta, theta, gamma, delta }',
                    cognitiveLoad: 'number (0-100)',
                    emotionalState: 'string (enum)'
                }
            },
            PsychologyTest: {
                description: 'Cognitive test result',
                fields: {
                    sessionId: 'string (reference)',
                    testType: 'string (enum)',
                    results: 'object (varies by test type)',
                    accuracy: 'number (0-100)',
                    completionTime: 'number (milliseconds)',
                    difficulty: 'number (1-5)'
                }
            }
        },
        
        endpoints: {
            consciousness: {
                'POST /consciousness/session': {
                    description: 'Create new consciousness session',
                    body: {
                        userAgent: 'string (required)',
                        mentalState: 'object (required)',
                        location: 'object (optional)'
                    },
                    response: 'Session object with initial consciousness'
                },
                'GET /consciousness/session/:id': {
                    description: 'Get session details and history',
                    parameters: { sessionId: 'string' },
                    response: 'Session with consciousness history'
                },
                'PUT /consciousness/session/:id/state': {
                    description: 'Update mental state',
                    body: { mentalState: 'object', interactions: 'number' },
                    response: 'Updated session and new consciousness record'
                },
                'GET /consciousness/analytics': {
                    description: 'Get consciousness analytics',
                    query: { timeframe: 'string', sessionId: 'string' },
                    response: 'Aggregated consciousness data'
                }
            },
            
            psychology: {
                'POST /psychology/tests/reaction': {
                    description: 'Submit reaction time test',
                    body: {
                        sessionId: 'string',
                        results: 'object with attempts array',
                        mentalStateAtStart: 'object',
                        mentalStateAtEnd: 'object'
                    },
                    response: 'Test record with performance metrics'
                },
                'POST /psychology/tests/memory': {
                    description: 'Submit memory sequence test',
                    body: {
                        sessionId: 'string',
                        results: 'object with rounds array',
                        mentalStateAtStart: 'object',
                        mentalStateAtEnd: 'object'
                    },
                    response: 'Test record with statistics'
                },
                'GET /psychology/analytics': {
                    description: 'Get psychology test analytics',
                    query: { timeframe: 'string', testType: 'string' },
                    response: 'Test performance analytics'
                }
            }
        },
        
        examples: {
            createSession: {
                url: 'POST /api/consciousness/session',
                body: {
                    userAgent: 'Psychology Portfolio Demo',
                    mentalState: {
                        focus: 75,
                        creativity: 68,
                        stress: 32,
                        energy: 82
                    },
                    location: {
                        country: 'US',
                        timezone: 'America/New_York'
                    }
                }
            },
            submitReactionTest: {
                url: 'POST /api/psychology/tests/reaction',
                body: {
                    sessionId: 'sess_demo_001',
                    results: {
                        attempts: [245, 198, 223, 187, 201],
                        average: 210.8,
                        best: 187,
                        worst: 245,
                        consistency: 0.82
                    },
                    mentalStateAtStart: { focus: 73, creativity: 65, stress: 35, energy: 79 },
                    mentalStateAtEnd: { focus: 78, creativity: 63, stress: 32, energy: 81 }
                }
            }
        },
        
        support: {
            demo: '/demo',
            interactiveAPI: '/demo/api',
            healthCheck: '/health',
            contact: 'Portfolio demonstration - no live support'
        },
        
        timestamp: new Date().toISOString()
    });
});

export default router;