// fullstack-psychology/backend/routes/psychology.js - Psychology Tests API Routes
import express from 'express';
import { 
    validatePsychologyTest,
    validateTestType,
    validateSessionExists,
    validateAnalyticsQuery,
    validatePagination
} from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errors.js';
import PsychologyTest from '../models/PsychologyTest.js';
import Session from '../models/Session.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper function to calculate test difficulty based on results
const calculateDynamicDifficulty = (testType, results, accuracy) => {
    let difficulty = 3; // Default medium difficulty
    
    switch (testType) {
        case 'reaction_time':
            const avgReaction = results.average;
            if (avgReaction < 200) difficulty = 5;
            else if (avgReaction < 250) difficulty = 4;
            else if (avgReaction < 350) difficulty = 3;
            else if (avgReaction < 450) difficulty = 2;
            else difficulty = 1;
            break;
            
        case 'memory_sequence':
            const maxSequence = results.maxSequence;
            if (maxSequence >= 8) difficulty = 5;
            else if (maxSequence >= 6) difficulty = 4;
            else if (maxSequence >= 4) difficulty = 3;
            else if (maxSequence >= 3) difficulty = 2;
            else difficulty = 1;
            break;
            
        case 'color_perception':
            if (accuracy >= 90) difficulty = 5;
            else if (accuracy >= 75) difficulty = 4;
            else if (accuracy >= 60) difficulty = 3;
            else if (accuracy >= 40) difficulty = 2;
            else difficulty = 1;
            break;
    }
    
    return difficulty;
};

// Helper function to update session performance
const updateSessionPerformance = async (sessionId, testAccuracy) => {
    try {
        const session = await Session.findOne({ sessionId });
        if (!session) return;
        
        session.totalTests += 1;
        
        // Calculate new average performance
        if (session.avgPerformance === null) {
            session.avgPerformance = testAccuracy;
        } else {
            session.avgPerformance = (
                (session.avgPerformance * (session.totalTests - 1)) + testAccuracy
            ) / session.totalTests;
        }
        
        await session.save();
        
        logger.psychology('session_performance_updated', sessionId, {
            totalTests: session.totalTests,
            avgPerformance: session.avgPerformance,
            latestAccuracy: testAccuracy
        });
    } catch (error) {
        logger.error('Failed to update session performance:', error);
    }
};

// POST /api/psychology/tests/reaction - Submit reaction time test
router.post('/tests/reaction', validatePsychologyTest, asyncHandler(async (req, res) => {
    const testData = req.body;
    
    // Verify session exists
    const session = await Session.findOne({ sessionId: testData.sessionId });
    if (!session) {
        return res.status(404).json({
            error: 'Session not found',
            sessionId: testData.sessionId
        });
    }
    
    // Calculate accuracy and performance metrics
    const attempts = testData.results.attempts;
    const average = attempts.reduce((a, b) => a + b, 0) / attempts.length;
    const variance = attempts.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / attempts.length;
    const consistency = Math.max(0, 1 - (Math.sqrt(variance) / average));
    
    // Update results with calculated values
    testData.results.average = Math.round(average);
    testData.results.consistency = Math.round(consistency * 100) / 100;
    
    // Calculate accuracy based on consistency and speed
    const speedScore = Math.max(0, Math.min(100, (500 - average) / 3));
    const consistencyScore = consistency * 100;
    testData.accuracy = Math.round((speedScore * 0.4 + consistencyScore * 0.6));
    
    // Set completion time
    testData.completionTime = attempts.length * 3000; // Estimated time
    
    // Calculate dynamic difficulty
    testData.difficulty = calculateDynamicDifficulty('reaction_time', testData.results, testData.accuracy);
    
    // Create test record
    const test = new PsychologyTest({
        ...testData,
        testType: 'reaction_time'
    });
    
    await test.save();
    await updateSessionPerformance(testData.sessionId, testData.accuracy);
    
    logger.psychology('reaction_test_completed', testData.sessionId, {
        average: testData.results.average,
        consistency: consistency,
        accuracy: testData.accuracy,
        difficulty: testData.difficulty
    });
    
    res.status(201).json({
        message: 'Reaction time test recorded successfully',
        test: test.toJSON(),
        performance: {
            score: test.performanceScore,
            efficiency: test.efficiency,
            mentalStateChange: test.mentalStateChange
        },
        timestamp: new Date().toISOString()
    });
}));

