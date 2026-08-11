const { createLogger, format, transports } = require('winston');

/**
 * Winston Logger configuration for centralized logging.
 */
const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'habit-tracker-backend' },
    transports: [
        // Write all error logs to `logs/error.log`
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Write all combined logs to `logs/combined.log`
        new transports.File({ filename: 'logs/combined.log' }),
    ],
    });

    // Console transport for non-production environments
    if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new transports.Console({
        format: format.combine(
            format.colorize(),
            format.printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`)
        ),
        })
    );
}

module.exports = logger;