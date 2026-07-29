import type { Metadata } from 'next';
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

interface Skill {
  name: string;
  level: number; // 1-5 (beginner to expert)
}

interface SkillCategory {
  categoryKey: string;
  skills: Skill[];
}

const SKILLS: SkillCategory[] = [
  {
    categoryKey: 'frontend',
    skills: [
      { name: 'Next.js', level: 4 },
      { name: 'React', level: 4 },
      { name: 'TypeScript', level: 4 },
      { name: 'Tailwind CSS', level: 5 },
      { name: 'HTML / CSS', level: 5 },
    ],
  },
  {
    categoryKey: 'backend',
    skills: [
      { name: 'Java', level: 4 },
      { name: 'Spring Boot', level: 4 },
      { name: 'Node.js', level: 3 },
      { name: 'PHP', level: 3 },
      { name: 'Symfony', level: 3 },
    ],
  },
  {
    categoryKey: 'infrastructure',
    skills: [
      { name: 'Docker', level: 5 },
      { name: 'Kubernetes (K3s)', level: 4 },
      { name: 'Linux', level: 4 },
      { name: 'Nginx', level: 4 },
      { name: 'GitHub Actions', level: 4 },
      { name: 'CI/CD', level: 4 },
    ],
  },
  {
    categoryKey: 'networking',
    skills: [
      { name: 'OPNsense', level: 4 },
      { name: 'VLANs', level: 4 },
      { name: 'Nginx Proxy Manager', level: 5 },
      { name: 'DNS', level: 4 },
      { name: 'Firewall', level: 4 },
    ],
  },
  {
    categoryKey: 'databases',
    skills: [
      { name: 'PostgreSQL', level: 4 },
      { name: 'MySQL', level: 4 },
      { name: 'SQLite', level: 4 },
    ],
  },
  {
    categoryKey: 'tools',
    skills: [
      { name: 'Git', level: 5 },
      { name: 'VS Code', level: 5 },
      { name: 'IntelliJ IDEA', level: 4 },
      { name: 'Postman', level: 4 },
      { name: 'Figma', level: 3 },
    ],
  },
];

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations(lang);

  return {
    title: tr(t, 'public.skills.meta.title', 'Skills'),
    description: tr(
      t,
      'public.skills.meta.description',
      'Technologies, tools, and platforms I work with.',
    ),
  };
}

export default async function SkillsPage({ params }: PageParams) {
  const { lang } = await params;
  const t = await getTranslations(lang);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">
        {tr(t, 'public.skills.heading', 'Skills')}
      </h1>
      <p className="text-[var(--muted)] mb-12">
        {tr(t, 'public.skills.intro', 'Technologies and tools I work with. Proficiency levels are self-assessed.')}
      </p>

      <div className="space-y-8">
        {SKILLS.map((category) => (
          <div key={category.categoryKey}>
            <h2 className="font-semibold text-[var(--foreground)] mb-4 text-lg">
              {tr(t, `public.skills.categories.${category.categoryKey}`, category.categoryKey)}
            </h2>
            <div className="space-y-4">
              {category.skills.map((skill) => (
                <div key={skill.name} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[var(--foreground)] font-medium">
                      {skill.name}
                    </span>
                    <span className="text-xs text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                      {tr(
                        t,
                        `public.skills.levels.${['beginner', 'intermediate', 'proficient', 'advanced', 'expert'][skill.level - 1]}`,
                        String(skill.level),
                      )}
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--muted-bg)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] transition-all duration-500 rounded-full"
                      style={{ width: `${(skill.level / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
