// src/features/chat/chatErrorHandler.ts
import { chatLogger } from './chatLogger';

// Known error codes and their user-friendly messages
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection and try again.',
  TIMEOUT_ERROR: 'The request timed out. Please try again later.',
  API_ERROR: 'There was an issue communicating with the chat service. Please try again later.',
  RATE_LIMIT: 'You have exceeded the rate limit. Please wait a moment before trying again.',
  VALIDATION_ERROR: 'The request contained invalid data. Please check your input and try again.',
  INTERNAL_ERROR: 'An internal error occurred. Our team has been notified.',
  STREAM_ERROR: 'There was an error processing the chat stream. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again later.',
};

// Error classification function
export function classifyError(error: any): {
  code: string;
  userMessage: string;
  retryable: boolean;
} {
  // Default error classification
  let classification = {
    code: 'UNKNOWN_ERROR',
    userMessage: ERROR_MESSAGES.UNKNOWN_ERROR,
    retryable: true,
  };

  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    classification = {
      code: 'NETWORK_ERROR',
      userMessage: ERROR_MESSAGES.NETWORK_ERROR,
      retryable: true,
    };
  }
  // Timeout errors
  else if (error.name === 'AbortError' || 
          (error.message && error.message.includes('timeout'))) {
    classification = {
      code: 'TIMEOUT_ERROR',
      userMessage: ERROR_MESSAGES.TIMEOUT_ERROR,
      retryable: true,
    };
  }
  // API errors
  else if (error.status) {
    // Rate limiting
    if (error.status === 429) {
      classification = {
        code: 'RATE_LIMIT',
        userMessage: ERROR_MESSAGES.RATE_LIMIT,
        retryable: true,
      };
    }
    // Validation errors
    else if (error.status === 400 || error.status === 422) {
      classification = {
        code: 'VALIDATION_ERROR',
        userMessage: ERROR_MESSAGES.VALIDATION_ERROR,
        retryable: false,
      };
    }
    // Internal server errors
    else if (error.status >= 500) {
      classification = {
        code: 'API_ERROR',
        userMessage: ERROR_MESSAGES.API_ERROR,
        retryable: true,
      };
    }
  }
  // Stream processing errors
  else if (error.message && error.message.includes('dataStream')) {
    classification = {
      code: 'STREAM_ERROR',
      userMessage: ERROR_MESSAGES.STREAM_ERROR,
      retryable: true,
    };
  }
  // JSON parsing errors (likely malformed responses)
  else if (error.message && error.message.includes('JSON')) {
    classification = {
      code: 'INTERNAL_ERROR',
      userMessage: ERROR_MESSAGES.INTERNAL_ERROR,
      retryable: false,
    };
  }

  return classification;
}

// Chat error handler
export function handleChatError(error: any, chatId?: string, userId?: string): {
  userMessage: string;
  retryable: boolean;
} {
  // Extract stack trace
  const stackTrace = error.stack || '';
  
  // Classify the error
  const classification = classifyError(error);
  
  // Format error details for logging
  const errorDetails = {
    originalError: {
      name: error.name,
      message: error.message,
      stack: stackTrace,
    },
    classification: classification.code,
    chatId,
    userId,
  };
  
  // Log the error with all details
  chatLogger.error(`Chat error: ${classification.code}`, error, errorDetails);
  
  // If this is a potentially serious system error, add more detailed logging
  if (classification.code === 'INTERNAL_ERROR' || 
     (classification.code === 'UNKNOWN_ERROR' && !error.handled)) {
    
    // Get more system context for serious errors
    const systemContext = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
    
    chatLogger.error('Detailed system context for chat error', null, systemContext);
    
    // Mark as handled to prevent duplicate detailed logs
    error.handled = true;
  }
  
  // Return user-facing error information
  return {
    userMessage: classification.userMessage,
    retryable: classification.retryable,
  };
}

// Specifically handle the stream processing error you encountered
export function handleStreamProcessingError(error: any, streamInfo: {
  chatId?: string;
  chunkNumber?: number;
  totalChunks?: number;
  processingTime?: number;
}) {
  // This pattern matches the specific error pattern you showed
  const isDataStreamError = error.stack?.includes('processDataStream') || 
                           error.stack?.includes('onErrorPart');
  
  if (isDataStreamError) {
    // Add specialized context for data stream errors
    chatLogger.error('Stream processing error', error, {
      ...streamInfo,
      errorLocation: 'processDataStream',
      errorType: 'DATA_STREAM_PROCESSING',
      // Check for specific known issues in these functions
      potentialCauses: [
        'Malformed chunk in stream',
        'Unexpected end of stream',
        'Invalid JSON in stream chunk',
        'Stream interruption',
      ]
    });
    
    return {
      userMessage: 'There was an error processing the chat response. Please try again.',
      errorCode: 'STREAM_PROCESSING_ERROR',
      retryable: true,
    };
  }
  
  // If not a stream processing error, use the general handler
  return handleChatError(error, streamInfo.chatId);
}