// POST /api/psychology/tests/memory - Submit memory sequence test
router.post('/tests/memory', validatePsychologyTest, asyncHandler(async (req, res) => {
    const testData = req.body;
    
    // Verify session exists
    const session = await Session.findOne({ sessionId: testData.sessionId });
    if (!session) {
        return res.status(404).json({
            error: 'Session not found',
            sessionId: testData.sessionId
        });
    }
    
    // Calculate completion time from rounds
    const totalTime = testData.results.rounds.reduce((sum, round) => sum + round.time, 0);
    testData.completionTime = totalTime;
    
    // Accuracy is already calculated in the model pre-save hook
    
    // Calculate dynamic difficulty
    testData.difficulty = calculateDynamicDifficulty('memory_sequence', testData.results, testData.accuracy);
    
    // Create test record
    const test = new PsychologyTest({
        ...testData,
        testType: 'memory_sequence'
    });
    
    await test.save();
    await updateSessionPerformance(testData.sessionId, testData.accuracy);
    
    // Get memory statistics
    const memoryStats = test.getMemoryStats();
    
    logger.psychology('memory_test_completed', testData.sessionId, {
        maxSequence: testData.results.maxSequence,
        accuracy: testData.accuracy,
        rounds: testData.results.rounds.length,
        difficulty: testData.difficulty
    });
    
    res.status(201).json({
        message: 'Memory sequence test recorded successfully',
        test: test.toJSON(),
        statistics: memoryStats,
        performance: {
            score: test.performanceScore,
            efficiency: test.efficiency,
            mentalStateChange: test.mentalStateChange
        },
        timestamp: new Date().toISOString()
    });
}));

// POST /api/psychology/tests/color - Submit color perception test
router.post('/tests/color', validatePsychologyTest, asyncHandler(async (req, res) => {
    const testData = req.body;
    
    // Verify session exists
    const session = await Session.findOne({ sessionId: testData.sessionId });
    if (!session) {
        return res.status(404).json({
            error: 'Session not found',
            sessionId: testData.sessionId
        });
    }
    
    // Calculate completion time from individual tests
    const totalTime = testData.results.tests.reduce((sum, test) => sum + test.responseTime, 0);
    testData.completionTime = totalTime;
    
    // Accuracy is already calculated in the model pre-save hook
    
    // Calculate dynamic difficulty
    testData.difficulty = calculateDynamicDifficulty('color_perception', testData.results, testData.accuracy);
    
    // Create test record
    const test = new PsychologyTest({
        ...testData,
        testType: 'color_perception'
    });
    
    await test.save();
    await updateSessionPerformance(testData.sessionId, testData.accuracy);
    
    logger.psychology('color_test_completed', testData.sessionId, {
        accuracy: testData.accuracy,
        totalTests: testData.results.totalTests,
        sensitivity: testData.results.sensitivityThreshold,
        difficulty: testData.difficulty
    });
    
    res.status(201).json({
        message: 'Color perception test recorded successfully',
        test: test.toJSON(),
        performance: {
            score: test.performanceScore,
            efficiency: test.efficiency,
            mentalStateChange: test.mentalStateChange
        },
        timestamp: new Date().toISOString()
    });
}));

// GET /api/psychology/tests/:testType - Get tests by type
router.get('/tests/:testType', 
    validateTestType,
    validatePagination,
    asyncHandler(async (req, res) => {
        const { testType } = req.params;
        const { page = 1, limit = 20, sort = 'timestamp', order = 'desc' } = req.query;
        
        const sortOrder = order === 'asc' ? 1 : -1;
        const sortField = {};
        sortField[sort] = sortOrder;
        
        const skip = (page - 1) * limit;
        
        const tests = await PsychologyTest.find({ testType })
            .sort(sortField)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');
        
        const totalTests = await PsychologyTest.countDocuments({ testType });
        const totalPages = Math.ceil(totalTests / limit);
        
        res.json({
            tests: tests.map(test => test.toJSON()),
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalTests,
                limit: parseInt(limit),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            sorting: { sort, order },
            timestamp: new Date().toISOString()
        });
    })
);

// GET /api/psychology/session/:sessionId/tests - Get all tests for a session
router.get('/session/:sessionId/tests',
    validateSessionExists,
    asyncHandler(async (req, res) => {
        const { sessionId } = req.params;
        
        const tests = await PsychologyTest.findBySession(sessionId);
        
        // Calculate session test summary
        const summary = {
            totalTests: tests.length,
            testTypes: [...new Set(tests.map(t => t.testType))],
            averageAccuracy: tests.length > 0 ? 
                Math.round(tests.reduce((sum, t) => sum + t.accuracy, 0) / tests.length) : 0,
            totalTestTime: tests.reduce((sum, t) => sum + t.completionTime, 0),
            performanceProgression: tests.map(t => ({
                timestamp: t.timestamp,
                testType: t.testType,
                accuracy: t.accuracy,
                performanceScore: t.performanceScore
            }))
        };
        
        res.json({
            tests: tests.map(test => test.toJSON()),
            summary,
            sessionId,
            timestamp: new Date().toISOString()
        });
    })
);

