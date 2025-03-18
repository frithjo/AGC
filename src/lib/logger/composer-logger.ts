// src/lib/logger/composer-logger.ts
import Logger, { LogCategory, LogContext } from './index';

// Composer-specific context fields
interface ComposerLogContext extends LogContext {
  model?: string;
  promptLength?: number;
  editorHTMLLength?: number;
  messageCount?: number;
  updateEditorHTML?: boolean;
  responseHTMLLength?: number;
  responseMessageLength?: number;
  suggestedPromptsCount?: number;
}

/**
 * Specialized logger for the Composer API route
 */
class ComposerLogger extends Logger {
  constructor(initialContext?: Partial<ComposerLogContext>) {
    super(LogCategory.COMPOSER, initialContext);
  }

  /**
   * Log the start of a composer request
   */
  public logComposerStart(params: {
    model: string;
    prompt: string;
    editorHTML: string;
    messages: any[];
  }): void {
    const { model, prompt, editorHTML, messages } = params;
    
    this.extendContext({
      model,
      promptLength: prompt?.length || 0,
      editorHTMLLength: editorHTML?.length || 0,
      messageCount: messages?.length || 0,
    });
    
    this.info(`Composer request initiated with ${model} model`, {
      promptPreview: this.truncateString(prompt, 100),
      editorHTMLPreview: this.truncateString(editorHTML, 150),
    });
  }

  /**
   * Log model validation result
   */
  public logModelValidation(model: string, isValid: boolean): void {
    if (!isValid) {
      this.warn(`Invalid model requested: ${model}`, {
        validationResult: false,
      });
    } else {
      this.debug(`Valid model selected: ${model}`, {
        validationResult: true,
      });
    }
  }

  /**
   * Log object generation result
   */
  public logObjectGeneration(result: {
    message: string;
    updateEditorHTML: boolean;
    editorHTML: string;
    nextPrompt: string[];
  }, durationMs: number): void {
    this.extendContext({
      updateEditorHTML: result.updateEditorHTML,
      responseHTMLLength: result.editorHTML?.length || 0,
      responseMessageLength: result.message?.length || 0,
      suggestedPromptsCount: result.nextPrompt?.length || 0,
      duration: durationMs,
    });
    
    this.info(`Object generated successfully`, {
      responsePreview: this.truncateString(result.message, 100),
      editorUpdateRequested: result.updateEditorHTML,
      editorHTMLLength: result.editorHTML?.length || 0,
      nextPromptCount: result.nextPrompt?.length || 0,
      durationMs,
    });
  }

  /**
   * Log generation error
   */
  public logGenerationError(error: Error, params?: any): void {
    this.error(`Object generation failed`, error, {
      requestParams: this.sanitizeParams(params),
    });
  }

  /**
   * Log deep parsing or schema validation errors
   */
  public logSchemaError(error: Error, rawResponse?: any): void {
    this.error(`Schema validation error`, error, {
      errorType: 'SCHEMA_VALIDATION',
      rawResponseLength: typeof rawResponse === 'string' ? 
        rawResponse.length : JSON.stringify(rawResponse).length,
    });
  }

  /**
   * Log model specific configuration applied
   */
  public logModelConfig(model: string, config: any): void {
    this.debug(`Applied model-specific configuration`, {
      model,
      config,
    });
  }

  // Helper methods
  private truncateString(str: string, maxLength: number = 100): string {
    if (!str) return 'No content';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  }
  
  private sanitizeParams(params: any): any {
    if (!params) return null;
    
    // Create a copy to avoid modifying the original
    const sanitized = { ...params };
    
    // Truncate potentially large fields
    if (sanitized.editorHTML && sanitized.editorHTML.length > 200) {
      sanitized.editorHTML = this.truncateString(sanitized.editorHTML, 200);
    }
    
    if (sanitized.prompt && sanitized.prompt.length > 200) {
      sanitized.prompt = this.truncateString(sanitized.prompt, 200);
    }
    
    if (sanitized.messages && Array.isArray(sanitized.messages)) {
      sanitized.messageCount = sanitized.messages.length;
      sanitized.messages = 'Messages array truncated';
    }
    
    return sanitized;
  }
}

// Create and export a singleton instance
export const composerLogger = new ComposerLogger();

// Export the class for creating instances with specific context
export default ComposerLogger;