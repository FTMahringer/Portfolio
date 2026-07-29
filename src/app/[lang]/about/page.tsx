import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { AboutSidebar } from '@/components/about/AboutSidebar';
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
    title: tr(t, 'public.about.meta.title', 'About Me'),
    description: tr(
      t,
      'public.about.meta.description',
      'Learn more about Fynn M. – Software Developer & Systems Engineer.',
    ),
  };
}

export default async function AboutPage({ params }: PageParams) {
  const { lang } = await params;
  const t = await getTranslations(lang);
  const filePath = path.join(process.cwd(), 'content', 'pages', 'about.mdx');
  let content = '';

  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    content = matter(raw).content;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-64 flex-shrink-0">
          <AboutSidebar skillsLabel={tr(t, 'public.about.sidebar.skills', 'Skills')} />
        </div>
        <div className="flex-1 min-w-0">
          {content ? (
            <article className="prose-content">
              <MDXRemote source={content} components={mdxComponents} />
            </article>
          ) : (
            <p className="text-[var(--muted)]">
              {tr(t, 'public.about.fallback', 'About content coming soon.')}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
