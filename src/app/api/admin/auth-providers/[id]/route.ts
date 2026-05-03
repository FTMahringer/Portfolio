import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { oidcProviders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdminSession } from '@/lib/session';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdminSession();

  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const body = await req.json() as Partial<{
    name: string;
    type: string;
    issuerUrl: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string | null;
    allowedEmail: string | null;
    enabled: number;
  }>;

  const updates: Partial<typeof body> = { ...body };
  if (updates.clientSecret === '***') {
    delete updates.clientSecret;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const [updated] = await db
    .update(oidcProviders)
    .set(updates)
    .where(eq(oidcProviders.id, numericId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  return NextResponse.json({ ...updated, clientSecret: '***' });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdminSession();

  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const [deleted] = await db
    .delete(oidcProviders)
    .where(eq(oidcProviders.id, numericId))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
