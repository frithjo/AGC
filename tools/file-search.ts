import { tool } from "ai";
import { z } from "zod";
import { supabaseServiceRole } from "@/lib/supabase";
import { generateEmbeddings } from "@/create-embedding";

export const doFileSearch = tool({
  description: "Search for files in the vector database using pgvector.",
  parameters: z.object({
    prompt: z.string().describe("The search query"),
  }),
  execute: async ({ prompt }) => {
    const promptEmbedding = await generateEmbeddings(prompt);

    console.log("promptEmbedding", promptEmbedding);

    const { data, error } = await supabaseServiceRole.rpc("match_documents", {
      query_embedding: promptEmbedding[0].embedding,
      similarity_threshold: 0.8,
      match_count: 5,
      doc_id: null,
    });

    console.log("data", data);

    if (error) {
      console.error("Vector search error:", error);
      throw new Error("Error searching the vector store.");
    }

    return { results: data };
  },
});
