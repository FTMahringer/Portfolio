import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { getTranslations } from '@/lib/i18n';
import type { TranslationMap } from '@/lib/translation-types';

type PageParams = {
  params: Promise<{ lang: string }>;
};

function tr(translations: TranslationMap, key: string, fallback: string): string {
  const value = translations[key];
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

const LAST_UPDATED = new Date('2026-05-01T00:00:00Z');

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations(lang);

  return {
    title: tr(t, 'public.resume.meta.title', 'Resume'),
    description: tr(
      t,
      'public.resume.meta.description',
      'Download the resume of Fynn M. – Software Developer & Systems Engineer.',
    ),
  };
}

export default async function ResumePage({ params }: PageParams) {
  const { lang } = await params;
  const t = await getTranslations(lang);
  const locale = lang === 'de' ? 'de-DE' : 'en-US';
  const updatedLabel = tr(t, 'public.resume.updatedLabel', 'Last updated:');
  const updatedValue = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(LAST_UPDATED);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4 text-[var(--foreground)]">
        {tr(t, 'public.resume.heading', 'Resume / CV')}
      </h1>
      <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">
        {tr(t, 'public.resume.intro', 'Download my current resume as a PDF for a quick overview of my experience and skills.')}
      </p>
      <Button href="/resume.pdf" external>
        {tr(t, 'public.resume.button', '↓ Download Resume (PDF)')}
      </Button>
      <p className="text-xs text-[var(--muted)] mt-6">
        {updatedLabel} {updatedValue}
      </p>
    </main>
  );
}
