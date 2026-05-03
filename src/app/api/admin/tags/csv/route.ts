import { NextRequest, NextResponse } from 'next/server';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { getAllTagsFromDb, importTagsFromCsv } from '@/lib/tags';

async function requireAuth(req: NextRequest) {
  const cookie = req.headers.get('cookie') ?? '';
  const match = cookie.split(';').map(c => c.trim()).find(c => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!match) return false;
  const sid = match.split('=')[1];
  return (await validateSession(sid)) !== null;
}

// GET — export all tags as CSV
export async function GET(req: NextRequest) {
  if (!await requireAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const allTags = await getAllTagsFromDb();
  const csv = ['# Portfolio tags export', '# name', ...allTags.map(t => t.name)].join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="tags.csv"',
    },
  });
}

// POST — import tags from CSV body (text/plain or application/octet-stream)
export async function POST(req: NextRequest) {
  if (!await requireAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const csv = await req.text();
    if (!csv.trim()) return NextResponse.json({ error: 'Empty CSV' }, { status: 400 });
    const result = await importTagsFromCsv(csv);
    return NextResponse.json(result);
  } catch (e) {
    console.error('POST /api/admin/tags/csv', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
