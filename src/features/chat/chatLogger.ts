// src/features/chat/chatLogger.ts
import Logger, { LogCategory, LogContext } from '@/utils/logger';

// Chat-specific context fields
interface ChatLogContext extends LogContext {
  chatId?: string;
  messageId?: string;
  userId?: string;
  modelId?: string;
  promptTokens?: number;
  completionTokens?: number;
  latency?: number;
}

class ChatLogger extends Logger {
  constructor(initialContext?: Partial<ChatLogContext>) {
    super(LogCategory.CHAT, initialContext);
  }

  // Log chat request initiated
  public logRequestInitiated(chatId: string, userId: string, messageContent: string, modelId?: string): void {
    this.setContext({
      chatId,
      userId,
      modelId,
    });
    
    this.info('Chat request initiated', {
      messageLength: messageContent.length,
      // Don't log full message content in production for privacy
      messagePreview: process.env.NODE_ENV === 'development' ? 
        messageContent.substring(0, 100) + (messageContent.length > 100 ? '...' : '') : undefined,
    });
  }

  // Log before sending to external API
  public logApiRequest(requestData: any): void {
    this.debug('Sending request to chat API', {
      endpoint: requestData.endpoint,
      requestSize: JSON.stringify(requestData).length,
      // Include sanitized request details but not full messages
      requestMeta: {
        model: requestData.model,
        maxTokens: requestData.maxTokens,
        temperature: requestData.temperature,
        // other non-sensitive metadata
      }
    });
  }

  // Log API response received
  public logApiResponse(responseData: any, latencyMs: number): void {
    this.setContext({
      latency: latencyMs,
      promptTokens: responseData.usage?.prompt_tokens,
      completionTokens: responseData.usage?.completion_tokens,
    });
    
    this.debug('Received response from chat API', {
      statusCode: responseData.status,
      responseSize: JSON.stringify(responseData).length,
      usage: responseData.usage,
    });
  }

  // Log errors in chat processing
  public logApiError(error: Error, requestData?: any): void {
    // Extract useful info from error
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    };
    
    // Additional debugging for specific error types
    let additionalInfo = {};
    
    if (error.name === 'AbortError') {
      additionalInfo = { reason: 'Request timed out or was aborted' };
    } else if (error.name === 'TypeError' && error.message.includes('JSON')) {
      additionalInfo = { reason: 'Invalid JSON in response' };
    } else if ((error as any).status) {
      additionalInfo = { 
        statusCode: (error as any).status,
        statusText: (error as any).statusText,
      };
    }
    
    this.error('Error in chat API call', error, {
      ...additionalInfo,
      request: requestData ? {
        endpoint: requestData.endpoint,
        model: requestData.model,
      } : undefined,
    });
  }

  // Log streaming events
  public logStreamChunk(chunkNumber: number, chunkSize: number): void {
    if (chunkNumber % 10 === 0 || chunkNumber === 1) { // Don't log every chunk
      this.trace(`Received stream chunk #${chunkNumber}`, { chunkSize });
    }
  }

  // Log stream completion
  public logStreamComplete(totalChunks: number, totalLatencyMs: number): void {
    this.info('Chat stream completed', {
      totalChunks,
      totalLatency: `${totalLatencyMs}ms`,
    });
  }

  // Log stream errors
  public logStreamError(error: Error, chunkNumber: number): void {
    this.error(`Error in stream processing at chunk #${chunkNumber}`, error);
  }

  // Log client-side events (can be called from frontend)
  public static createClientLogger(context: Partial<ChatLogContext>) {
    return {
      logClientRender: (renderTimeMs: number) => {
        console.log(`[CHAT][${context.chatId}] Client render completed in ${renderTimeMs}ms`);
      },
      
      logClientError: (error: Error) => {
        console.error(`[CHAT][${context.chatId}] Client error:`, error.message, error);
        
        // Optionally send to server-side logging endpoint
        if (typeof window !== 'undefined') {
          fetch('/api/logs/client', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              level: 'error',
              category: 'chat',
              context,
              error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            }),
          }).catch(e => console.error('Failed to send client log to server', e));
        }
      }
    };
  }
}

export const chatLogger = new ChatLogger();
export default ChatLogger;