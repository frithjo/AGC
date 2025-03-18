// src/app/api/embed/route.ts
import { generateEmbeddings } from "@/create-embedding";
import { NextRequest, NextResponse } from "next/server";
import { embedLogger } from "../../../lib/logger/embed-logger";
import { supabaseServiceRole } from "../../../lib/supabase";
import { performance } from "perf_hooks";

export async function POST(req: NextRequest) {
  // Create a request-specific logger
  const { logger, endRequest } = embedLogger.child({});
  const startTime = performance.now();

  try {
    // Parse request
    const { text } = await req.json();
    
    // Log embedding generation start
    logger.logEmbeddingStart(text);

    // Generate embeddings
    const embeddings = await generateEmbeddings(text);
    
    // Log successful embedding generation
    const embeddingTime = Math.round(performance.now() - startTime);
    logger.logEmbeddingGenerated(embeddings, embeddingTime);

    // Log database operation start
    const dbStartTime = performance.now();
    logger.logDatabaseOperation("insert", "documents", embeddings);

    // Insert into database
    const { error } = await supabaseServiceRole.from("documents").insert(
      embeddings.map((e) => ({
        content: e.content,
        embedding: e.embedding,
      }))
    );

    // Handle database errors
    if (error) {
      logger.logDatabaseError("insert", "documents", error);
      endRequest(500);
      return NextResponse.json(
        { error: "Failed to insert embeddings" },
        { status: 500 }
      );
    }

    // Log successful database insertion
    const dbDuration = Math.round(performance.now() - dbStartTime);
    logger.logDatabaseInsertResult("documents", embeddings.length, dbDuration);
    
    // Log overall request completion
    const totalDuration = Math.round(performance.now() - startTime);
    logger.extendContext({ duration: totalDuration });
    endRequest(200);

    // Return success response
    return NextResponse.json({ 
      embeddings, 
      message: "success",
      count: embeddings.length,
    });
  } catch (error) {
    // Log embedding error
    logger.logEmbeddingError(error as Error);
    
    // Mark request as failed
    endRequest(500);
    
    // Return error response
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
