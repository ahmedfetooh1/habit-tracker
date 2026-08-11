const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many requests from this IP, please try again after 15 minutes.',
    },
    });

    /**
     * Strict Rate Limiter for Authentication routes
     */
    const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many authentication attempts, please try again after 15 minutes.',
    },
    });

    module.exports = {
    apiLimiter,
    authLimiter,
};