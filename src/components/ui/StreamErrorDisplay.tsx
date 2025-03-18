// src/components/ui/StreamErrorDisplay.tsx
import React from 'react';
import { StreamErrorType, StreamProcessingError } from '@/lib/client/errorHandler';

interface StreamErrorDisplayProps {
  error: Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const StreamErrorDisplay: React.FC<StreamErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
}) => {
  if (!error) return null;
  
  // Check if this is our stream error type
  const isStreamError = error instanceof StreamProcessingError;
  const errorType = isStreamError ? (error as StreamProcessingError).errorType : StreamErrorType.UNKNOWN_ERROR;
  const errorId = isStreamError ? (error as StreamProcessingError).errorId : '';
  const isRetryable = isStreamError ? (error as StreamProcessingError).retryable : true;
  
  // Get appropriate icon based on error type
  const getErrorIcon = () => {
    switch (errorType) {
      case StreamErrorType.NETWORK_ERROR:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="2" y1="2" x2="22" y2="22"></line>
            <path d="M8.5 16.5a5 5 0 0 1 7 0"></path>
            <path d="M2 8.82a15 15 0 0 1 20 0"></path>
            <path d="M5 12.82a10 10 0 0 1 14 0"></path>
          </svg>
        );
      case StreamErrorType.TIMEOUT_ERROR:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        );
      case StreamErrorType.STREAM_PROCESSING_ERROR:
      case StreamErrorType.JSON_PARSING_ERROR:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6h-5c-1.1 0-2 .9-2 2v8m0 0v-6c0-1.1.9-2 2-2h7"></path>
            <path d="M2 12s3-3 6-3 6 3 6 3-3 3-6 3-6-3-6-3z"></path>
            <circle cx="12" cy="12" r="1"></circle>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
    }
  };
  
  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 text-red-500">
          {getErrorIcon()}
        </div>
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-red-800">
            {error.message || 'An error occurred during streaming'}
          </h3>
          
          {errorId && (
            <p className="mt-1 text-xs text-red-700">
              Error ID: {errorId}
            </p>
          )}
          
          <div className="mt-4 flex gap-2">
            {isRetryable && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Retry
              </button>
            )}
            
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamErrorDisplay;