import { generateText, tool } from "ai";
import { z } from "zod";
import { models } from "@/app/api/model";

export const analyzeWhiteboard = (imageUrl: string) => {
  return tool({
    description: "Analyze whiteboard images and extract information from them",
    parameters: z.object({
      query: z.string().describe("User query about the whiteboard image"),
    }),
    execute: async ({ query }) => {
      try {
        const response = await generateText({
          model: models.openai,
          system:
            "You are a helpful assistant that can analyze whiteboard images and extract information from them.",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: query,
                },
                {
                  type: "image",
                  image: new URL(imageUrl),
                },
              ],
            },
          ],
        });

        return {
          analysis: response.text,
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

// All tools work with DeepSeek models if they implement:
interface ToolSupport {
  web: true;
  x: true;
  url: true;
  fileSearch: true;
  notes: true;
  whiteboard: true;
}