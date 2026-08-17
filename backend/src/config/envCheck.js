const logger = require('../utils/logger');

/**
 * Validates that all required environment variables are set.
 * Exits the application process if any critical variable is missing.
 */
const checkEnv = () => {
    const requiredEnvVars = [
        'PORT',
        'MONGO_URI',
        'JWT_SECRET',
        'JWT_ACCESS_SECRET',
        'JWT_REFRESH_SECRET',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'CLIENT_URL',
    ];

    const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

    if (missingVars.length > 0) {
        logger.error(`FATAL ERROR: Missing environment variables: ${missingVars.join(', ')}`);
        process.exit(1);
    }
};

module.exports = checkEnv;