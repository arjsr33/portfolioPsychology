// fullstack-psychology/backend/config/database.js - MongoDB Configuration
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// MongoDB connection configuration
const connectDatabase = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 
                         process.env.MONGO_URI || 
                         'mongodb://localhost:27017/psychology_portfolio';
        
        const options = {
            // Connection options
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            bufferMaxEntries: 0, // Disable mongoose buffering
            bufferCommands: false, // Disable mongoose buffering
            
            // Replica set options
            retryWrites: true,
            w: 'majority',
            
            // Authentication (if needed)
            authSource: 'admin',
            
            // SSL/TLS (for production MongoDB Atlas)
            ssl: process.env.NODE_ENV === 'production',
            
            // Application name for MongoDB logs
            appName: 'Psychology-Portfolio-Backend'
        };

        // Connect to MongoDB
        const connection = await mongoose.connect(mongoURI, options);
        
        logger.info(`MongoDB connected: ${connection.connection.host}`);
        logger.info(`Database: ${connection.connection.name}`);
        
        // Connection event listeners
        mongoose.connection.on('connected', () => {
            logger.info('Mongoose connected to MongoDB');
        });
        
        mongoose.connection.on('error', (err) => {
            logger.error('Mongoose connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            logger.warn('Mongoose disconnected from MongoDB');
        });
        
        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                logger.info('Mongoose connection closed through app termination');
                process.exit(0);
            } catch (error) {
                logger.error('Error closing mongoose connection:', error);
                process.exit(1);
            }
        });
        
        return connection;
        
    } catch (error) {
        logger.error('Database connection failed:', error);
        
        // In development, provide helpful error messages
        if (process.env.NODE_ENV !== 'production') {
            console.log('\n📋 Database Connection Help:');
            console.log('1. Make sure MongoDB is running locally, OR');
            console.log('2. Set MONGODB_URI environment variable with your Atlas connection string');
            console.log('3. Example: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/psychology_portfolio');
            console.log('\n🔧 Current connection attempt:', process.env.MONGODB_URI ? 'Atlas/Remote' : 'Local MongoDB');
        }
        
        throw error;
    }
};

// Database health check
const checkDatabaseHealth = async () => {
    try {
        const adminDb = mongoose.connection.db.admin();
        const result = await adminDb.ping();
        return {
            status: 'connected',
            ping: result,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            name: mongoose.connection.name
        };
    } catch (error) {
        return {
            status: 'error',
            error: error.message,
            readyState: mongoose.connection.readyState
        };
    }
};

// Get database statistics
const getDatabaseStats = async () => {
    try {
        const db = mongoose.connection.db;
        const stats = await db.stats();
        
        // Get collection stats
        const collections = await db.listCollections().toArray();
        const collectionStats = {};
        
        for (const collection of collections) {
            try {
                const collStats = await db.collection(collection.name).stats();
                collectionStats[collection.name] = {
                    documents: collStats.count || 0,
                    size: collStats.size || 0,
                    avgObjSize: collStats.avgObjSize || 0,
                    indexes: collStats.nindexes || 0
                };
            } catch (err) {
                collectionStats[collection.name] = { error: 'Could not retrieve stats' };
            }
        }
        
        return {
            database: {
                name: stats.db,
                collections: stats.collections,
                views: stats.views,
                objects: stats.objects,
                avgObjSize: stats.avgObjSize,
                dataSize: stats.dataSize,
                storageSize: stats.storageSize,
                indexes: stats.indexes,
                indexSize: stats.indexSize
            },
            collections: collectionStats
        };
    } catch (error) {
        logger.error('Error getting database stats:', error);
        return { error: error.message };
    }
};

// Export functions
export { 
    connectDatabase, 
    checkDatabaseHealth, 
    getDatabaseStats 
};