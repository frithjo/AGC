// src/app/api/log-client-error/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { LogCategory } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    // Parse the client error data
    const errorData = await req.json();
    
    // Create a request ID if not provided
    const requestId = req.headers.get('x-request-id') || errorData.errorId || crypto.randomUUID();
    
    // Log the client error with the stream category
    const streamLogger = logger.child({
      requestId,
      clientError: true,
      errorType: errorData.errorType,
      errorId: errorData.errorId,
      userAgent: req.headers.get('user-agent'),
      referer: req.headers.get('referer'),
    }, LogCategory.STREAM);
    
    // Log as an error
    streamLogger.error('Client-side stream error reported', {
      message: errorData.message,
      stack: errorData.stack,
      timestamp: errorData.timestamp,
    });
    
    // Return success with minimal data
    return NextResponse.json({ 
      success: true,
      logged: true,
      errorId: errorData.errorId,
    });
  } catch (error) {
    // Log the error in processing the client error
    logger.error('Error processing client error report', error as Error);
    
    // Return minimal error response
    return NextResponse.json({ 
      success: false,
      message: 'Failed to log error' 
    }, { 
      status: 500 
    });
  }
}