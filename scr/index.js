const mongoose = require('mongoose');
const config = require('./config/config');
const { app, server } = require('./app');
const logger = require('./config/logger');

let serverInstance;

mongoose.connect(config.mongoose.url, config.mongoose.options)
    .then(() => {
        logger.info('Connected to MongoDB');
        serverInstance = server.listen(config.port, () => {
            logger.info(`Listening on port ${config.port}`);
        });
    })
    .catch((error) => {
        logger.error("MongoDB Handshake Failed:", error);
    });

const exitHandler = () => {
    if (serverInstance) {
        serverInstance.close(() => {
            logger.info('Server closed');
            process.exit(0); // Exit with success status code
        });
    } else {
        process.exit(0); // Exit with success status code
    }
};

const unexpectedErrorHandler = (error) => {
    logger.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (serverInstance) {
        serverInstance.close((err) => {
            if (err) {
                logger.error('Error closing server:', err);
                process.exit(1); // Exit with error status code
            } else {
                logger.info('Server closed gracefully');
                process.exit(0); // Exit with success status code
            }
        });
    } else {
        process.exit(0); // Exit with success status code
    }
});
