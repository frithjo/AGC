// src/lib/logger/config.ts

/**
 * Configuration options for the logging system
 */
export interface LoggingConfig {
  // General settings
  level: string;
  enabled: boolean;
  
  // Sampling & performance
  sampling: {
    enabled: boolean;
    rate: number; // 0-1, percentage of logs to capture
  };
  
  // Sensitive data masking
  masking: {
    enabled: boolean;
    fields: string[]; // Fields to mask
    maskChar: string;
  };
}

/**
 * Environment-specific configurations
 */
const configurations: Record<string, LoggingConfig> = {
  development: {
    level: 'debug',
    enabled: true,
    sampling: {
      enabled: false,
      rate: 1,
    },
    masking: {
      enabled: true,
      fields: ['password', 'token', 'apiKey', 'secret', 'authorization'],
      maskChar: '***',
    },
  },
  
  test: {
    level: 'info',
    enabled: true,
    sampling: {
      enabled: false,
      rate: 1,
    },
    masking: {
      enabled: true,
      fields: ['password', 'token', 'apiKey', 'secret', 'authorization'],
      maskChar: '***',
    },
  },
  
  production: {
    level: 'info',
    enabled: true,
    sampling: {
      enabled: true,
      rate: 0.25, // Sample 25% of debug and trace logs
    },
    masking: {
      enabled: true,
      fields: [
        'password', 'token', 'apiKey', 'secret', 'authorization',
        'credentials', 'accessToken', 'refreshToken'
      ],
      maskChar: '***',
    },
  },
};

// Get current environment or default to development
// Use environment variables that are compatible with Edge Runtime
const env = process.env.NEXT_PUBLIC_NODE_ENV || 'development';

// Export the configuration for the current environment
export const loggingConfig: LoggingConfig = {
  ...configurations[env] || configurations.development,
  // Override from environment variables if set
  level: process.env.NEXT_PUBLIC_LOG_LEVEL || configurations[env]?.level || 'info',
  enabled: process.env.NEXT_PUBLIC_LOGGING_ENABLED !== 'false',
};

export default loggingConfig;