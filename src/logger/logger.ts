import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf, colorize } = format;

// Custom formatter to include timestamp, level, and message
const customFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

// Create the logger
const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        colorize(), // Enable colors for levels
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp
        customFormat // Use the custom format
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: './src/logger/log-files/app.log' }), // Log to a file
        new transports.File({
            filename: './src/logger/log-files/error.log',
            level: 'error',
        }),
    ],
});

export default logger;

