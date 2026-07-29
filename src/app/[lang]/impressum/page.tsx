import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
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
    title: tr(t, 'public.impressum.meta.title', 'Legal Notice'),
    description: tr(t, 'public.impressum.meta.description', 'Legal notice and contact information.'),
  };
}

export default async function ImpressumPage({ params }: PageParams) {
  const { lang } = await params;
  const t = await getTranslations(lang);
  const filePath = path.join(process.cwd(), 'content', 'pages', 'impressum.mdx');
  let content = '';

  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    content = matter(raw).content;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">
        {tr(t, 'public.impressum.heading', 'Legal Notice')}
      </h1>
      <section className="prose-content">
        {content ? (
          <MDXRemote source={content} components={mdxComponents} />
        ) : (
          <p className="text-[var(--muted)]">
            {tr(t, 'public.impressum.fallback', 'Legal notice content coming soon.')}
          </p>
        )}
      </section>
    </main>
  );
}