// GET /api/psychology/leaderboard/:testType - Get leaderboard for test type
router.get('/leaderboard/:testType',
    validateTestType,
    asyncHandler(async (req, res) => {
        const { testType } = req.params;
        const { metric = 'accuracy', limit = 10 } = req.query;
        
        const validMetrics = ['accuracy', 'completionTime'];
        if (!validMetrics.includes(metric)) {
            return res.status(400).json({
                error: 'Invalid metric',
                validMetrics,
                received: metric
            });
        }
        
        const leaderboard = await PsychologyTest.getLeaderboard(testType, metric, parseInt(limit));
        
        res.json({
            leaderboard: leaderboard.map((test, index) => ({
                rank: index + 1,
                sessionId: test.sessionId,
                accuracy: test.accuracy,
                completionTime: test.completionTime,
                difficulty: test.difficulty,
                timestamp: test.timestamp,
                performance: {
                    score: test.performanceScore,
                    efficiency: test.efficiency
                }
            })),
            testType,
            metric,
            limit: parseInt(limit),
            timestamp: new Date().toISOString()
        });
    })
);

// GET /api/psychology/improvement/:sessionId/:testType - Get improvement trend
router.get('/improvement/:sessionId/:testType',
    validateTestType,
    asyncHandler(async (req, res) => {
        const { sessionId, testType } = req.params;
        
        const tests = await PsychologyTest.getImprovementTrend(sessionId, testType);
        
        if (tests.length === 0) {
            return res.json({
                trend: 'no_data',
                tests: [],
                analysis: 'No test data available for analysis',
                sessionId,
                testType
            });
        }
        
        // Calculate improvement metrics
        const first = tests[0];
        const last = tests[tests.length - 1];
        
        const accuracyImprovement = last.accuracy - first.accuracy;
        const timeImprovement = first.completionTime - last.completionTime;
        
        let trend = 'stable';
        if (accuracyImprovement > 10 || timeImprovement > 1000) {
            trend = 'improving';
        } else if (accuracyImprovement < -10 || timeImprovement < -1000) {
            trend = 'declining';
        }
        
        const analysis = {
            accuracyChange: accuracyImprovement,
            timeChange: timeImprovement,
            testCount: tests.length,
            timeSpan: last.timestamp - first.timestamp,
            consistencyScore: tests.length > 2 ? 
                1 - (Math.abs(accuracyImprovement) / tests.length) / 100 : null
        };
        
        res.json({
            trend,
            tests: tests.map(test => test.toJSON()),
            analysis,
            sessionId,
            testType,
            timestamp: new Date().toISOString()
        });
    })
);

// GET /api/psychology/analytics - Get psychology test analytics
router.get('/analytics', 
    validateAnalyticsQuery,
    asyncHandler(async (req, res) => {
        const { timeframe = '24h', testType } = req.query;
        
        try {
            const analytics = await PsychologyTest.getTestAnalytics(testType, timeframe);
            
            // Get additional insights
            const totalTests = await PsychologyTest.countDocuments(
                testType ? { testType } : {}
            );
            
            // Calculate global statistics
            const globalStats = {
                totalTests,
                analyticsTimeframe: timeframe,
                testTypeFilter: testType || 'all'
            };
            
            res.json({
                analytics,
                globalStats,
                query: { timeframe, testType },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Psychology analytics query failed:', error);
            throw error;
        }
    })
);

// GET /api/psychology/stats/overview - Get comprehensive overview
router.get('/stats/overview', asyncHandler(async (req, res) => {
    try {
        // Get counts for each test type
        const testTypeCounts = await PsychologyTest.aggregate([
            {
                $group: {
                    _id: '$testType',
                    count: { $sum: 1 },
                    avgAccuracy: { $avg: '$accuracy' },
                    avgCompletionTime: { $avg: '$completionTime' }
                }
            },
            {
                $project: {
                    testType: '$_id',
                    _id: 0,
                    count: 1,
                    avgAccuracy: { $round: ['$avgAccuracy', 1] },
                    avgCompletionTime: { $round: ['$avgCompletionTime', 0] }
                }
            }
        ]);
        
        // Get recent activity (last 24 hours)
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentActivity = await PsychologyTest.countDocuments({
            timestamp: { $gte: last24Hours }
        });
        
        // Get top performers
        const topPerformers = await PsychologyTest.aggregate([
            {
                $group: {
                    _id: '$sessionId',
                    avgAccuracy: { $avg: '$accuracy' },
                    testCount: { $sum: 1 }
                }
            },
            {
                $match: { testCount: { $gte: 2 } }
            },
            {
                $sort: { avgAccuracy: -1 }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    sessionId: '$_id',
                    _id: 0,
                    avgAccuracy: { $round: ['$avgAccuracy', 1] },
                    testCount: 1
                }
            }
        ]);
        
        res.json({
            overview: {
                testTypes: testTypeCounts,
                recentActivity: {
                    last24Hours: recentActivity
                },
                topPerformers
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Psychology overview stats failed:', error);
        throw error;
    }
}));

export default router;