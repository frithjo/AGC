import { Model } from "@/components/chat/chat-ui";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function isValidModel(model: string): model is Model {
  return ['openai','gemini','deepseek-chat','deepseek-reasoner'].includes(model);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
