import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { oidcProviders } from '@/db/schema';
import { requireAdminSession } from '@/lib/session';

export async function GET() {
  await requireAdminSession();

  const providers = await db.select().from(oidcProviders);
  const masked = providers.map(p => ({ ...p, clientSecret: '***' }));
  return NextResponse.json(masked);
}

export async function POST(req: NextRequest) {
  await requireAdminSession();

  const body = await req.json() as {
    name: string;
    type: string;
    issuerUrl: string;
    clientId: string;
    clientSecret: string;
    redirectUri?: string;
    allowedEmail?: string;
    enabled?: number;
  };

  const { name, type, issuerUrl, clientId, clientSecret, redirectUri, allowedEmail, enabled } = body;

  if (!name || !type || !issuerUrl || !clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const [provider] = await db.insert(oidcProviders).values({
    name,
    type,
    issuerUrl,
    clientId,
    clientSecret,
    redirectUri: redirectUri ?? null,
    allowedEmail: allowedEmail ?? null,
    enabled: enabled ?? 1,
  }).returning();

  return NextResponse.json({ ...provider, clientSecret: '***' }, { status: 201 });
}
