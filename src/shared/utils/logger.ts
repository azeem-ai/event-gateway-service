import { createLogger, transports, format } from 'winston';

// Create a Winston logger with JSON format and timestamps
const logger = createLogger({
    level: process.env.LOG_LEVEL ?? 'info',
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
    ),
    transports: [
        new transports.Console()
    ],
});

export default logger;
