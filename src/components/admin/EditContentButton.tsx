'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDevMode } from '@/context/DevContext';

const TYPE_MAP: Record<string, string> = {
  blog: 'blog',
  projects: 'projects',
  experience: 'experience',
};

export default function EditContentButton() {
  const { isDevMode, loading } = useDevMode();
  const pathname = usePathname();

  if (loading || !isDevMode || !pathname) return null;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 2) return null;

  const [type, slug] = segments;
  if (!TYPE_MAP[type]) return null;

  return (
    <Link
      href={`/content/edit/${TYPE_MAP[type]}/${slug}`}
      className="fixed bottom-6 right-6 z-[250] flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-lg hover:opacity-90 transition-opacity"
      title="Edit this page"
    >
      ✎ Edit
    </Link>
  );
}
