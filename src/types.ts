// C:\AGC\types.ts  (or C:\AGC\src\types.ts, see explanation below)
export type Model = 'openai' | 'gemini' | 'deepseek-chat' | 'deepseek-reasoner';

// types.ts
import { Message } from "ai/react";

// Tool-related types
export type ToolInvocationPart = {
  type: 'tool-call';
  toolName: string;
  args: Record<string, any>;
  id: string;
};

export type ToolResultPart = {
  type: 'tool-result';
  toolName: string;
  result: any;
  id: string;
};

export type TextPart = {
  type: 'text';
  text: string;
};

export type ContentPart = TextPart | ToolInvocationPart | ToolResultPart | { type: 'tool-call' };

// Define the structure of the actual tool call object received in onToolCall
export interface ToolCall<T = string, A = unknown> {
  id?: string;
  name?: string;
  function?: {
    name: string;
    arguments: string;
  };
  toolName?: string;
  args?: A;
}

// Custom tool invocation type for your components
export type CustomToolInvocation = {
  toolName: string;
  args: Record<string, any>;
};

// App-specific types
export type Mode = "chat" | "composer";
export type Tools = "web" | "x" | "none" | "url" | "notes" | "whiteboard" | "fileSearch";

export type ResponseObject = {
  message: string;
  updateEditorHTML: boolean;
  editorHTML: string;
  nextPrompt: string[];
};

// Utility functions for working with messages
export function getToolCallFromMessage(message: Message): CustomToolInvocation | null {
  if (message.role !== 'assistant') return null;
  
  // Check if message.content is an object with parts and handle potential undefined
  if (typeof message.content === 'object' && message.content !== null) {
    const contentWithParts = message.content as { parts?: ContentPart[] };
    if (contentWithParts.parts) {
      // Type assertion for TypeScript
      const messageParts = contentWithParts.parts as unknown as ContentPart[];
      if (Array.isArray(messageParts)) {
      const toolCall = messageParts.find(part => part.type === 'tool-call') as ToolInvocationPart | undefined;
      if (toolCall) {
        return {
          toolName: toolCall.toolName,
          args: toolCall.args
        };
      }
    }
    }
  }
  
  // Check for direct parts property
  if ('parts' in message && Array.isArray(message.parts)) {
    const toolCall = message.parts.find(
      part => part && typeof part === 'object' && 'type' in part && (part as ContentPart).type === 'tool-call'
    ) as ToolInvocationPart | undefined;
    if (toolCall && 'toolName' in toolCall && 'args' in toolCall) {
      return {
        toolName: toolCall.toolName as string,
        args: toolCall.args as Record<string, any>
      };
    }
  }
  
  // Legacy fallback - use ts-ignore to avoid deprecation warnings
  // @ts-ignore - toolInvocations is deprecated
  if ('toolInvocations' in message && Array.isArray(message.toolInvocations) && message.toolInvocations.length > 0) {
    // @ts-ignore - toolInvocations is deprecated
    const toolCall = message.toolInvocations[0] as CustomToolInvocation | undefined;
    if (toolCall) {
      return {
        toolName: toolCall.toolName,
        args: toolCall.args
      };
    }
  }
  
  return null;
}

export function hasToolCall(message: Message): boolean {
  if (message.role !== 'assistant') return false;
  
  
  // Check if message.content is an object with parts and handle potential undefined
  if (typeof message.content === 'object' && message.content !== null) {
    const contentWithParts = message.content as { parts?: ContentPart[] };
    if (contentWithParts.parts) {
      const messageParts = contentWithParts.parts as unknown as ContentPart[];
      if (Array.isArray(messageParts)) {
      return messageParts.some(part => part.type === 'tool-call');
    }
  }
  
  // Check for direct parts property
  if ('parts' in message && Array.isArray(message.parts)) {
    return message.parts.some(
      part => part && typeof part === 'object' && 'type' in part && (part as ContentPart).type === 'tool-call'
    );
  }
  }
  
  // Legacy fallback - use ts-ignore to avoid deprecation warnings
  // @ts-ignore - toolInvocations is deprecated
  if ('toolInvocations' in message) {
    // @ts-ignore - toolInvocations is deprecated
    return Array.isArray(message.toolInvocations) && message.toolInvocations.length > 0;
  }
  
  return false;
}

export interface ToolCall<T = string, A = unknown> {
    id?: string;
    name?: string;
    function?: {
      name: string;
      arguments: string;
    };
    toolName?: string;
    args?: A;
  }
