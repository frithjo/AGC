// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import Logger from '@/lib/logger';

export async function middleware(req: NextRequest) {
  // Skip logging for static assets
  if (shouldSkipLogging(req)) {
    return NextResponse.next();
  }

  // Generate request ID if not present
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  
  // Start timing the request
  const startTime = performance.now();
  
  // Create response
  const response = NextResponse.next();
  
  // Add request ID to response headers for correlation
  response.headers.set('x-request-id', requestId);
  
  // Add basic timing information
  const duration = Math.round(performance.now() - startTime);
  response.headers.set('server-timing', `request;dur=${duration}`);
  
  return response;
}

// Configure which paths to apply the middleware to
export const config = {
  matcher: [
    // Apply to API routes and main pages
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

/**
 * Determines if a request should be skipped for logging
 */
function shouldSkipLogging(req: NextRequest): boolean {
  const path = req.nextUrl.pathname;
  
  // Skip static assets
  if (path.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|map)$/i)) {
    return true;
  }
  
  // Skip Next.js internal routes
  if (path.startsWith('/_next/')) {
    return true;
  }
  
  // Skip health check endpoints
  if (path === '/api/health' || path === '/health') {
    return true;
  }
  
  return false;
}