import type { Metadata } from 'next';
import { getAllTimelineEntries } from '@/lib/timeline';
import { Timeline } from '@/components/timeline/Timeline';
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

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations(lang);

  return {
    title: tr(t, 'public.timeline.meta.title', 'Timeline'),
    description: tr(
      t,
      'public.timeline.meta.description',
      'A timeline of my professional journey, education, and projects.',
    ),
  };
}

export default async function TimelinePage({ params }: PageParams) {
  const { lang } = await params;
  const t = await getTranslations(lang);
  const entries = getAllTimelineEntries();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight">
          {tr(t, 'public.timeline.heading', 'Timeline')}
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-2xl">
          {tr(t, 'public.timeline.intro', 'A chronological view of my professional journey, education, and projects.')}
        </p>
      </div>

      <Timeline entries={entries} />
    </main>
  );
}
