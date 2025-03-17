import { NextRequest } from "next/server";
import { streamText } from "ai";
import { getModel, isValidModel } from "../model";
import type { Model } from "@/components/chat/chat-ui";
import { getXSearch } from "@/tools/x";
import { getWebSearch } from "@/tools/web";
import { getFetch } from "@/tools/fetch";
import { doFileSearch } from "@/tools/file-search";
import { getNotes } from "@/tools/notes";
import { analyzeWhiteboard } from "@/tools/whiteboard";

export async function POST(req: NextRequest) {
  const { tool, messages, model, notes, image } = await req.json();

  // Validate model first
  if (!isValidModel(model)) {
    return new Response('Invalid model', { status: 400 });
  }

  console.log({
    tool,
    model,
    notes: tool === "notes" ? notes : "",
    image: tool === "whiteboard" ? image : "",
  });

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
        console.log("--------------STEP FINISH------------------");
        console.log(event);
        console.log("--------------------------------");
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response('Internal Server Error', { status: 500 });
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