// fullstack-psychology/backend/routes/consciousness.js - Consciousness API Routes
import express from 'express';
import { 
    validateCreateSession, 
    validateUpdateSession, 
    validateConsciousness,
    validateSessionId,
    validateSessionExists 
} from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errors.js';
import Session from '../models/Session.js';
import Consciousness from '../models/Consciousness.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Generate unique session ID
const generateSessionId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `sess_${timestamp}_${random}`;
};

// Determine time of day from timestamp
const getTimeOfDay = (timestamp = new Date()) => {
    const hour = new Date(timestamp).getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
};

// Calculate session progress
const calculateSessionProgress = (session) => {
    if (!session.startTime) return 0;
    
    const now = Date.now();
    const elapsed = now - session.startTime.getTime();
    const maxDuration = 30 * 60 * 1000; // 30 minutes max session
    
    return Math.min(1, elapsed / maxDuration);
};

// POST /api/consciousness/session - Create new consciousness session
router.post('/session', validateCreateSession, asyncHandler(async (req, res) => {
    const { sessionId: providedSessionId, userAgent, mentalState, location } = req.body;
    
    // Generate session ID if not provided
    const sessionId = providedSessionId || generateSessionId();
    
    // Check if session already exists
    const existingSession = await Session.findOne({ sessionId });
    if (existingSession) {
        return res.status(409).json({
            error: 'Session already exists',
            sessionId,
            existingSession: existingSession.toJSON()
        });
    }
    
    // Create new session
    const session = new Session({
        sessionId,
        userAgent,
        mentalState,
        location: location || {}
    });
    
    await session.save();
    
    // Create initial consciousness record
    const consciousness = new Consciousness({
        sessionId,
        mentalState,
        brainwaves: {
            alpha: 8 + Math.random() * 4,   // 8-12 Hz
            beta: 13 + Math.random() * 12,  // 13-25 Hz
            theta: 4 + Math.random() * 4,   // 4-8 Hz
            gamma: 30 + Math.random() * 20, // 30-50 Hz
            delta: 1 + Math.random() * 2    // 1-3 Hz
        },
        cognitiveLoad: Math.round((100 - mentalState.focus + mentalState.stress) / 2),
        attentionLevel: Math.round((mentalState.focus + mentalState.energy) / 2),
        environmentalFactors: {
            timeOfDay: getTimeOfDay(),
            sessionProgress: 0
        }
    });
    
    await consciousness.save();
    
    logger.psychology('session_created', sessionId, {
        mentalState,
        userAgent: userAgent.substring(0, 50)
    });
    
    res.status(201).json({
        message: 'Session created successfully',
        session: session.toJSON(),
        initialConsciousness: consciousness.toJSON(),
        timestamp: new Date().toISOString()
    });
}));

// GET /api/consciousness/session/:sessionId - Get session details
router.get('/session/:sessionId', 
    validateSessionId, 
    validateSessionExists,
    asyncHandler(async (req, res) => {
        const session = req.session;
        
        // Get latest consciousness data
        const latestConsciousness = await Consciousness.getLatest(session.sessionId);
        
        // Get consciousness history (last 20 records)
        const consciousnessHistory = await Consciousness.findBySession(session.sessionId, 20);
        
        // Calculate session statistics
        const sessionStats = {
            duration: session.calculatedDuration,
            status: session.status,
            mentalBalance: session.mentalBalance,
            interactions: session.interactions,
            consciousnessRecords: consciousnessHistory.length
        };
        
        res.json({
            session: session.toJSON(),
            latestConsciousness: latestConsciousness?.toJSON() || null,
            consciousnessHistory: consciousnessHistory.map(c => c.toJSON()),
            statistics: sessionStats,
            timestamp: new Date().toISOString()
        });
    })
);

