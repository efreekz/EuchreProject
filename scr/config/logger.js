const winston = require('winston');
const config = require('./config');
const { format } = winston;

// Custom error formatting
const enumerateErrorFormat = format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack });
    }
    return info;
});

// Define log filename and log level based on environment
const logFilename = 'app.log';
const logLevel = config.env === 'development' ? 'debug' : 'info';

// Logger configuration
const logger = winston.createLogger({
    level: logLevel,
    format: format.combine(
        enumerateErrorFormat(),
        config.env === 'development' ? format.colorize() : format.uncolorize(),
        format.splat(),
        format.printf(({ level, message }) => `${level}: ${message}`)
    ),
    transports: [
        // Console transport
        new winston.transports.Console({
            stderrLevels: ['error'],
        }),
        // File transport for production environment
        config.env !== 'development' && new winston.transports.File({ filename: logFilename }),
    ].filter(Boolean), // Remove falsy values (null or undefined) from the array
});

// Error handling: Log uncaught exceptions
process.on('uncaughtException', (ex) => {
    logger.error(`Uncaught exception: ${ex.message}`, ex);
    process.exit(1);
});

// Error handling: Log unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    throw reason;
});

module.exports = logger;
