import { geminiModel } from "../model";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import { openAIModel } from "../model";
import { getXSearch } from "@/tools/x";
import { getWebSearch } from "@/tools/web";
import { getFetch } from "@/tools/fetch";

export async function POST(req: NextRequest) {
  const { tool, messages, model } = await req.json();

  console.log({ tool });

  const result = streamText({
    model: model === "openai" ? openAIModel : geminiModel,
    messages,
    system: `You are a helpful and friendly AI assistant that can search X (formerly Twitter), search the web using Bing or Google, and answer general questions.

Current tool selected: ${tool}

Available tools:
- x: Search X for latest posts and discussions
- web: Search the web using Google for information
- none: Think carefully about the user's prompt and determine if external tools would be helpful. If not needed, use your knowledge to provide a direct response.
- url: fetch the content of a given URL

When the X tool is selected:
1. You MUST use the X search tool to find relevant information before responding
2. Search for relevant keywords from the user's query
3. Include key findings from X in your response
4. Cite specific posts/users when referencing information from X

When the web tool is selected:
1. You MUST use the web search tool to find relevant information before responding
2. Search for relevant keywords from the user's query using web tool only
3. Include key findings from web search in your response
4. Cite sources when referencing information
5. DO NOT use X search tool when web tool is selected

When no tool is selected:
- Engage in natural conversation and answer questions using your general knowledge
- Do not use any external tools

When the url tool is selected:
- Fetch the content of the given URL
- and answer the question based on the content of the URL

Remember to:
- Be friendly and conversational in your responses
- Provide accurate and helpful information
- Clearly indicate when you are using information from searches
- When web tool is selected, strictly use only web search and not X search
`,
    tools: {
      web: getWebSearch,
      x: getXSearch,
      url: getFetch,
    },
  });

  return result.toDataStreamResponse();
}
