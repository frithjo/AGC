import { geminiModel } from "../model";
import { streamText } from "ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, prompt, tool } = await req.json();

  const { text } = streamText({
    model: geminiModel,
    prompt,
  });

  return await text;
}