// PUT /api/consciousness/session/:sessionId/state - Update mental state
router.put('/session/:sessionId/state',
    validateSessionId,
    validateUpdateSession,
    validateSessionExists,
    asyncHandler(async (req, res) => {
        const session = req.session;
        const { mentalState, interactions } = req.body;
        
        // Update session
        if (mentalState) {
            await session.updateMentalState(mentalState);
        }
        
        if (typeof interactions === 'number') {
            session.interactions = interactions;
            await session.save();
        }
        
        // Create new consciousness record if mental state updated
        if (mentalState) {
            // Calculate new brainwaves based on mental state
            const { focus, creativity, stress, energy } = mentalState;
            
            const consciousness = new Consciousness({
                sessionId: session.sessionId,
                mentalState,
                brainwaves: {
                    alpha: 8 + (creativity / 100) * 5,
                    beta: 13 + (focus / 100) * 17,
                    theta: 4 + ((100 - stress) / 100) * 4,
                    gamma: 30 + ((focus + creativity) / 200) * 70,
                    delta: 1 + Math.random() * 2
                },
                cognitiveLoad: Math.round((100 - focus + stress) / 2),
                attentionLevel: Math.round((focus + energy) / 2),
                environmentalFactors: {
                    timeOfDay: getTimeOfDay(),
                    sessionProgress: calculateSessionProgress(session)
                }
            });
            
            await consciousness.save();
            
            logger.psychology('mental_state_updated', session.sessionId, {
                mentalState,
                cognitiveLoad: consciousness.cognitiveLoad,
                emotionalState: consciousness.emotionalState
            });
            
            res.json({
                message: 'Mental state updated successfully',
                session: session.toJSON(),
                consciousness: consciousness.toJSON(),
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({
                message: 'Session updated successfully',
                session: session.toJSON(),
                timestamp: new Date().toISOString()
            });
        }
    })
);

// POST /api/consciousness/session/:sessionId/end - End session
router.post('/session/:sessionId/end',
    validateSessionId,
    validateSessionExists,
    asyncHandler(async (req, res) => {
        const session = req.session;
        
        if (session.endTime) {
            return res.status(400).json({
                error: 'Session already ended',
                endTime: session.endTime
            });
        }
        
        await session.endSession();
        
        // Get final session statistics
        const consciousnessRecords = await Consciousness.findBySession(session.sessionId);
        const analytics = await Consciousness.getAnalytics(session.sessionId);
        
        logger.psychology('session_ended', session.sessionId, {
            duration: session.duration,
            interactions: session.interactions,
            consciousnessRecords: consciousnessRecords.length
        });
        
        res.json({
            message: 'Session ended successfully',
            session: session.toJSON(),
            analytics: analytics[0] || {},
            timestamp: new Date().toISOString()
        });
    })
);

// GET /api/consciousness/session/:sessionId/brainwaves - Get brainwave data
router.get('/session/:sessionId/brainwaves',
    validateSessionId,
    validateSessionExists,
    asyncHandler(async (req, res) => {
        const { sessionId } = req.params;
        const { limit = 50, timeframe } = req.query;
        
        let query = { sessionId };
        
        // Add time filter if specified
        if (timeframe) {
            const now = new Date();
            let startTime;
            
            switch (timeframe) {
                case '5m':
                    startTime = new Date(now.getTime() - 5 * 60 * 1000);
                    break;
                case '15m':
                    startTime = new Date(now.getTime() - 15 * 60 * 1000);
                    break;
                case '1h':
                    startTime = new Date(now.getTime() - 60 * 60 * 1000);
                    break;
                default:
                    startTime = new Date(now.getTime() - 15 * 60 * 1000);
            }
            
            query.timestamp = { $gte: startTime };
        }
        
        const brainwaveData = await Consciousness.find(query)
            .select('timestamp brainwaves emotionalState cognitiveLoad attentionLevel')
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));
        
        // Calculate brainwave statistics
        const stats = {
            recordCount: brainwaveData.length,
            timeSpan: brainwaveData.length > 0 ? {
                start: brainwaveData[brainwaveData.length - 1].timestamp,
                end: brainwaveData[0].timestamp
            } : null
        };
        
        if (brainwaveData.length > 0) {
            const avgBrainwaves = brainwaveData.reduce((acc, record) => {
                Object.keys(record.brainwaves).forEach(wave => {
                    acc[wave] = (acc[wave] || 0) + record.brainwaves[wave];
                });
                return acc;
            }, {});
            
            Object.keys(avgBrainwaves).forEach(wave => {
                avgBrainwaves[wave] = Math.round((avgBrainwaves[wave] / brainwaveData.length) * 10) / 10;
            });
            
            stats.averageBrainwaves = avgBrainwaves;
        }
        
        res.json({
            brainwaveData: brainwaveData.map(record => record.toJSON()),
            statistics: stats,
            query: {
                sessionId,
                limit: parseInt(limit),
                timeframe
            },
            timestamp: new Date().toISOString()
        });
    })
);

// POST /api/consciousness/record - Create consciousness record
router.post('/record', 
    validateConsciousness,
    asyncHandler(async (req, res) => {
        const consciousnessData = req.body;
        
        // Verify session exists
        const session = await Session.findOne({ sessionId: consciousnessData.sessionId });
        if (!session) {
            return res.status(404).json({
                error: 'Session not found',
                sessionId: consciousnessData.sessionId
            });
        }
        
        // Add environmental factors if not provided
        if (!consciousnessData.environmentalFactors) {
            consciousnessData.environmentalFactors = {
                timeOfDay: getTimeOfDay(),
                sessionProgress: calculateSessionProgress(session)
            };
        }
        
        const consciousness = new Consciousness(consciousnessData);
        await consciousness.save();
        
        logger.psychology('consciousness_recorded', consciousnessData.sessionId, {
            emotionalState: consciousness.emotionalState,
            mentalBalance: consciousness.mentalBalance,
            dominantBrainwave: consciousness.dominantBrainwave
        });
        
        res.status(201).json({
            message: 'Consciousness record created successfully',
            consciousness: consciousness.toJSON(),
            timestamp: new Date().toISOString()
        });
    })
);

// GET /api/consciousness/analytics - Get consciousness analytics
router.get('/analytics', asyncHandler(async (req, res) => {
    const { timeframe = '24h', sessionId } = req.query;
    
    try {
        const analytics = await Consciousness.getAnalytics(sessionId, timeframe);
        const sessionAnalytics = await Session.getAnalytics(timeframe);
        
        res.json({
            consciousness: analytics[0] || {},
            sessions: sessionAnalytics[0] || {},
            timeframe,
            sessionId: sessionId || 'all',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Analytics query failed:', error);
        throw error;
    }
}));

export default router;