const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// 1. Initialize environment variables
dotenv.config();

// 2. Validate environment variables
const checkEnv = require('./config/envCheck');
checkEnv();

// 3. Import configurations and utilities
const passport = require('./config/passport');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const setupSwagger = require('./config/swagger');
const { errorHandler } = require('./middlewares/errorMiddleware');
const { apiLimiter } = require('./middlewares/rateLimiterMiddleware');

// Connect to MongoDB
connectDB();

const app = express();

// Trust reverse proxy (Required for deployment platforms like Render/Railway/Heroku)
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:4200',
        credentials: true,
    })
);

// Body & Cookie Parsing, Rate Limiting
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use('/api', apiLimiter);

// Authentication Middleware Initialization
app.use(passport.initialize());

// Setup Swagger API Documentation UI
setupSwagger(app);

// Health Check Endpoint
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.status(200).json({
        status: 'UP',
        uptime: process.uptime(),
        timestamp: new Date(),
        database: dbStatus,
    });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    logger.info(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});

// Graceful Shutdown Handler
const gracefulShutdown = (signal) => {
    logger.info(`${signal} signal received: closing HTTP server...`);
    server.close(() => {
        logger.info('HTTP server closed.');
        mongoose.connection.close(false, () => {
        logger.info('MongoDB connection closed.');
        process.exit(0);
        });
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));