// src/hooks/useEnhancedChat.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, useChat, UseChatOptions } from 'ai/react';
import { fetchWithStreamErrorHandling, StreamErrorType, StreamProcessingError } from '@/lib/client/errorHandler';

interface EnhancedChatOptions extends UseChatOptions {
  tool?: string;
  notes?: string;
  image?: string;
  onError?: (error: Error) => void;
  maxRetries?: number;
}

interface EnhancedChatHook {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  error: Error | null;
  append: (message: Message) => Promise<void>;
  reload: () => Promise<void>;
  stop: () => void;
  setInput: (input: string) => void;
}

/**
 * Enhanced version of useChat with better error handling for stream processing errors
 */
export function useEnhancedChat({
  tool = 'none',
  notes = '',
  image = '',
  onError,
  maxRetries = 3,
  ...options
}: EnhancedChatOptions = {}): EnhancedChatHook {
  // Use the base useChat hook
  const chat = useChat(options);
  
  // Add our own error state
  const [error, setError] = useState<Error | null>(null);
  
  // Request count for retry tracking
  const requestCount = useRef(0);

  // Wrap the original append function with error handling
  const append = useCallback(
    async (message: Message) => {
      setError(null);
      requestCount.current++;
      const currentRequestId = requestCount.current;
      
      try {
        // Use our error handling wrapper
        return await fetchWithStreamErrorHandling(
          async () => {
            // Only proceed if this is still the current request
            if (requestCount.current !== currentRequestId) {
              throw new Error('Request superseded by newer request');
            }
            
            return await chat.append({
              ...message,
              // Add tool options to the request
              extra: {
                ...(message.extra || {}),
                tool,
                notes,
                image,
              },
            });
          },
          maxRetries
        );
      } catch (e) {
        const streamError = e as StreamProcessingError;
        setError(streamError);
        
        // Call the onError callback if provided
        if (onError) {
          onError(streamError);
        }
        
        // Log the error to console
        console.error('Chat stream error:', streamError);
        
        throw streamError;
      }
    },
    [chat, tool, notes, image, maxRetries, onError]
  );
  
  // Wrap the reload function with error handling
  const reload = useCallback(async () => {
    setError(null);
    requestCount.current++;
    const currentRequestId = requestCount.current;
    
    try {
      // Use our error handling wrapper
      return await fetchWithStreamErrorHandling(
        async () => {
          // Only proceed if this is still the current request
          if (requestCount.current !== currentRequestId) {
            throw new Error('Request superseded by newer request');
          }
          
          return await chat.reload();
        },
        maxRetries
      );
    } catch (e) {
      const streamError = e as StreamProcessingError;
      setError(streamError);
      
      // Call the onError callback if provided
      if (onError) {
        onError(streamError);
      }
      
      // Log the error to console
      console.error('Chat stream error during reload:', streamError);
      
      throw streamError;
    }
  }, [chat, maxRetries, onError]);
  
  // Reset error when component unmounts
  useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);
  
  return {
    ...chat,
    append,
    reload,
    error,
  };
}

export default useEnhancedChat;