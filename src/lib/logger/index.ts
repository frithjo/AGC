// src/lib/logger/index.ts
import { NextRequest } from 'next/server';

// Define log levels
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// Define log categories based on AGC specific services
export enum LogCategory {
  CHAT = 'chat',           // For chat route
  TOOLS = 'tools',         // For tool usage (web, x, fileSearch, etc.)
  COMPOSER = 'composer',   // For composer route
  EMBEDDING = 'embedding', // For embed route
  MODEL = 'model',         // For model selection and validation
  DATABASE = 'database',   // For Supabase interactions
  STREAM = 'stream',       // For streaming responses
  SECURITY = 'security',   // For auth and validation
  GENERAL = 'general',     // Default category
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
  model?: string;        // AI model being used
  tool?: string;         // Tool being used (web, x, etc.)
  duration?: number;     // Request duration in ms
  statusCode?: number;   // HTTP status code
  [key: string]: any;    // Allow for additional custom context
}

// Simple serializer for objects to prevent circular references
function safeStringify(obj: any): string {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    }, 2);
  } catch (err) {
    return '[Error serializing object]';
  }
}

// Edge-compatible logger implementation
class Logger {
  protected context: LogContext = {};
  protected category: LogCategory = LogCategory.GENERAL;
  
  // Edge-compatible config using NEXT_PUBLIC_ variables
  private static LOG_ENABLED = process.env.NEXT_PUBLIC_LOGGING_ENABLED !== 'false';
  private static LOG_LEVEL = process.env.NEXT_PUBLIC_LOG_LEVEL || 'info';

  // Initialize with optional category and context
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

  // Extend context with new properties
  public extendContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  // Set category
  public setCategory(category: LogCategory): void {
    this.category = category;
  }

  // Create a child logger with additional context
  public child(additionalContext: Partial<LogContext> = {}, category?: LogCategory): Logger {
    const childLogger = new Logger(
      category || this.category,
      { ...this.context, ...additionalContext }
    );
    return childLogger;
  }

  // Internal method to determine if this log level should be output
  private shouldLog(level: LogLevel): boolean {
    if (!Logger.LOG_ENABLED) return false;
    
    const levels = {
      trace: 0,
      debug: 1,
      info: 2,
      warn: 3,
      error: 4,
      fatal: 5
    };
    
    const configLevel = Logger.LOG_LEVEL.toLowerCase() as keyof typeof levels;
    const messageLevel = level.toLowerCase() as keyof typeof levels;
    
    return levels[messageLevel] >= levels[configLevel];
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
    let errorData = null;
    
    // Handle Error objects
    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      
      // Add any additional properties from the error
      for (const key in error) {
        if (Object.prototype.hasOwnProperty.call(error, key) && 
            !['name', 'message', 'stack'].includes(key)) {
          errorData[key] = (error as any)[key];
        }
      }
    } else if (error) {
      errorData = error;
    }
    
    this.log(LogLevel.ERROR, message, { ...data, error: errorData });
  }

  public fatal(message: string, error?: Error | any, data?: any): void {
    let errorData = null;
    
    // Handle Error objects
    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      
      // Add any additional properties from the error
      for (const key in error) {
        if (Object.prototype.hasOwnProperty.call(error, key) && 
            !['name', 'message', 'stack'].includes(key)) {
          errorData[key] = (error as any)[key];
        }
      }
    } else if (error) {
      errorData = error;
    }
    
    this.log(LogLevel.FATAL, message, { ...data, error: errorData });
  }

  // Internal log method that all other methods use
  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;
    
    const timestamp = new Date().toISOString();
    const logData = {
      level,
      timestamp,
      category: this.category,
      context: this.context,
      message,
      ...(data ? { data } : {}),
    };
    
    // In Edge Runtime we can only use console.log
    try {
      switch (level) {
        case LogLevel.TRACE:
        case LogLevel.DEBUG:
          console.debug(`[${timestamp}] [${level}] [${this.category}] ${message}`, 
            data ? `\n${safeStringify(data)}` : '');
          break;
        case LogLevel.INFO:
          console.log(`[${timestamp}] [${level}] [${this.category}] ${message}`, 
            data ? `\n${safeStringify(data)}` : '');
          break;
        case LogLevel.WARN:
          console.warn(`[${timestamp}] [${level}] [${this.category}] ${message}`, 
            data ? `\n${safeStringify(data)}` : '');
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(`[${timestamp}] [${level}] [${this.category}] ${message}`,
            data ? `\n${safeStringify(data)}` : '');
          break;
      }
    } catch (err) {
      // Fallback if something goes wrong with logging
      console.error(`Error during logging: ${err}`);
      console.error(`Original log: [${level}] ${message}`);
    }
  }

  // Extract request context from a NextRequest
  public static getRequestContext(req: NextRequest): LogContext {
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
    
    return {
      requestId,
      route: req.nextUrl.pathname,
      method: req.method,
      ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      referer: req.headers.get('referer') || 'unknown',
      // Add any auth information if available
      userId: req.headers.get('x-user-id') || undefined,
      sessionId: req.headers.get('x-session-id') || undefined,
    };
  }
}

// Export a default logger instance
export const logger = new Logger();

// Export the Logger class for creating specialized loggers
export default Logger;