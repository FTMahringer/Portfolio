import { NextRequest, NextResponse } from 'next/server';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { deleteTag, getTagUsage, getTagBySlug } from '@/lib/tags';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function requireAuth(req: NextRequest) {
  const cookie = req.headers.get('cookie') ?? '';
  const match = cookie.split(';').map(c => c.trim()).find(c => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!match) return false;
  const sid = match.split('=')[1];
  return (await validateSession(sid)) !== null;
}

// GET /api/admin/tags/[id] — get tag + usage
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const rows = await db.select().from(tags).where(eq(tags.id, Number(id))).limit(1);
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const tag = rows[0];
  const usage = getTagUsage(tag.name);
  return NextResponse.json({ tag, usage });
}

// DELETE /api/admin/tags/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await deleteTag(Number(id));
  return NextResponse.json({ ok: true });
}
