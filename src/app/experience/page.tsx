import { getAllExperience } from '@/lib/mdx';
import { ExperienceCard } from '@/components/experience/ExperienceCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Experience',
  description: 'My work experience, internships, and real-world projects.',
};

export default function ExperiencePage() {
  const experiences = getAllExperience();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">Experience</h1>
      <p className="text-[var(--muted)] mb-10">
        Employers, internships, and real-world project work. Click any card for full details.
      </p>

      {experiences.length > 0 ? (
        <div className="space-y-4">
          {experiences.map(exp => (
            <ExperienceCard key={exp.slug} experience={exp} />
          ))}
        </div>
      ) : (
        <p className="text-[var(--muted)]">Experience entries coming soon.</p>
      )}
    </main>
  );
}
