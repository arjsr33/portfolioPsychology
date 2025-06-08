// fullstack-psychology/backend/config/database.js - MongoDB Configuration
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 
                     process.env.MONGO_URI || 
                     'mongodb://localhost:27017/psychology_portfolio';
    
    // Updated connection options for newer MongoDB driver (removed deprecated options)
    const options = {
      // Connection options
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      
      // REMOVED DEPRECATED OPTIONS:
      // bufferMaxEntries: 0, // This is causing the error
      // bufferCommands: false, // Also deprecated
      // useNewUrlParser: true, // No longer needed
      // useUnifiedTopology: true, // No longer needed
      
      // Replica set options
      retryWrites: true,
      w: 'majority',
      
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

// Database health check function
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      status: states[state] || 'unknown',
      isConnected: state === 1,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      isConnected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Get database statistics
const getDatabaseStats = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    const db = mongoose.connection.db;
    
    // Get collection stats
    const collections = await db.listCollections().toArray();
    const stats = {
      database: mongoose.connection.name,
      collections: collections.length,
      collectionNames: collections.map(c => c.name),
      connectionInfo: {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        readyState: mongoose.connection.readyState
      },
      timestamp: new Date().toISOString()
    };

    // Try to get document counts for each collection
    const collectionStats = {};
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments();
        collectionStats[collection.name] = { documentCount: count };
      } catch (error) {
        collectionStats[collection.name] = { error: error.message };
      }
    }
    
    stats.collectionStats = collectionStats;
    return stats;
  } catch (error) {
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Test database connection
const testConnection = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    return { success: true, message: 'Database connection test successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get sample data from collections
const getSampleData = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    const db = mongoose.connection.db;
    const sampleData = {};

    // Define the collections we expect
    const expectedCollections = ['sessions', 'consciousness', 'brainwave_data', 'psychology_tests'];
    
    for (const collectionName of expectedCollections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        const sample = await collection.findOne();
        
        sampleData[collectionName] = {
          count,
          sample: sample ? Object.keys(sample) : null,
          exists: true
        };
      } catch (error) {
        sampleData[collectionName] = {
          count: 0,
          sample: null,
          exists: false,
          error: error.message
        };
      }
    }

    return sampleData;
  } catch (error) {
    return { error: error.message };
  }
};

// Export functions to match existing imports
export { 
  connectDB as connectDatabase,
  checkDatabaseHealth, 
  getDatabaseStats, 
  testConnection, 
  getSampleData 
};

// Also provide default export for flexibility
export default connectDB;