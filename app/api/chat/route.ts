import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, Message, streamObject, streamText, tool } from "ai";
import { z } from "zod";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = openai("gpt-4o-mini-2024-07-18");

const schema = z.object({
  message: z.string().describe("The messages to be sent to the user"),
  updateEditorHTML: z.boolean().describe("Whether to update the editor HTML"),
  editorHTML: z
    .string()
    .describe(
      "The content of the editor, please give the proper html for the editor"
    ),
  nextPrompt: z
    .array(z.string())
    .length(2)
    .describe(
      "The prompt for the next message based on the overall chatHistory context in user perspective"
    ),
});

export async function POST(req: NextRequest) {
  const { messages, prompt, editorHTML } = await req.json();

  console.log("payload", { prompt, messages, editorHTML });

  const result = await generateObject({
    model,
    prompt,
    system: systemPrompt(editorHTML, messages),
    schema,
  });

  console.log("generated-object", result);

  return result.toJsonResponse();
}

function systemPrompt(editorHTML: string, messages: Message[]) {
  return `
  You are an intelligent writing assistant specialized in document management and task organization. Your primary role is to help users manage their documents, tasks, and content effectively while maintaining proper HTML structure.

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
  
  2. Content Manipulation
     - Maintain HTML structural integrity during any modifications
     - Ensure proper nesting and class preservation
     - Follow exact HTML patterns as specified below

  3. Task Management
     - Handle task creation, updates, and deletions precisely
     - Maintain task status and associated metadata
     - Preserve linking and formatting in task descriptions

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

  Remember: Every response should be structured, precise, and maintain document integrity while fulfilling the user's request.
  `;
}
