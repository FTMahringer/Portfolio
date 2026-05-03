import { NextRequest, NextResponse } from 'next/server';
import { adminMiddleware } from '@/lib/proxy';

export function middleware(request: NextRequest) {
  const result = adminMiddleware(request);
  return result ?? NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
