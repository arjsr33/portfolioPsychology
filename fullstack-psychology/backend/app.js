// fullstack-psychology/backend/app.js - Main Express Server
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import configurations and middleware
import { connectDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { validateRequest } from './middleware/validation.js';
import logger from './utils/logger.js';

// Import routes
import apiRoutes from './routes/api.js';
import consciousnessRoutes from './routes/consciousness.js';
import psychologyRoutes from './routes/psychology.js';
import demoRoutes from './routes/demo.js';

// ES module dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for accurate client IPs (important for rate limiting)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
            scriptSrcAttr: ["'unsafe-inline'"], // FIX: Allow inline event handlers
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://psychology-portfolio.vercel.app', 'https://psychology-demo.netlify.app']
        : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health checks and demo routes in development
        return process.env.NODE_ENV !== 'production' && 
               (req.path === '/health' || req.path.startsWith('/demo'));
    }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined', {
        stream: { write: (message) => logger.info(message.trim()) }
    }));
} else {
    app.use(morgan('dev'));
}

// Static files for demo
app.use('/demo/assets', express.static(path.join(__dirname, 'public', 'assets')));

// Health check endpoint
app.get('/health', (req, res) => {
    const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
        },
        database: 'connected' // Will be updated after DB connection
    };
    
    res.status(200).json(healthCheck);
});

// API Routes
app.use('/api', apiRoutes);
app.use('/api/consciousness', consciousnessRoutes);
app.use('/api/psychology', psychologyRoutes);

// Demo routes (for backend showcase)
app.use('/demo', demoRoutes);

// Root endpoint with API information
app.get('/', (req, res) => {
    res.json({
        name: 'Psychology Portfolio Backend',
        description: 'Node.js + MongoDB backend for Interactive Psychology demonstration',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            demo: '/demo',
            api: {
                consciousness: '/api/consciousness',
                psychology: '/api/psychology',
                analytics: '/api/analytics'
            }
        },
        documentation: '/demo/api',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start server
async function startServer() {
    try {
        // Connect to database
        await connectDatabase();
        logger.info('Database connected successfully');
        
        // Start listening
        app.listen(PORT, () => {
            logger.info(`🧠 Psychology Backend Server running on port ${PORT}`);
            logger.info(`📊 Demo available at: http://localhost:${PORT}/demo`);
            logger.info(`🔍 Health check: http://localhost:${PORT}/health`);
            logger.info(`📚 API documentation: http://localhost:${PORT}/demo/api`);
            
            if (process.env.NODE_ENV !== 'production') {
                logger.info(`🚀 Frontend should connect to: http://localhost:${PORT}`);
            }
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Initialize server
startServer();

export default app;