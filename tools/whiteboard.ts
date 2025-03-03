import { tool } from "ai";
import { z } from "zod";
import OpenAI from "openai";

export const analyzeWhiteboard = (imageUrl: string) => {
  return tool({
    description: "Analyze whiteboard images and extract information from them",
    parameters: z.object({
      query: z.string().describe("User query about the whiteboard image"),
    }),
    execute: async ({ query }) => {
      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: query,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        });

        return {
          analysis: response.choices[0].message.content,
          success: true,
        };
      } catch (error) {
        console.error("Whiteboard analysis error:", error);
        return {
          analysis: "Error analyzing whiteboard image",
          success: false,
        };
      }
    },
  });
};
