import { getModel } from "@/app/api/model";
import { generateText, tool } from "ai";
import { z } from "zod";

export const getNotes = (notesData: string) => {
  return tool({
    description:
      "Read notes and return the text or update notes based on user request.",
    parameters: z.object({
      query: z
        .string()
        .describe(
          "User query about notes - can be a request to read, analyze, or modify notes"
        ),
      action: z
        .enum(["read", "update"])
        .describe("Whether to read or update the notes"),
      updatedContent: z
        .string()
        .optional()
        .describe("New content if notes need to be updated"),
    }),
    execute: async ({ query, action, updatedContent }) => {
      if (action === "read") {
        const response = await generateText({
          model: getModel("openai"),
          system: `
          You are a document analysis assistant that helps users understand their notes.
          Analyze the following notes and respond to the user's query.
          Be precise and extract only relevant information from the notes.
          `,
          prompt: `
          Notes content:
          ${notesData}
          
          User query: ${query}
          
          Provide a concise response addressing the query based on the notes content.
          `,
        });

        return {
          notes: notesData,
          analysis: response,
          updated: false,
        };
      } else if (action === "update" && updatedContent) {
        // Return the updated content for the application to handle
        return {
          notes: updatedContent,
          message: "Notes have been updated successfully.",
          updated: true,
        };
      }

      return {
        notes: notesData,
        message: "No valid action specified or missing required parameters.",
        updated: false,
      };
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