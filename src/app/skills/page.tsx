import type { Metadata } from 'next';
import type { SkillCategory } from '@/lib/types';
import Badge from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Skills',
  description: 'Technologies, tools, and platforms I work with.',
};

const SKILLS: SkillCategory[] = [
  { name: 'Frontend', skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'HTML / CSS'] },
  { name: 'Backend', skills: ['Java', 'Spring Boot', 'Node.js', 'PHP', 'Symfony'] },
  {
    name: 'Infrastructure & DevOps',
    skills: ['Docker', 'Kubernetes (K3s)', 'Linux', 'Nginx', 'GitHub Actions', 'CI/CD'],
  },
  {
    name: 'Networking',
    skills: ['OPNsense', 'VLANs', 'Nginx Proxy Manager', 'DNS', 'Firewall'],
  },
  { name: 'Databases', skills: ['PostgreSQL', 'MySQL', 'SQLite'] },
  { name: 'Tools', skills: ['Git', 'VS Code', 'IntelliJ IDEA', 'Postman', 'Figma'] },
];

export default function SkillsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">Skills</h1>
      <p className="text-[var(--muted)] mb-12">Technologies and tools I work with.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SKILLS.map(category => (
          <div
            key={category.name}
            className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]"
          >
            <h2 className="font-semibold text-[var(--foreground)] mb-3 text-sm uppercase tracking-wide">
              {category.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {category.skills.map(skill => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
