import { getModel } from "../model";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import { getXSearch } from "@/tools/x";
import { getWebSearch } from "@/tools/web";
import { getFetch } from "@/tools/fetch";
import { doFileSearch } from "@/tools/file-search";

export async function POST(req: NextRequest) {
  const { tool, messages, model } = await req.json();

  console.log({ tool, model });

  const result = streamText({
    model: getModel(model),
    messages,
    system: getSystemPrompt(tool),
    tools: {
      web: getWebSearch,
      x: getXSearch,
      url: getFetch,
      fileSearch: doFileSearch,
    },
    experimental_activeTools: ["web", "x", "url", "fileSearch"],
    // toolChoice: tool === "none" ? "auto" : tool,
    maxSteps: 3, // can be overwritten by useChat hook
    onStepFinish(event) {
      console.log("--------------STEP FINISH------------------");
      console.log(event);
      console.log("--------------------------------");
    },
  });

  return result.toDataStreamResponse();
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
- notes: Read notes and return the text.
- fileSearch: Search the vectorStore for relevant information.

When the X tool is selected:
1. You MUST use the X search tool to find relevant information before responding.
2. Search for key terms from the user's query.
3. Include specific posts or findings in your response.

When the web tool is selected:
1. You MUST use web search exclusively to find relevant information.
2. Search using the user’s query and include key findings with proper citations.
3. DO NOT use the X search tool when the web tool is selected.

When no tool is selected:
- Provide a direct response based on your internal knowledge.

When the url tool is selected:
- Fetch and use the content from the provided URL.

When the notes tool is selected:
- Read the notes and return their text.

Remember:
- Always check the vectorStore for a matching answer first.
- Clearly explain any similarity scores and their relevance.
- Be friendly, accurate, and concise.
`;
}
