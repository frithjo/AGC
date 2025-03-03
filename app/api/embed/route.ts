import { generateEmbeddings } from "@/create-embedding";
import { supabaseServiceRole } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const embeddings = await generateEmbeddings(text);

    const { error } = await supabaseServiceRole.from("documents").insert(
      embeddings.map((e) => ({
        content: e.content,
        embedding: e.embedding,
      }))
    );

    if (error) {
      console.error("Error inserting embeddings:", error);
      return NextResponse.json(
        { error: "Failed to insert embeddings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ embeddings, error, message: "success" });
  } catch (error) {
    console.error("Error generating embeddings:", error);
    return NextResponse.json(
      { error: "Failed to generate embeddings" },
      { status: 500 }
    );
  }
}

/*
To call this API endpoint using curl:

curl -X POST \
  http://localhost:3000/api/embed \
  -H "Content-Type: application/json" \
  -d '{"text": "Elon Musk is the richest person in the world and he has 100 kids , 10 wife lol"}'

Replace 'localhost:3000' with your actual domain if deployed.
*/
