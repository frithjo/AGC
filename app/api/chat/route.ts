import { geminiModel } from "../model";
import { generateText } from "ai";
import { NextRequest } from "next/server";
import { openAIModel } from "../model";
import { z } from "zod";

const XHeaders = {
  method: "GET",
  headers: {
    "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
    "x-rapidapi-host": "twitter-api45.p.rapidapi.com",
  },
};

export async function POST(req: NextRequest) {
  const { messages, prompt, tool } = await req.json();

  console.log({ messages, prompt, tool });

  const result = await generateText({
    model: openAIModel,
    system: `You are a helpful and friendly AI assistant that can search X (formerly Twitter) and answer general questions.

Current tool selected: ${tool}

Available tools:
- x: Search X for latest posts and discussions
- none: Have a general conversation without using tools
- url: fetch the content of a given URL

When the X tool is selected:
1. You MUST use the X search tool to find relevant information before responding
2. Search for relevant keywords from the user's query
3. Include key findings from X in your response
4. Cite specific posts/users when referencing information from X

When no tool is selected:
- Engage in natural conversation and answer questions using your general knowledge
- Do not use any external tools

When the url tool is selected:
- Fetch the content of the given URL
- and answer the question based on the content of the URL

Remember to:
- Be friendly and conversational in your responses
- Provide accurate and helpful information
- Clearly indicate when you are using information from X searches
`,
    prompt,
    maxSteps: 2, // Run llm call twice
    tools: {
      url: {
        description: "Search the web for information",
        parameters: z.object({
          url: z.string().describe("The URL to search for"),
        }),
        execute: async ({ url }) => {
          console.log("url tool call started", url);
          const result = await fetch(url);
          console.log("url tool call ended");
          return result.text();
        },
      },
      //   web: {
      //     description: "Search the web for information", // TODO: Add bing search tool
      //     parameters: z.object({
      //       query: z.string(),
      //     }),
      //     execute: async ({ query }) => {
      //       const result = await fetch(
      //         `https://api.example.com/search?q=${query}`
      //       );
      //       return result.json();
      //     },
      //   },
      x: {
        description: "Search X for information",
        parameters: z.object({
          query: z.string().describe("The query to search for"),
        }),
        execute: async ({ query }) => {
          const result = await fetch(
            `https://twitter-api45.p.rapidapi.com/search.php?query=${query}&search_type=Top`,
            XHeaders as any
          );
          console.log("x tool called");
          const data = await result.text();
          return data;
        },
      },
    },
  });

  const { text } = result;

  return new Response(text);
}
