import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skills',
  description: 'Technologies, tools, and platforms I work with.',
};

interface Skill {
  name: string;
  level: number; // 1-5 (beginner to expert)
}

interface SkillCategory {
  name: string;
  skills: Skill[];
}

const SKILLS: SkillCategory[] = [
  {
    name: 'Frontend',
    skills: [
      { name: 'Next.js', level: 4 },
      { name: 'React', level: 4 },
      { name: 'TypeScript', level: 4 },
      { name: 'Tailwind CSS', level: 5 },
      { name: 'HTML / CSS', level: 5 },
    ],
  },
  {
    name: 'Backend',
    skills: [
      { name: 'Java', level: 4 },
      { name: 'Spring Boot', level: 4 },
      { name: 'Node.js', level: 3 },
      { name: 'PHP', level: 3 },
      { name: 'Symfony', level: 3 },
    ],
  },
  {
    name: 'Infrastructure & DevOps',
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
    name: 'Networking',
    skills: [
      { name: 'OPNsense', level: 4 },
      { name: 'VLANs', level: 4 },
      { name: 'Nginx Proxy Manager', level: 5 },
      { name: 'DNS', level: 4 },
      { name: 'Firewall', level: 4 },
    ],
  },
  {
    name: 'Databases',
    skills: [
      { name: 'PostgreSQL', level: 4 },
      { name: 'MySQL', level: 4 },
      { name: 'SQLite', level: 4 },
    ],
  },
  {
    name: 'Tools',
    skills: [
      { name: 'Git', level: 5 },
      { name: 'VS Code', level: 5 },
      { name: 'IntelliJ IDEA', level: 4 },
      { name: 'Postman', level: 4 },
      { name: 'Figma', level: 3 },
    ],
  },
];

const LEVEL_LABELS = ['Beginner', 'Intermediate', 'Proficient', 'Advanced', 'Expert'];

export default function SkillsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">Skills</h1>
      <p className="text-[var(--muted)] mb-12">
        Technologies and tools I work with. Proficiency levels are self-assessed.
      </p>

      <div className="space-y-8">
        {SKILLS.map((category) => (
          <div key={category.name}>
            <h2 className="font-semibold text-[var(--foreground)] mb-4 text-lg">
              {category.name}
            </h2>
            <div className="space-y-4">
              {category.skills.map((skill) => (
                <div key={skill.name} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[var(--foreground)] font-medium">
                      {skill.name}
                    </span>
                    <span className="text-xs text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                      {LEVEL_LABELS[skill.level - 1]}
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
