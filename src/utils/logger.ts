// src/utils/logger.ts
import pino from 'pino';
import { NextRequest, NextResponse } from 'next/server';

// Define log levels
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// Define log categories
export enum LogCategory {
  API = 'api',
  DATABASE = 'database',
  AUTH = 'auth',
  CHAT = 'chat',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  GENERAL = 'general',
}

// Context interface to store request-specific data
export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  route?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any; // Allow for additional custom context
}

// Configure Pino logger with customizations
const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    target: 'pino',
    options: {
      colorize: process.env.NODE_ENV !== 'production',
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
  base: {
    env: process.env.NODE_ENV,
    version: process.env.APP_VERSION || '1.0.0',
  },
});

// Create a class for our logger to maintain context
class Logger {
  private context: LogContext = {};
  private category: LogCategory = LogCategory.GENERAL;

  // Initialize with optional context and category
  constructor(category?: LogCategory, initialContext?: LogContext) {
    if (category) {
      this.category = category;
    }
    if (initialContext) {
      this.context = { ...initialContext };
    }
  }

  // Set or update context
  public setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  // Set category
  public setCategory(category: LogCategory): void {
    this.category = category;
  }

  // Create a child logger with additional context
  public child(additionalContext: Partial<LogContext>, category?: LogCategory): Logger {
    const childLogger = new Logger(
      category || this.category,
      { ...this.context, ...additionalContext }
    );
    return childLogger;
  }

  // Log methods for different levels
  public trace(message: string, data?: any): void {
    this.log(LogLevel.TRACE, message, data);
  }

  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  public error(message: string, error?: Error | any, data?: any): void {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...(error as any), // Include any custom properties
    } : error;

    this.log(LogLevel.ERROR, message, { ...data, error: errorData });
  }

  public fatal(message: string, error?: Error | any, data?: any): void {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...(error as any),
    } : error;

    this.log(LogLevel.FATAL, message, { ...data, error: errorData });
  }

  // Internal log method that all other methods use
  private log(level: LogLevel, message: string, data?: any): void {
    const logData = {
      category: this.category,
      context: this.context,
      ...(data ? { data } : {}),
    };

    pinoLogger[level](logData, message);
  }

  // Create a middleware for capturing request context
  public static createRequestMiddleware() {
    return (req: NextRequest, next: () => Promise<NextResponse>) => {
      const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
      const startTime = performance.now();
      
      // Clone headers to ensure we can read them (they might be a ReadableStream)
      const headers = new Headers(req.headers);
      
      // Set request ID for correlation
      headers.set('x-request-id', requestId);
      
      // Create a context for this request
      const context: LogContext = {
        requestId,
        route: req.nextUrl.pathname,
        method: req.method,
        ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      };
      
      // Create request-specific logger
      const requestLogger = new Logger(LogCategory.API, context);
      requestLogger.info(`Request started: ${req.method} ${req.nextUrl.pathname}`);
      
      // Attach logger to request for use in route handlers
      (req as any).logger = requestLogger;
      
      return next().then((response) => {
        const duration = performance.now() - startTime;
        requestLogger.info(`Request completed: ${req.method} ${req.nextUrl.pathname}`, {
          statusCode: response.status,
          duration: `${duration.toFixed(2)}ms`,
        });
        
        // Add the request ID to the response headers for correlation
        response.headers.set('x-request-id', requestId);
        return response;
      }).catch((error) => {
        const duration = performance.now() - startTime;
        requestLogger.error(`Request failed: ${req.method} ${req.nextUrl.pathname}`, error, {
          duration: `${duration.toFixed(2)}ms`,
        });
        throw error;
      });
    };
  }
}

// Export a default logger instance
export const logger = new Logger();

// Export the Logger class for creating specialized loggers
export default Logger;