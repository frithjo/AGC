// src/app/api/logs/client/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '/AGC/src/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the log data
    if (!body.level || !body.category) {
      return NextResponse.json(
        { error: 'Invalid log data' }, 
        { status: 400 }
      );
    }
    
    // Create a structured log entry
    const logEntry = {
      level: body.level,
      category: body.category,
      message: body.message || 'Client log',
      context: {
        ...body.context,
        userAgent: req.headers.get('user-agent'),
        ip: req.ip || req.headers.get('x-forwarded-for'),
        source: 'client',
      },
      data: body.data,
      error: body.error,
      timestamp: new Date().toISOString(),
    };
    
    // Use the appropriate log level
    switch (body.level) {
      case 'trace':
        logger.trace(logEntry.message, { ...logEntry, message: undefined });
        break;
      case 'debug':
        logger.debug(logEntry.message, { ...logEntry, message: undefined });
        break;
      case 'info':
        logger.info(logEntry.message, { ...logEntry, message: undefined });
        break;
      case 'warn':
        logger.warn(logEntry.message, { ...logEntry, message: undefined });
        break;
      case 'error':
        logger.error(logEntry.message, body.error, { ...logEntry, message: undefined, error: undefined });
        break;
      case 'fatal':
        logger.fatal(logEntry.message, body.error, { ...logEntry, message: undefined, error: undefined });
        break;
      default:
        logger.info(logEntry.message, { ...logEntry, message: undefined });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error processing client log', error);
    return NextResponse.json(
      { error: 'Failed to process log' }, 
      { status: 500 }
    );
  }
}