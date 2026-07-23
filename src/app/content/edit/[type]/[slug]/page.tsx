import { notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/session';

const VALID_TYPES = ['blog', 'projects', 'experience'] as const;
type ContentType = typeof VALID_TYPES[number];

export const metadata = { title: 'Edit Content | Dev' };

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}) {
  const { type, slug } = await params;
  if (!VALID_TYPES.includes(type as ContentType)) notFound();
  await requireAdminSession();

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Edit {type}</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Slug: <code className="font-mono text-xs">{slug}</code>
        </p>
        <div
          className="rounded-xl border p-8 text-center"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <p className="text-[var(--muted)]">Full editor coming in the next phase.</p>
        </div>
      </div>
    </div>
  );
}
