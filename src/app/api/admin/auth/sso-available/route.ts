import { NextResponse } from 'next/server';
import { db } from '@/db';
import { oidcProviders } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const envConfigured = !!(process.env.OIDC_ISSUER && process.env.OIDC_CLIENT_ID);

  if (envConfigured) {
    return NextResponse.json({ available: true });
  }

  const [dbProvider] = await db
    .select()
    .from(oidcProviders)
    .where(eq(oidcProviders.enabled, 1))
    .limit(1);

  return NextResponse.json({ available: !!dbProvider });
}
