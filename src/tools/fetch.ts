import { tool } from "ai";
import { z } from "zod";

export const getFetch = tool({
  description: "Fetch content from a URL",
  parameters: z.object({
    url: z.string().describe("The URL to fetch content from"),
  }),
  execute: async ({ url }) => {
    try {
      console.log("url fetch started", url);
      const response = await fetch(url);
      const text = await response.text();
      console.log("url fetch completed");
      return text;
    } catch (error) {
      console.error("URL fetch error:", error);
      return "Error fetching URL content";
    }
  },
});

interface ToolSupport {
  web: true;
  x: true;
  url: true;
  fileSearch: true;
  notes: true;
  whiteboard: true;
}