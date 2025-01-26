import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = openai("gpt-4o-mini-2024-07-18");

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const result = streamText({
    model,
    messages,
    system: "You are a helpful assistant.",
    maxSteps: 2,
    tools: {},
    toolCallStreaming: true,
  });

  return result.toDataStreamResponse();
}
