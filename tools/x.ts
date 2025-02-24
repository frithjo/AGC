import { tool } from "ai";
import { z } from "zod";

export const getXSearch = tool({
  description: "Search X (formerly Twitter) for information",
  parameters: z.object({
    query: z.string().describe("The query to search for"),
  }),
  execute: async ({ query }) => {
    const headers = {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "twitter-api45.p.rapidapi.com",
    };

    const response = await fetch(
      `https://twitter-api45.p.rapidapi.com/search.php?query=${query}&search_type=Top`,
      {
        method: "GET",
        headers: headers as HeadersInit,
      }
    );

    const data = await response.text();
    return data;
  },
});
