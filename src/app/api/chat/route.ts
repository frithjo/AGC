// src/app/api/chat/route.ts
import { NextRequest } from "next/server";
import { streamText } from "ai";
import { getModel, isValidModel } from "../model";
import { getXSearch } from "@/tools/x";
import { getWebSearch } from "@/tools/web";
import { getFetch } from "@/tools/fetch";
import { doFileSearch } from "@/tools/file-search";
import { getNotes } from "@/tools/notes";
import { analyzeWhiteboard } from "@/tools/whiteboard";
import { chatLogger } from "@/lib/logger/chat-logger";
import { createStreamErrorResponse } from "@/lib/logger/stream-error-handler";

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const startTime = performance.now();

  try {
    // Parse request
    const { tool, messages, model, notes, image } = await req.json();
    
    // Log request details
    chatLogger.logChatStart({
      tool,
      model,
      messages,
      hasNotes: !!notes,
      hasImage: !!image,
    });

    // Validate model first
    if (!isValidModel(model)) {
      chatLogger.logModelValidationError(model);
      
      chatLogger.error(`Request failed: Invalid model ${model}`, {
        statusCode: 400,
        durationMs: Math.round(performance.now() - startTime),
      });
      
      return new Response('Invalid model', { status: 400 });
    }

    // Log tool request details
    chatLogger.debug("Processing chat request", {
      tool,
      model,
      notesProvided: tool === "notes" ? !!notes : false,
      imageProvided: tool === "whiteboard" ? !!image : false,
    });

    // Use try/catch to handle streaming errors
    try {
      const result = await streamText({
        model: getModel(model),
        messages,
        system: getSystemPrompt(tool),
        tools: {
          web: getWebSearch,
          x: getXSearch,
          url: getFetch,
          fileSearch: doFileSearch,
          notes: getNotes(notes),
          whiteboard: analyzeWhiteboard(image),
        },
        experimental_activeTools: [
          "web",
          "x",
          "url",
          "fileSearch",
          "notes",
          "whiteboard",
        ],
        maxSteps: 3,
        onStepFinish(event) {
          // Log each tool execution step
          chatLogger.logStepCompletion(event);
        },
      });

      // Log successful processing
      chatLogger.info("Chat stream ready for transmission", {
        duration: Math.round(performance.now() - startTime),
      });
      
      // Start tracking the stream
      chatLogger.logStreamStart();
      
      // Wrap the stream response to add logging for stream progress and completion
      const response = result.toDataStreamResponse();
      
      // Attach logger info to the response headers for tracking
      const enhancedResponse = new Response(response.body, response);
      enhancedResponse.headers.set('x-request-id', requestId);
      enhancedResponse.headers.set('x-tool', tool);
      enhancedResponse.headers.set('x-model', model);
      
      // Log completion of the request
      chatLogger.info(`Request completed: ${req.method} ${req.nextUrl.pathname}`, {
        statusCode: 200,
        durationMs: Math.round(performance.now() - startTime),
      });
      
      return enhancedResponse;
    } catch (streamError) {
      // Handle stream processing errors
      chatLogger.logStreamError(streamError as Error, 0);
      
      // Return a stream error response
      return createStreamErrorResponse(streamError as Error, {
        tool,
        model,
        processingTime: Math.round(performance.now() - startTime),
      });
    }
  } catch (error) {
    // Log general errors
    chatLogger.error("Error processing chat request", error as Error);
    
    chatLogger.error(`Request failed: ${req.method} ${req.nextUrl.pathname}`, {
      statusCode: 500,
      durationMs: Math.round(performance.now() - startTime),
    });
    
    // Return a generic error response
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      requestId 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
      }
    });
  }
}

function getSystemPrompt(tool: string) {
  return `You are a helpful and friendly AI assistant that prioritizes checking the vector database (vectorStore) for relevant answers before using any other tool. Always begin by searching the vectorStore to see if there is a close match to the query using similarity scores.

Current tool selected: ${tool}

When the fileSearch tool is selected:
1. You MUST first use the fileSearch tool to search the vectorStore for relevant information.
2. Base your response primarily on the vectorStore results, and explain the similarity scores and their implications.
3. If the vector search returns no useful results, mention this and suggest refining the search query.
4. DO NOT use any other tools when fileSearch is selected.

Available tools:
- x: Search X for the latest posts and discussions.
- web: Search the web using Google.
- none: Use your internal knowledge to answer directly.
- url: Fetch the content of a given URL.
- notes: Read, analyze, and update notes content.
- fileSearch: Search the vectorStore for relevant information.

When the X tool is selected:
1. You MUST use the X search tool to find relevant information before responding.
2. Search for key terms from the user's query.
3. Include specific posts or findings in your response.

When the web tool is selected:
1. You MUST use web search exclusively to find relevant information.
2. Search using the user's query and include key findings with proper citations.
3. DO NOT use the X search tool when the web tool is selected.

When no tool is selected:
- Provide a direct response based on your internal knowledge.

When the url tool is selected:
- Fetch and use the content from the provided URL.

When the notes tool is selected:
1. You can perform two types of actions:
   - Read and analyze existing notes content
   - Update notes with new content
2. When reading:
   - Analyze the notes content in relation to the user's query
   - Provide precise and relevant information from the notes
   - Include analysis and explanations as needed
3. When updating:
   - Modify the notes content as requested
   - Confirm successful updates
4. Always provide clear feedback about the action taken and its result

Remember:
- Always check the vectorStore for a matching answer first.
- Clearly explain any similarity scores and their relevance.
- Be friendly, accurate, and concise.
`;
}