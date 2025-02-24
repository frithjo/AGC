import { tool } from "ai";
import { z } from "zod";

export const getWebSearch = tool({
  description: "Search the web using Google for information",
  parameters: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    const headers = {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "google-search72.p.rapidapi.com",
    };

    try {
      const result = await fetch(
        `https://google-search72.p.rapidapi.com/search?q=${query}&lr=en-US&num=4`,
        {
          method: "GET",
          headers: headers as HeadersInit,
        }
      );
      console.log("google search called");
      const data = await result.text();
      console.log("google search data", data);
      return data;
    } catch (error) {
      console.error("Google search error:", error);
      return "Error performing Google search";
    }
  },
});
