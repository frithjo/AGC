import { embedMany } from "ai";
import { models } from "./app/api/model";

export async function generateEmbeddings(text: string) {
  const chunks = text
    .trim()
    .split(".")
    .filter((c) => c);

  const { embeddings } = await embedMany({
    model: models.embeddingModel,
    values: chunks,
  });

  const e = embeddings.map((vec, i) => ({
    content: chunks[i],
    embedding: vec,
  }));

  return e;
}
