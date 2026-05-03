import { NextResponse } from 'next/server';
import { db } from '@/db';
import { oidcProviders } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const envConfigured = !!(process.env.OIDC_ISSUER && process.env.OIDC_CLIENT_ID);

  const dbProviders = await db
    .select({ id: oidcProviders.id, name: oidcProviders.name, type: oidcProviders.type })
    .from(oidcProviders)
    .where(eq(oidcProviders.enabled, 1));

  const providers: { id: string; name: string; type: string }[] = [
    ...dbProviders.map(p => ({ id: String(p.id), name: p.name, type: p.type })),
    ...(envConfigured ? [{ id: 'env', name: 'SSO', type: 'oidc' }] : []),
  ];

  return NextResponse.json({ available: providers.length > 0, providers });
}
