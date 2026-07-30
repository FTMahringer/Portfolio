'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDevMode } from '@/context/DevContext';
import { useTranslations } from '@/context/TranslationContext';
import { buildLocalePath } from '@/lib/locale-routing';
import { isLocaleCode, type LocaleCode } from '@/lib/locale-registry';

const TYPE_MAP: Record<string, string> = {
  blog: 'blog',
  projects: 'projects',
  experience: 'experience',
};

export default function EditContentButton() {
  const { isDevMode, loading } = useDevMode();
  const { locale } = useTranslations();
  const pathname = usePathname();

  if (loading || !isDevMode || !pathname) return null;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 3) return null;

  const [pathLocale, type, slug] = segments;
  if (!isLocaleCode(pathLocale) || !TYPE_MAP[type]) return null;

  const targetLocale = (locale ?? pathLocale) as LocaleCode;

  return (
    <Link
      href={buildLocalePath(targetLocale, `/content/edit/${TYPE_MAP[type]}/${slug}`)}
      className="fixed bottom-24 left-4 z-[250] flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-lg hover:opacity-90 transition-opacity sm:bottom-28 sm:left-6"
      title="Edit this page"
    >
      ✎ Edit
    </Link>
  );
}
