const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// 1. Initialize environment variables first
dotenv.config();

// 2. Validate environment variables before running the application
const checkEnv = require('./config/envCheck');
checkEnv();

// 3. Import required configurations and utilities
const passport = require('./config/passport');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const setupSwagger = require('./config/swagger');
const { errorHandler } = require('./middlewares/errorMiddleware');
const { apiLimiter } = require('./middlewares/rateLimiterMiddleware');

// Connect to MongoDB database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:4200',
        credentials: true, // Allow cookies to be sent across origins
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

// API Route Handler Mounting
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    logger.info(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});