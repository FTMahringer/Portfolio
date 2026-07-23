import { NextRequest, NextResponse } from 'next/server';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_INPUT_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/gif', 'image/webp'];
const OUTPUT_EXTENSION = '.webp';

async function checkAuth(req: NextRequest): Promise<boolean> {
  const cookie = req.headers.get('cookie') ?? '';
  const match = cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!match) return false;
  const sid = match.split('=')[1];
  const session = await validateSession(sid);
  return session !== null;
}

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9-_]/gi, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

interface MediaFile {
  name: string;
  url: string;
  size: number;
  createdAt: number;
}

export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  ensureUploadDir();

  const files = fs.readdirSync(UPLOAD_DIR);
  const media: MediaFile[] = [];

  for (const name of files) {
    const ext = path.extname(name).toLowerCase();
    if (ext !== OUTPUT_EXTENSION) continue;

    const filePath = path.join(UPLOAD_DIR, name);
    const stat = fs.statSync(filePath);
    media.push({
      name,
      url: `/uploads/${name}`,
      size: stat.size,
      createdAt: stat.mtime.getTime(),
    });
  }

  media.sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json({ media });
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  ensureUploadDir();

  const formData = await req.formData();
  const files = formData.getAll('files') as File[];

  if (!files.length) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }

  const saved: MediaFile[] = [];

  for (const file of files) {
    if (!ALLOWED_INPUT_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const baseName = sanitizeFilename(file.name) || 'image';
    const filename = `${baseName}-${Date.now()}${OUTPUT_EXTENSION}`;
    const dest = path.join(UPLOAD_DIR, filename);

    try {
      await sharp(buffer, { animated: file.type === 'image/gif' })
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(dest);
    } catch (err) {
      console.error('[media] conversion error', err);
      return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
    }

    const stat = fs.statSync(dest);
    saved.push({
      name: filename,
      url: `/uploads/${filename}`,
      size: stat.size,
      createdAt: stat.mtime.getTime(),
    });
  }

  return NextResponse.json({ media: saved });
}

export async function DELETE(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  if (!name) {
    return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  }

  const safeName = path.basename(name);
  const filePath = path.join(UPLOAD_DIR, safeName);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  fs.unlinkSync(filePath);
  return NextResponse.json({ success: true });
}
