// lib/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // Set log level based on environment
  transport: {
    target: 'pino', 
    options: {
      colorize: true,
    },
  },
});

export default logger;
