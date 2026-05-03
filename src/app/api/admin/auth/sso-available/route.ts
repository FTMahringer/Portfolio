import { NextResponse } from 'next/server';

export async function GET() {
  const available = !!(process.env.OIDC_ISSUER && process.env.OIDC_CLIENT_ID);
  return NextResponse.json({ available });
}
