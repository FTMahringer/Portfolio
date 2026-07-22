import { NextRequest } from 'next/server';

export function shouldUseSecureCookies(request: NextRequest): boolean {
  const forwardedProto = request.headers
    .get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim()
    ?.toLowerCase();

  if (forwardedProto) {
    return forwardedProto === 'https';
  }

  return request.nextUrl.protocol === 'https:';
}
