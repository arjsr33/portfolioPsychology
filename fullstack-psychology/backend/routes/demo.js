// fullstack-psychology/backend/routes/demo.js - Demo Routes for Backend Showcase
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { asyncHandler } from '../middleware/errors.js';
import { checkDatabaseHealth, getDatabaseStats } from '../config/database.js';
import Session from '../models/Session.js';
import Consciousness from '../models/Consciousness.js';
import PsychologyTest from '../models/PsychologyTest.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// GET /demo - Main demo page
router.get('/', (req, res) => {
    const demoHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Psychology Backend Demo - Node.js + MongoDB Showcase</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            line-height: 1.6;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .hero {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            margin-bottom: 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .hero h1 {
            color: white;
            font-size: 2.5rem;
            margin-bottom: 20px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .hero p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 1.2rem;
            margin-bottom: 30px;
        }
        
        .demo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .demo-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .demo-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .demo-card h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.5rem;
        }
        
        .demo-card p {
            color: #666;
            margin-bottom: 20px;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            color: white;
            text-decoration: none;
        }
        
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 30px 0;
        }
        
        .status-item {
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        
        .status-item h4 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .status-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #667eea;
        }
        
        .endpoints {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 15px;
            padding: 30px;
            margin: 20px 0;
        }
        
        .endpoints h3 {
            margin-bottom: 20px;
            color: #333;
        }
        
        .endpoint-list {
            display: grid;
            gap: 10px;
        }
        
        .endpoint {
            display: flex;
            align-items: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .method {
            background: #667eea;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-right: 10px;
            min-width: 50px;
            text-align: center;
        }
        
        .method.post { background: #28a745; }
        .method.put { background: #ffc107; color: #333; }
        .method.delete { background: #dc3545; }
        
        .path {
            font-family: 'Courier New', monospace;
            flex-grow: 1;
        }
        
        .description {
            color: #666;
            font-size: 0.9rem;
            margin-left: 10px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            color: rgba(255, 255, 255, 0.8);
        }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .demo-grid { grid-template-columns: 1fr; }
            .container { padding: 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>🧠 Psychology Backend Demo</h1>
            <p>Live demonstration of Node.js + Express + MongoDB backend capabilities</p>
            <p><strong>Full-Stack Portfolio Showcase</strong></p>
        </div>
        
        <div id="status" class="status-grid">
            <div class="status-item">
                <h4>Server Status</h4>
                <div class="status-value" id="server-status">Loading...</div>
            </div>
            <div class="status-item">
                <h4>Database</h4>
                <div class="status-value" id="db-status">Loading...</div>
            </div>
            <div class="status-item">
                <h4>Total Sessions</h4>
                <div class="status-value" id="total-sessions">Loading...</div>
            </div>
            <div class="status-item">
                <h4>Total Tests</h4>
                <div class="status-value" id="total-tests">Loading...</div>
            </div>
        </div>
        
        <div class="demo-grid">
            <div class="demo-card">
                <h3>🔍 API Explorer</h3>
                <p>Interactive testing of all API endpoints with live request/response examples</p>
                <a href="/demo/api" class="btn">Explore APIs</a>
            </div>
            
            <div class="demo-card">
                <h3>📊 Database Monitor</h3>
                <p>Live MongoDB operations, collections stats, and query demonstrations</p>
                <a href="/demo/database" class="btn">View Database</a>
            </div>
            
            <div class="demo-card">
                <h3>🧠 Psychology Engine</h3>
                <p>Algorithm demonstrations, consciousness calculations, and brainwave simulations</p>
                <a href="/demo/psychology" class="btn">See Algorithms</a>
            </div>
            
            <div class="demo-card">
                <h3>📈 Analytics Dashboard</h3>
                <p>Real-time analytics, performance metrics, and data visualization</p>
                <a href="/demo/analytics" class="btn">View Analytics</a>
            </div>
        </div>
        
        <div class="endpoints">
            <h3>🚀 Available API Endpoints</h3>
            <div class="endpoint-list">
                <div class="endpoint">
                    <span class="method">GET</span>
                    <span class="path">/health</span>
                    <span class="description">Server health check</span>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="path">/api/consciousness/session</span>
                    <span class="description">Create new consciousness session</span>
                </div>
                <div class="endpoint">
                    <span class="method">GET</span>
                    <span class="path">/api/consciousness/session/:id</span>
                    <span class="description">Get session details</span>
                </div>
                <div class="endpoint">
                    <span class="method put">PUT</span>
                    <span class="path">/api/consciousness/session/:id/state</span>
                    <span class="description">Update mental state</span>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="path">/api/psychology/tests/reaction</span>
                    <span class="description">Submit reaction time test</span>
                </div>
                <div class="endpoint">
                    <span class="method">GET</span>
                    <span class="path">/api/psychology/analytics</span>
                    <span class="description">Get psychology analytics</span>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Backend powered by Node.js + Express + MongoDB | Psychology algorithms in action</p>
            <p>Portfolio demonstration of full-stack development capabilities</p>
        </div>
    </div>
    
    <script>
        // Load status information
        async function loadStatus() {
            try {
                // Server health
                const healthResponse = await fetch('/health');
                const health = await healthResponse.json();
                document.getElementById('server-status').textContent = health.status;
                document.getElementById('db-status').textContent = health.database || 'Connected';
                
                // Get session count
                const sessionsResponse = await fetch('/demo/stats/sessions');
                const sessionStats = await sessionsResponse.json();
                document.getElementById('total-sessions').textContent = sessionStats.totalSessions || '0';
                
                // Get test count
                const testsResponse = await fetch('/demo/stats/tests');
                const testStats = await testsResponse.json();
                document.getElementById('total-tests').textContent = testStats.totalTests || '0';
                
            } catch (error) {
                console.error('Failed to load status:', error);
                document.getElementById('server-status').textContent = 'Error';
                document.getElementById('db-status').textContent = 'Error';
            }
        }
        
        loadStatus();
        
        // Refresh status every 30 seconds
        setInterval(loadStatus, 30000);
    </script>
</body>
</html>`;
    
    res.send(demoHTML);
});

// GET /demo/api - API documentation and testing
router.get('/api', (req, res) => {
    const apiHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Explorer - Psychology Backend</title>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            margin: 0;
            background: #f5f7fa;
            color: #333;
        }
        .header {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .api-section {
            background: white;
            margin: 20px 0;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .api-header {
            background: #667eea;
            color: white;
            padding: 15px 20px;
            font-weight: bold;
        }
        .api-content {
            padding: 20px;
        }
        .endpoint {
            margin: 15px 0;
            padding: 15px;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
        }
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            font-size: 0.8rem;
            margin-right: 10px;
        }
        .method.get { background: #28a745; }
        .method.post { background: #007bff; }
        .method.put { background: #ffc107; color: #333; }
        .method.delete { background: #dc3545; }
        .path {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: #333;
        }
        .description {
            margin: 10px 0;
            color: #666;
        }
        .test-button {
            background: #28a745;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        }
        .test-button:hover {
            background: #218838;
        }
        .response-area {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 15px;
            margin-top: 10px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            max-height: 300px;
            overflow-y: auto;
            display: none;
        }
        .loading {
            color: #007bff;
        }
        .success {
            color: #28a745;
        }
        .error {
            color: #dc3545;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 API Explorer</h1>
        <p>Interactive testing of Psychology Backend APIs</p>
        <a href="/demo" style="color: white;">← Back to Demo</a>
    </div>
    
    <div class="container">
        <div class="api-section">
            <div class="api-header">Health & Status</div>
            <div class="api-content">
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="path">/health</span>
                    <div class="description">Check server health and status</div>
                    <button class="test-button" onclick="testEndpoint('GET', '/health', 'health')">Test</button>
                    <div class="response-area" id="response-health"></div>
                </div>
            </div>
        </div>
        
        <div class="api-section">
            <div class="api-header">Consciousness API</div>
            <div class="api-content">
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="path">/api/consciousness/session</span>
                    <div class="description">Create a new consciousness session</div>
                    <button class="test-button" onclick="testCreateSession()">Test</button>
                    <div class="response-area" id="response-create-session"></div>
                </div>
                
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="path">/api/consciousness/analytics</span>
                    <div class="description">Get consciousness analytics</div>
                    <button class="test-button" onclick="testEndpoint('GET', '/api/consciousness/analytics', 'consciousness-analytics')">Test</button>
                    <div class="response-area" id="response-consciousness-analytics"></div>
                </div>
            </div>
        </div>
        
        <div class="api-section">
            <div class="api-header">Psychology Tests API</div>
            <div class="api-content">
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="path">/api/psychology/analytics</span>
                    <div class="description">Get psychology test analytics</div>
                    <button class="test-button" onclick="testEndpoint('GET', '/api/psychology/analytics', 'psychology-analytics')">Test</button>
                    <div class="response-area" id="response-psychology-analytics"></div>
                </div>
                
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span class="path">/api/psychology/stats/overview</span>
                    <div class="description">Get comprehensive psychology overview</div>
                    <button class="test-button" onclick="testEndpoint('GET', '/api/psychology/stats/overview', 'psychology-overview')">Test</button>
                    <div class="response-area" id="response-psychology-overview"></div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Fixed JavaScript functions
        
        async function testEndpoint(method, path, responseId) {
            const responseArea = document.getElementById('response-' + responseId);
            
            if (!responseArea) {
                console.error('Response area not found for:', responseId);
                return;
            }
            
            responseArea.style.display = 'block';
            responseArea.innerHTML = '<span class="loading">Loading...</span>';
            
            try {
                const options = {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                
                const response = await fetch(path, options);
                const data = await response.json();
                
                const statusClass = response.ok ? 'success' : 'error';
                responseArea.innerHTML = 
                    '<div class="' + statusClass + '">Status: ' + response.status + ' ' + response.statusText + '</div>' +
                    '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                responseArea.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
            }
        }
        
        async function testCreateSession() {
            const sampleSession = {
                userAgent: 'API Explorer Demo',
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
            };
            
            const responseArea = document.getElementById('response-create-session');
            responseArea.style.display = 'block';
            responseArea.innerHTML = '<span class="loading">Creating session...</span>';
            
            try {
                const response = await fetch('/api/consciousness/session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(sampleSession)
                });
                
                const data = await response.json();
                
                const statusClass = response.ok ? 'success' : 'error';
                responseArea.innerHTML = 
                    '<div class="' + statusClass + '">Status: ' + response.status + ' ' + response.statusText + '</div>' +
                    '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                responseArea.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
            }
        }
    </script>
</body>
</html>`;
    
    res.send(apiHTML);
});

// GET /demo/database - Database operations viewer
router.get('/database', asyncHandler(async (req, res) => {
    const dbHealth = await checkDatabaseHealth();
    const dbStats = await getDatabaseStats();
    
    // Get collection counts
    const sessionCount = await Session.countDocuments();
    const consciousnessCount = await Consciousness.countDocuments();
    const testCount = await PsychologyTest.countDocuments();
    
    // Get sample data
    const sampleSession = await Session.findOne().sort({ createdAt: -1 });
    const sampleConsciousness = await Consciousness.findOne().sort({ timestamp: -1 });
    const sampleTest = await PsychologyTest.findOne().sort({ timestamp: -1 });
    
    res.json({
        databaseHealth: dbHealth,
        statistics: dbStats,
        collections: {
            sessions: {
                count: sessionCount,
                sample: sampleSession
            },
            consciousness: {
                count: consciousnessCount,
                sample: sampleConsciousness
            },
            psychology_tests: {
                count: testCount,
                sample: sampleTest
            }
        },
        timestamp: new Date().toISOString()
    });
}));

// GET /demo/psychology - Psychology algorithms demonstration
router.get('/psychology', asyncHandler(async (req, res) => {
    // Demonstrate consciousness calculation
    const sampleMentalState = {
        focus: 75,
        creativity: 68,
        stress: 32,
        energy: 82
    };
    
    const sampleBrainwaves = {
        alpha: 10.2,
        beta: 22.5,
        theta: 6.8,
        gamma: 42.1,
        delta: 2.3
    };
    
    const consciousnessScore = Consciousness.calculateConsciousnessScore(
        sampleMentalState, 
        sampleBrainwaves
    );
    
    // Get recent test analytics
    const recentAnalytics = await PsychologyTest.getTestAnalytics(null, '24h');
    
    // Demonstrate brainwave calculations
    const brainwaveDemo = {
        input: sampleMentalState,
        calculations: {
            alpha: `8 + (creativity/100) * 5 = 8 + (${sampleMentalState.creativity}/100) * 5 = ${8 + (sampleMentalState.creativity/100) * 5}`,
            beta: `13 + (focus/100) * 17 = 13 + (${sampleMentalState.focus}/100) * 17 = ${13 + (sampleMentalState.focus/100) * 17}`,
            theta: `4 + ((100-stress)/100) * 4 = 4 + ((100-${sampleMentalState.stress})/100) * 4 = ${4 + ((100-sampleMentalState.stress)/100) * 4}`,
            gamma: `30 + ((focus+creativity)/200) * 70 = 30 + ((${sampleMentalState.focus}+${sampleMentalState.creativity})/200) * 70 = ${30 + ((sampleMentalState.focus+sampleMentalState.creativity)/200) * 70}`
        },
        result: sampleBrainwaves
    };
    
    res.json({
        algorithms: {
            consciousnessCalculation: {
                input: { mentalState: sampleMentalState, brainwaves: sampleBrainwaves },
                score: consciousnessScore,
                explanation: "Combines mental state (70%) and brainwave optimization (30%)"
            },
            brainwaveGeneration: brainwaveDemo,
            emotionalStateMapping: {
                rules: [
                    "focus > 80 && creativity > 80 && stress < 30 → peak_performance",
                    "focus > 70 && creativity > 70 && stress < 40 → flow_state",
                    "creativity > 80 && stress < 40 → highly_creative",
                    "stress > 70 → overwhelmed"
                ],
                example: {
                    input: sampleMentalState,
                    result: "focused_creative"
                }
            }
        },
        recentAnalytics,
        timestamp: new Date().toISOString()
    });
}));

// GET /demo/analytics - Analytics dashboard
router.get('/analytics', asyncHandler(async (req, res) => {
    // Get comprehensive analytics
    const sessionAnalytics = await Session.getAnalytics('24h');
    const consciousnessAnalytics = await Consciousness.getAnalytics(null, '24h');
    const psychologyAnalytics = await PsychologyTest.getTestAnalytics(null, '24h');
    
    // Get trend data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const daySessions = await Session.countDocuments({
            createdAt: { $gte: dayStart, $lte: dayEnd }
        });
        
        const dayTests = await PsychologyTest.countDocuments({
            timestamp: { $gte: dayStart, $lte: dayEnd }
        });
        
        last7Days.push({
            date: dayStart.toISOString().split('T')[0],
            sessions: daySessions,
            tests: dayTests
        });
    }
    
    res.json({
        analytics: {
            sessions: sessionAnalytics[0] || {},
            consciousness: consciousnessAnalytics[0] || {},
            psychology: psychologyAnalytics
        },
        trends: {
            last7Days
        },
        realTime: {
            activeSessions: await Session.countDocuments({ endTime: null }),
            todaysSessions: await Session.countDocuments({
                createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
            }),
            todaysTests: await PsychologyTest.countDocuments({
                timestamp: { $gte: new Date().setHours(0, 0, 0, 0) }
            })
        },
        timestamp: new Date().toISOString()
    });
}));

// GET /demo/stats/sessions - Session statistics
router.get('/stats/sessions', asyncHandler(async (req, res) => {
    const totalSessions = await Session.countDocuments();
    const activeSessions = await Session.countDocuments({ endTime: null });
    const todaySessions = await Session.countDocuments({
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    
    res.json({
        totalSessions,
        activeSessions,
        todaySessions,
        timestamp: new Date().toISOString()
    });
}));

// GET /demo/stats/tests - Test statistics
router.get('/stats/tests', asyncHandler(async (req, res) => {
    const totalTests = await PsychologyTest.countDocuments();
    const todayTests = await PsychologyTest.countDocuments({
        timestamp: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    
    const testsByType = await PsychologyTest.aggregate([
        {
            $group: {
                _id: '$testType',
                count: { $sum: 1 }
            }
        }
    ]);
    
    res.json({
        totalTests,
        todayTests,
        testsByType,
        timestamp: new Date().toISOString()
    });
}));

// GET /demo/health - Comprehensive health check
router.get('/health', asyncHandler(async (req, res) => {
    const dbHealth = await checkDatabaseHealth();
    const dbStats = await getDatabaseStats();
    
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
        },
        database: dbHealth,
        collections: dbStats.collections || {},
        apis: {
            consciousness: '/api/consciousness',
            psychology: '/api/psychology',
            demo: '/demo'
        }
    };
    
    res.json(health);
}));

// Error handling for demo routes
router.use((error, req, res, next) => {
    logger.error('Demo route error:', error);
    
    res.status(500).json({
        error: 'Demo functionality error',
        message: error.message,
        timestamp: new Date().toISOString()
    });
});

export default router;