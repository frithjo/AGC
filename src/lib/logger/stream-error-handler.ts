// src/lib/logger/stream-error-handler.ts
import { logger } from './index';
import { LogCategory } from './index';

interface StreamErrorContext {
  chunkNumber?: number;
  totalChunks?: number;
  processingTime?: number;
  model?: string;
  tool?: string;
}

/**
 * Error classification for stream errors
 */
export enum StreamErrorType {
  DATA_STREAM_PROCESSING = 'DATA_STREAM_PROCESSING',
  STREAM_INTERRUPTION = 'STREAM_INTERRUPTION',
  MALFORMED_CHUNK = 'MALFORMED_CHUNK',
  JSON_PARSING = 'JSON_PARSING',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Result of stream error handling
 */
interface StreamErrorResult {
  errorType: StreamErrorType;
  userMessage: string;
  retryable: boolean;
  errorId: string;
}

/**
 * Handles stream processing errors, particularly focusing on the specific error
 * pattern seen in the chat functionality.
 */
export function handleStreamError(error: Error, context: StreamErrorContext = {}): StreamErrorResult {
  const errorId = crypto.randomUUID().slice(0, 8);
  
  // Default error info
  let errorType = StreamErrorType.UNKNOWN;
  let userMessage = `An unexpected error occurred. Please try again. (Error ID: ${errorId})`;
  let retryable = true;
  
  // Get stack trace if available
  const stackTrace = error.stack || '';
  const errorMessage = error.message || '';
  
  // Check for specific error patterns
  if (stackTrace.includes('processDataStream') || stackTrace.includes('onErrorPart')) {
    errorType = StreamErrorType.DATA_STREAM_PROCESSING;
    userMessage = `There was a problem processing the response stream. Please try again. (Error ID: ${errorId})`;
    
    // Further classify based on stack trace patterns
    if (stackTrace.includes('JSON.parse') || errorMessage.includes('JSON')) {
      errorType = StreamErrorType.JSON_PARSING;
      userMessage = `There was an error processing the response format. Please try again. (Error ID: ${errorId})`;
    } else if (stackTrace.includes('TypeError') && 
              (stackTrace.includes('undefined') || stackTrace.includes('null'))) {
      errorType = StreamErrorType.MALFORMED_CHUNK;
      userMessage = `The response contained an invalid chunk. Please try again. (Error ID: ${errorId})`;
    }
  } else if (stackTrace.includes('AbortError') || errorMessage.includes('timeout')) {
    errorType = StreamErrorType.TIMEOUT;
    userMessage = `The request timed out. Please try again. (Error ID: ${errorId})`;
  } else if (stackTrace.includes('fetch') || errorMessage.includes('network')) {
    errorType = StreamErrorType.NETWORK_ERROR;
    userMessage = `A network error occurred. Please check your connection and try again. (Error ID: ${errorId})`;
  } else if (stackTrace.includes('stream') || stackTrace.includes('readable')) {
    errorType = StreamErrorType.STREAM_INTERRUPTION;
    userMessage = `The response stream was interrupted. Please try again. (Error ID: ${errorId})`;
  }
  
  // Log detailed error information
  const streamLogger = logger.child({
    errorId,
    errorType,
    streamContext: context,
  }, LogCategory.STREAM);
  
  streamLogger.error(`Stream error: ${errorType}`, error, {
    stackPreview: stackTrace.split('\n').slice(0, 3).join('\n'),
    retryable,
    userMessage,
  });
  
  return {
    errorType,
    userMessage,
    retryable,
    errorId,
  };
}

/**
 * Creates a more user-friendly response for stream errors
 */
export function createStreamErrorResponse(error: Error, context: StreamErrorContext = {}) {
  const { errorType, userMessage, errorId } = handleStreamError(error, context);
  
  return new Response(
    JSON.stringify({
      error: userMessage,
      errorType,
      errorId,
    }),
    { 
      status: 500, 
      headers: {
        'Content-Type': 'application/json',
        'X-Error-Id': errorId,
        'X-Error-Type': errorType,
      }
    }
  );
}

/**
 * Wraps stream processing with error handling
 * @param streamFn Function that returns a stream response
 * @param context Context information for error reporting
 */
export async function withStreamErrorHandling<T>(
  streamFn: () => Promise<T>, 
  context: StreamErrorContext = {}
): Promise<T> {
  try {
    return await streamFn();
  } catch (error) {
    // Convert to stream error response
    throw createStreamErrorResponse(error as Error, context);
  }
}