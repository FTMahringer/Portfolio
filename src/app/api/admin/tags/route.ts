import { NextRequest, NextResponse } from 'next/server';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { syncAndGetAllTags, createTag, deleteTag } from '@/lib/tags';

async function requireAuth(req: NextRequest) {
  const cookie = req.headers.get('cookie') ?? '';
  const match = cookie.split(';').map(c => c.trim()).find(c => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!match) return false;
  const sid = match.split('=')[1];
  return (await validateSession(sid)) !== null;
}

// GET — list all tags (sync from content first)
export async function GET(req: NextRequest) {
  if (!await requireAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const allTags = await syncAndGetAllTags();
    return NextResponse.json(allTags);
  } catch (e) {
    console.error('GET /api/admin/tags', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST — create a tag manually
export async function POST(req: NextRequest) {
  if (!await requireAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { name } = await req.json();
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    const tag = await createTag(name.trim());
    return NextResponse.json(tag, { status: 201 });
  } catch (e) {
    console.error('POST /api/admin/tags', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// DELETE — delete a tag by id (body: { id: number })
export async function DELETE(req: NextRequest) {
  if (!await requireAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await req.json();
    if (!id || typeof id !== 'number') return NextResponse.json({ error: 'id required' }, { status: 400 });
    await deleteTag(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/admin/tags', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
