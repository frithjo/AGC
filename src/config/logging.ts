// src/config/logging.ts

interface LoggingConfig {
    // General settings
    level: string;
    pretty: boolean;
    enabled: boolean;
    
    // Output settings
    outputs: {
      console: boolean;
      file: boolean;
      remote: boolean;
    };
    
    // File logging settings
    fileOptions?: {
      dir: string;
      maxSize: string;
      maxFiles: number;
      compress: boolean;
    };
    
    // Remote logging settings
    remoteOptions?: {
      url: string;
      batchSize: number;
      interval: number;
      headers?: Record<string, string>;
    };
    
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
    
    // Retention settings
    retention: {
      days: number;
      maxSize: string;
    };
  }
  
  // Environment-specific configurations
  const configurations: Record<string, LoggingConfig> = {
    development: {
      level: 'debug',
      pretty: true,
      enabled: true,
      outputs: {
        console: true,
        file: true,
        remote: false,
      },
      fileOptions: {
        dir: './logs',
        maxSize: '10m',
        maxFiles: 5,
        compress: false,
      },
      sampling: {
        enabled: false,
        rate: 1,
      },
      masking: {
        enabled: true,
        fields: ['password', 'token', 'apiKey', 'secret', 'credential'],
        maskChar: '***',
      },
      retention: {
        days: 7,
        maxSize: '100m',
      },
    },
    
    test: {
      level: 'info',
      pretty: false,
      enabled: true,
      outputs: {
        console: true,
        file: false,
        remote: false,
      },
      sampling: {
        enabled: false,
        rate: 1,
      },
      masking: {
        enabled: true,
        fields: ['password', 'token', 'apiKey', 'secret', 'credential'],
        maskChar: '***',
      },
      retention: {
        days: 1,
        maxSize: '10m',
      },
    },
    
    production: {
      level: 'info',
      pretty: false,
      enabled: true,
      outputs: {
        console: true,
        file: true,
        remote: true,
      },
      fileOptions: {
        dir: '/var/log/agc',
        maxSize: '50m',
        maxFiles: 10,
        compress: true,
      },
      remoteOptions: {
        url: process.env.LOG_SERVICE_URL || 'https://logs.example.com/ingest',
        batchSize: 100,
        interval: 10000, // 10 seconds
        headers: {
          'x-api-key': process.env.LOG_SERVICE_API_KEY || '',
        },
      },
      sampling: {
        enabled: true,
        rate: 0.1, // Sample 10% of debug and trace logs in production
      },
      masking: {
        enabled: true,
        fields: [
          'password', 'token', 'apiKey', 'secret', 'credential',
          'ssn', 'socialSecurityNumber', 'creditCard', 'cardNumber',
          'authToken', 'authorization'
        ],
        maskChar: '***',
      },
      retention: {
        days: 90,
        maxSize: '5g',
      },
    },
  };
  
  // Get current environment or default to development
  const env = process.env.NODE_ENV || 'development';
  
  // Export the configuration for the current environment
  export const loggingConfig: LoggingConfig = configurations[env] || configurations.development;
  
  export default loggingConfig;