import Link from 'next/link';
import Image from 'next/image';
import { getAllProjects, getAllBlogPosts, getAllExperience } from '@/lib/mdx';
import { getSiteConfig } from '@/lib/config';
import ProjectGrid from '@/components/projects/ProjectGrid';
import BlogCard from '@/components/blog/BlogCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { JsonLd } from '@/components/seo/JsonLd';
import { personSchema, websiteSchema } from '@/lib/jsonld';

const HERO_SKILLS = ['Next.js', 'TypeScript', 'Java', 'Spring Boot', 'Docker', 'Linux', 'K3s'];

export default function HomePage() {
  const allProjects = getAllProjects();
  const featured = allProjects.filter(p => p.frontmatter.featured);
  const latestPosts = getAllBlogPosts().slice(0, 3);
  const allExperience = getAllExperience();
  const config = getSiteConfig();
  const { site } = config;

  const stats = [
    { label: 'Projects', value: allProjects.length },
    { label: 'Experience entries', value: allExperience.length },
    { label: 'Blog posts', value: getAllBlogPosts().length },
  ].filter(s => s.value > 0);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-24">
      <JsonLd data={personSchema()} />
      <JsonLd data={websiteSchema()} />
      {/* Hero */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[var(--border)] bg-[var(--muted-bg)] flex-shrink-0">
          <Image
            src={site.avatar}
            alt={site.title}
            fill
            className="object-cover"
            sizes="112px"
            priority
          />
        </div>

        <div className="space-y-4 flex-1">
          <div>
            <p className="text-sm font-mono text-[var(--accent)] mb-1">Hi, I&apos;m</p>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight">
              {site.title}
            </h1>
          </div>
          <p className="text-lg text-[var(--muted)] max-w-2xl leading-relaxed">{site.bio}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {HERO_SKILLS.map(skill => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button href="/projects">View Projects</Button>
            <Button href="/contact" variant="secondary">Get in Touch</Button>
            <Button href="/resume" variant="ghost">Resume ↓</Button>
          </div>
        </div>
      </section>

      {/* Quick stats bar */}
      {stats.length > 0 && (
        <section>
          <div className="flex flex-wrap gap-6 py-4 border-y border-[var(--border)]">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[var(--accent)]">{s.value}</span>
                <span className="text-sm text-[var(--muted)]">{s.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Projects */}
      {featured.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Featured Projects</h2>
            <Link href="/projects" className="text-sm text-[var(--accent)] hover:underline">All projects →</Link>
          </div>
          <ProjectGrid projects={featured} />
        </section>
      )}

      {/* Latest Blog Posts */}
      {latestPosts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Latest Posts</h2>
            <Link href="/blog" className="text-sm text-[var(--accent)] hover:underline">All posts →</Link>
          </div>
          <div className="grid gap-4">
            {latestPosts.map(post => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
