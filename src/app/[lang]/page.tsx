import Link from "next/link";
import type { Metadata } from "next";

import { getAllProjects, getAllBlogPosts } from "@/lib/mdx";
import { getSiteConfig } from "@/lib/config";
import ProjectGrid from "@/components/projects/ProjectGrid";
import BlogCard from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { personSchema, websiteSchema } from "@/lib/jsonld";
import { PortfolioStats } from "@/components/home/PortfolioStats";
import { getPortfolioStats } from "@/lib/stats";
import { resolveHomepageStats } from "@/lib/homepage-stats";
import { shouldShowFeatureOnHomepage } from "@/lib/site-settings";
import { getTranslations } from "@/lib/i18n";
import type { TranslationMap } from "@/lib/translation-types";

const HERO_SKILLS = [
  "Next.js",
  "TypeScript",
  "Java",
  "Spring Boot",
  "Docker",
  "Linux",
  "K3s",
];

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
    title: tr(t, 'public.home.meta.title', 'Fynn M. – Software Developer'),
    description: tr(
      t,
      'public.home.meta.description',
      'Personal portfolio of Fynn M. – Software Developer & Systems Engineer. Projects, experience, and blog.',
    ),
  };
}

export default async function HomePage({ params }: PageParams) {
  const { lang } = await params;
  const t = await getTranslations(lang);
  const showProjects = shouldShowFeatureOnHomepage('projects');
  const showBlog = shouldShowFeatureOnHomepage('blog');
  const allProjects = showProjects ? getAllProjects() : [];
  const featured = allProjects.filter((p) => p.frontmatter.featured);
  const latestPosts = showBlog ? getAllBlogPosts().slice(0, 3) : [];
  const config = getSiteConfig();
  const { site } = config;
  const stats = resolveHomepageStats(config, getPortfolioStats());

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-24">
      <JsonLd data={personSchema()} />
      <JsonLd data={websiteSchema()} />
      <section className="space-y-4">
        <div>
          <p className="text-sm font-mono text-[var(--accent)] mb-1">
            {tr(t, 'public.home.hero.greeting', "Hi, I'm")}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight">
            {site.title}
          </h1>
        </div>
        <p className="text-lg text-[var(--muted)] max-w-2xl leading-relaxed">
          {site.bio}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {HERO_SKILLS.map((skill) => (
            <Badge key={skill}>{skill}</Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          {showProjects && <Button href="/projects">{tr(t, 'public.home.hero.projects', 'View Projects')}</Button>}
          <Button href="/contact" variant="secondary">
            {tr(t, 'public.home.hero.contact', 'Get in Touch')}
          </Button>
          <Button href="/resume" variant="ghost">
            {tr(t, 'public.home.hero.resume', 'Resume ↓')}
          </Button>
        </div>
        <div className="pt-1">
          <span className="text-sm text-[var(--muted)]">
            {tr(t, 'public.home.hero.aboutPrompt', 'Want to know more about me?')}{" "}
          </span>
          <Button href="/about" variant="ghost">
            {tr(t, 'public.home.hero.aboutLink', 'About me →')}
          </Button>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="py-8">
          <PortfolioStats stats={stats} />
        </section>
      )}

      {showProjects && featured.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              {tr(t, 'public.home.sections.featuredProjects', 'Featured Projects')}
            </h2>
            <Link
              href="/projects"
              className="text-sm text-[var(--accent)] hover:underline"
            >
              {tr(t, 'public.home.sections.allProjects', 'All projects →')}
            </Link>
          </div>
          <ProjectGrid projects={featured} />
        </section>
      )}

      {showBlog && latestPosts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              {tr(t, 'public.home.sections.latestPosts', 'Latest Posts')}
            </h2>
            <Link
              href="/blog"
              className="text-sm text-[var(--accent)] hover:underline"
            >
              {tr(t, 'public.home.sections.allPosts', 'All posts →')}
            </Link>
          </div>
          <div className="grid gap-4">
            {latestPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
