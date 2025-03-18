// src/lib/client/errorHandler.ts

/**
 * Types of errors that can occur in the streaming process
 */
export enum StreamErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    STREAM_PROCESSING_ERROR = 'STREAM_PROCESSING_ERROR',
    JSON_PARSING_ERROR = 'JSON_PARSING_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    ABORTED_ERROR = 'ABORTED_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  }
  
  /**
   * Details of a stream error
   */
  interface StreamErrorDetails {
    type: StreamErrorType;
    message: string;
    retryable: boolean;
    originalError?: Error;
    errorId?: string;
  }
  
  /**
   * Handle client-side streaming errors
   * @param error The error that occurred
   * @returns Information about the error
   */
  export function handleClientStreamError(error: Error): StreamErrorDetails {
    // Generate a unique ID for this error
    const errorId = Math.random().toString(36).substring(2, 10);
    
    // Default error information
    let errorType = StreamErrorType.UNKNOWN_ERROR;
    let message = `An unexpected error occurred. Please try again. (Error ID: ${errorId})`;
    let retryable = true;
    
    // Extract stack trace
    const stack = error.stack || '';
    const errorMessage = error.message || '';
    
    // Check for the specific streaming error pattern
    if (stack.includes('onErrorPart') || stack.includes('processDataStream')) {
      errorType = StreamErrorType.STREAM_PROCESSING_ERROR;
      message = `There was a problem processing the response. Please try again. (Error ID: ${errorId})`;
      
      // Log this error to console for debugging
      console.error(`[Stream Error ${errorId}]`, error);
      
      // Further classify based on stack/message contents
      if (stack.includes('JSON.parse') || errorMessage.includes('JSON')) {
        errorType = StreamErrorType.JSON_PARSING_ERROR;
        message = `There was an error in the response format. Please try again. (Error ID: ${errorId})`;
      }
    } else if (errorMessage.includes('network') || stack.includes('fetch')) {
      errorType = StreamErrorType.NETWORK_ERROR;
      message = `A network error occurred. Please check your connection and try again. (Error ID: ${errorId})`;
    } else if (errorMessage.includes('timeout') || stack.includes('timeout')) {
      errorType = StreamErrorType.TIMEOUT_ERROR;
      message = `The request timed out. Please try again. (Error ID: ${errorId})`;
    } else if (errorMessage.includes('aborted') || stack.includes('aborted')) {
      errorType = StreamErrorType.ABORTED_ERROR;
      message = `The request was aborted. Please try again. (Error ID: ${errorId})`;
      retryable = false; // User likely cancelled it
    }
    
    // Log detailed error information to the console
    console.error(`[Client Error ${errorId}] ${errorType}: ${message}`, {
      errorType,
      stack: stack.split('\n').slice(0, 3).join('\n'),
      message: errorMessage,
      retryable,
    });
    
    // Try to send error to server for logging if appropriate
    if (errorType === StreamErrorType.STREAM_PROCESSING_ERROR) {
      try {
        fetch('/api/log-client-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            errorType,
            errorId,
            message: errorMessage,
            stack: stack,
            timestamp: new Date().toISOString(),
          }),
          // Use keepalive to ensure the request completes even if page navigates away
          keepalive: true,
        }).catch(() => {
          // Silently fail if this doesn't work
        });
      } catch (e) {
        // Ignore errors from reporting
      }
    }
    
    return {
      type: errorType,
      message,
      retryable,
      originalError: error,
      errorId,
    };
  }
  
  /**
   * Custom error class for stream processing errors
   */
  export class StreamProcessingError extends Error {
    public errorType: StreamErrorType;
    public errorId: string;
    public retryable: boolean;
    
    constructor(details: StreamErrorDetails) {
      super(details.message);
      this.name = 'StreamProcessingError';
      this.errorType = details.type;
      this.errorId = details.errorId || '';
      this.retryable = details.retryable;
      
      // Capture original stack if available
      if (details.originalError && details.originalError.stack) {
        this.stack = details.originalError.stack;
      }
    }
  }
  
  /**
   * Wrapper function to handle stream errors with retry logic
   * @param fetchFn The function that performs the fetch operation
   * @param maxRetries Maximum number of retries
   * @returns The fetch result
   */
  export async function fetchWithStreamErrorHandling<T>(
    fetchFn: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    let retries = 0;
    
    while (true) {
      try {
        return await fetchFn();
      } catch (error) {
        const errorDetails = handleClientStreamError(error as Error);
        
        // If not retryable or we've reached max retries, throw a better error
        if (!errorDetails.retryable || retries >= maxRetries) {
          throw new StreamProcessingError(errorDetails);
        }
        
        // Increment retry counter
        retries++;
        
        // Wait with exponential backoff before retrying
        const delay = Math.min(1000 * Math.pow(2, retries), 10000);
        console.log(`Retrying (${retries}/${maxRetries}) after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }