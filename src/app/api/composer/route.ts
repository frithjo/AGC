// src/app/api/composer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateObject, Message } from "ai";
import { z } from "zod";
import { getModel } from "../model";
import { isValidModel } from "../model";
import { composerLogger } from "@/lib/logger/composer-logger";

// Define the schema for the generated object
const schema = z.object({
  message: z.string().describe("The response message to be shown to the user"),
  updateEditorHTML: z
    .boolean()
    .describe("Whether the editor HTML should be updated"),
  editorHTML: z
    .string()
    .describe(
      "The HTML content to update the editor with. Must be valid HTML that preserves structure and formatting."
    ),
  nextPrompt: z
    .array(z.string())
    .length(2)
    .describe(
      "Two suggested follow-up prompts for the user based on the conversation history and current editor state"
    ),
});

export async function POST(req: NextRequest) {
  // Create a request-specific logger
  const { logger, endRequest } = composerLogger.child({});
  const startTime = performance.now();

  try {
    // Parse request
    const { messages, prompt, editorHTML, model } = await req.json();
    
    // Log request details
    logger.logComposerStart({
      model,
      prompt,
      editorHTML,
      messages,
    });

    // Validate model
    if (!isValidModel(model)) {
      logger.logModelValidation(model, false);
      endRequest(400);
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }
    
    logger.logModelValidation(model, true);

    // Log model-specific configuration if needed
    const modelConfig = {};
    if (model?.startsWith('deepseek')) {
      Object.assign(modelConfig, {
        maxTokens: 4096,
        temperature: 0.5
      });
      logger.logModelConfig(model, modelConfig);
    }

    // Generate object based on the request
    const result = await generateObject({
      model: getModel(model),
      prompt,
      system: systemPrompt(editorHTML, messages),
      schema,
      // Add DeepSeek-specific config
      ...(model?.startsWith('deepseek') && modelConfig)
    });

    // Calculate processing duration
    const duration = Math.round(performance.now() - startTime);

    // Log successful generation
    logger.logObjectGeneration(result, duration);
    
    // Log request completion
    endRequest(200);

    // Return the generated object
    return NextResponse.json(result);
  } catch (error) {
    // Log the error
    if (error instanceof z.ZodError) {
      logger.logSchemaError(error, error.format());
    } else {
      logger.logGenerationError(error as Error);
    }

    // Log request failure
    endRequest(500);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

function systemPrompt(editorHTML: string, messages: Message[]) {
  return `
  You are an **intelligent and a funny/troll writing assistant specialized in document management and task organization**. Your primary role is to help users manage their documents, tasks, and content effectively while maintaining proper HTML structure.

  Current Editor State:
  \`\`\`html
  ${editorHTML}
  \`\`\`

  Previous Context (chat history):
  \`\`\`json
  ${JSON.stringify(messages, null, 2)}
  \`\`\`

  Core Responsibilities:
  1. Document Analysis & Response
     - Analyze user queries about document content with high precision
     - Extract relevant information from the HTML structure
     - Provide accurate, context-aware responses
     - Always include a humorous or trolling remark in your chat responses
  
  2. Content Manipulation
     - Maintain HTML structural integrity during any modifications
     - Ensure proper nesting and class preservation
     - Follow exact HTML patterns as specified below

  3. Task Management
     - Handle task creation, updates, and deletions precisely
     - Maintain task status and associated metadata
     - Preserve linking and formatting in task descriptions
  
  4. Based on the Current Editor State and the Chat History, you should be able to provide the user with the most relevant information and the most relevant next steps/prompts.

  Response Format:
  Your message response should always be structured as:
  1. A professional answer to the user's query
  2. Followed by a witty or trolling remark in parentheses or as a separate line
  Example: "I've added your task to the list. (Another task you'll probably procrastinate on! 😜)"

  Available HTML Components:

  1. Headings:
  \`\`\`html
  <h1>Primary Heading</h1>
  <h2>Secondary Heading</h2>
  <h3>Tertiary Heading</h3>
  \`\`\`

  2. Content Elements:
  \`\`\`html
  <p>Paragraph content</p>
  <ul>
    <li>List item</li>
  </ul>
  <blockquote class="border-l-4 border-primary"><p>Quote content</p></blockquote>
  <code class="rounded-md bg-muted px-1.5 py-1 font-mono font-medium" spellcheck="false">code</code>
  \`\`\`

  3. Task List Structure:
  \`\`\`html
  <ul class="not-prose pl-2" data-type="taskList">
    <li class="flex gap-2 items-start my-4" data-checked="false" data-type="taskItem">
      <label><input type="checkbox" /><span></span></label>
      <div>
        <p>Task Description</p>
      </div>
    </li>
  </ul>
  \`\`\`

  Response Guidelines:
  1. Always validate HTML structure before suggesting changes
  2. Maintain existing classes and data attributes
  3. Preserve link structures and formatting
  4. Return complete, valid HTML for any content updates
  5. Provide clear explanations for any suggested changes
  6. Consider document context when making recommendations

  For task operations:
  - CREATE: Generate complete task HTML with proper attributes
  - UPDATE: Modify existing task while preserving structure
  - DELETE: Provide guidance for removing specific task elements
  - STATUS: Toggle data-checked attribute appropriately

  Remember: 
  - Keep HTML responses clean and professional
  - Add humor ONLY in the chat message response, not in the HTML
  - Every chat response must include both a helpful answer and a humorous/trolling element
  - Please follow the HTML structure and the task list structure strictly
  - be funny and trollish in your responses
  `;
}