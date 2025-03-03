import { Model } from "@/components/chat/chat-ui";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gemini = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const models = {
  openai: openai("gpt-4o-mini-2024-07-18"),
  gemini: gemini("gemini-1.5-flash-latest"),
  embeddingModel: openai.embedding("text-embedding-3-small"),
} as const;

export function getModel(model: Model) {
  return models[model];
}
