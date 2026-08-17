const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connects to MongoDB Atlas database and attaches connection lifecycle listeners
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error(`Database Connection Error: ${error.message}`);
        process.exit(1);
    }
    };

    // Event Listeners for MongoDB Connection Lifecycle
    mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection lost. Attempting to reconnect...');
    });

    mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
    });

module.exports = connectDB;