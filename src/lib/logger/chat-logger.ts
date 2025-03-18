// src/lib/logger/chat-logger.ts
import Logger, { LogCategory, LogContext } from './index';

// Create a class that extends the base logger
class ChatLogger extends Logger {
  constructor() {
    super(LogCategory.CHAT);
  }

  /**
   * Log the start of a chat request
   */
  logChatStart(params: {
    tool: string;
    model: string;
    messages: any[];
    hasNotes: boolean;
    hasImage: boolean;
  }): void {
    const { tool, model, messages, hasNotes, hasImage } = params;
    
    this.extendContext({
      tool,
      model,
      messagesCount: messages?.length || 0,
      notesProvided: hasNotes,
      imageProvided: hasImage,
    });
    
    this.info(`Chat request initiated with ${tool} tool and ${model} model`, {
      lastMessagePreview: messages?.length > 0 ? 
        this.truncateMessage(messages[messages.length - 1]?.content) : 'No messages',
    });
  }

  /**
   * Log tool execution details
   */
  logToolExecution(tool: string, params?: any): void {
    const toolLogger = this.child({ tool }, LogCategory.TOOLS);
    
    toolLogger.debug(`Executing tool: ${tool}`, {
      params: this.sanitizeParams(params),
    });
  }

  /**
   * Log the result of a tool execution
   */
  logToolResult(tool: string, success: boolean, data?: any, error?: Error): void {
    const toolLogger = this.child({ tool }, LogCategory.TOOLS);
    
    if (success) {
      toolLogger.debug(`Tool ${tool} executed successfully`, {
        resultPreview: this.truncateResult(data),
      });
    } else {
      toolLogger.error(`Tool ${tool} execution failed`, error, {
        params: this.sanitizeParams(data),
      });
    }
  }

  /**
   * Log a step completion in the streaming process
   */
  logStepCompletion(stepEvent: any): void {
    this.extendContext({
      stepCount: (this.context.stepCount || 0) + 1,
    });
    
    this.debug(`Step completed: ${stepEvent.type}`, {
      step: stepEvent.step,
      type: stepEvent.type,
      name: stepEvent.name,
      toolName: stepEvent.toolName,
      inputTokens: stepEvent.inputTokens,
      outputTokens: stepEvent.outputTokens,
      duration: stepEvent.duration,
    });
  }

  /**
   * Log the start of stream processing
   */
  logStreamStart(): void {
    const streamLogger = this.child({}, LogCategory.STREAM);
    streamLogger.debug('Stream processing started');
  }

  /**
   * Log stream progress
   */
  logStreamProgress(chunkCount: number, tokenCount: number): void {
    // Only log occasionally to avoid excessive logging
    if (chunkCount % 5 === 0 || chunkCount <= 2) {
      const streamLogger = this.child(
        { 
          streamChunks: chunkCount,
          streamTokens: tokenCount
        }, 
        LogCategory.STREAM
      );
      streamLogger.trace(`Stream progress: ${chunkCount} chunks, ~${tokenCount} tokens`);
    }
  }

  /**
   * Log stream completion
   */
  logStreamComplete(chunkCount: number, tokenCount: number, durationMs: number): void {
    const streamLogger = this.child(
      { 
        streamChunks: chunkCount,
        streamTokens: tokenCount,
        streamDuration: durationMs
      }, 
      LogCategory.STREAM
    );
    streamLogger.info(`Stream completed successfully`, {
      chunkCount,
      tokenCount,
      durationMs,
      tokensPerSecond: Math.round((tokenCount / durationMs) * 1000),
    });
  }

  /**
   * Log a stream error
   */
  logStreamError(error: Error, chunkCount: number): void {
    const streamLogger = this.child(
      { streamChunks: chunkCount }, 
      LogCategory.STREAM
    );
    
    // Check for specific stream processing errors
    const isDataStreamError = error.stack?.includes('processDataStream') || 
                             error.stack?.includes('onErrorPart') ||
                             error.stack?.includes('toDataStreamResponse');
    
    if (isDataStreamError) {
      streamLogger.error('Stream processing error', error, {
        errorLocation: 'processDataStream/onErrorPart',
        errorType: 'DATA_STREAM_PROCESSING',
        streamState: {
          chunksProcessed: chunkCount,
          atFinalChunk: false
        }
      });
    } else {
      streamLogger.error('Streaming error', error);
    }
  }

  /**
   * Log a model validation error
   */
  logModelValidationError(model: string): void {
    const modelLogger = this.child({ model }, LogCategory.MODEL);
    modelLogger.warn(`Invalid model requested: ${model}`);
  }

  // Helper methods
  private truncateMessage(message: string, maxLength: number = 100): string {
    if (!message) return 'No content';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  }
  
  private truncateResult(result: any): any {
    if (!result) return null;
    
    if (typeof result === 'string') {
      return this.truncateMessage(result);
    } 
    
    if (Array.isArray(result)) {
      return `Array with ${result.length} items`;
    }
    
    if (typeof result === 'object') {
      const keys = Object.keys(result);
      return `Object with keys: ${keys.join(', ')}`;
    }
    
    return result;
  }
  
  private sanitizeParams(params: any): any {
    if (!params) return null;
    
    // Remove or mask sensitive content
    const sanitized = { ...params };
    
    // Mask sensitive fields if needed
    if (sanitized.apiKey) sanitized.apiKey = '***';
    if (sanitized.token) sanitized.token = '***';
    
    return sanitized;
  }
}

// Create and export a singleton instance
export const chatLogger = new ChatLogger();

// Export the class for creating specialized loggers
export default ChatLogger;