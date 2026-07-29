import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
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
    title: tr(t, 'public.uses.meta.title', 'Uses'),
    description: tr(t, 'public.uses.meta.description', 'Hardware, software and editor setup I rely on.'),
  };
}

export default async function UsesPage({ params }: PageParams) {
  const { lang } = await params;
  const t = await getTranslations(lang);
  const filePath = path.join(process.cwd(), 'content', 'pages', 'uses.mdx');
  let content = '';

  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf8');
    content = matter(raw).content;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-3 text-[var(--foreground)]">
        {tr(t, 'public.uses.heading', 'Uses')}
      </h1>
      <hr className="border-[var(--border)] mb-6" />
      {content ? (
        <article className="prose-content">
          <MDXRemote source={content} components={mdxComponents} />
        </article>
      ) : (
        <p className="text-[var(--muted)]">
          {tr(t, 'public.uses.fallback', 'Uses content coming soon.')}
        </p>
      )}
    </main>
  );
}
