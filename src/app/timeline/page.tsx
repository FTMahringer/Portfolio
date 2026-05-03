import { getAllTimelineEntries } from '@/lib/timeline';
import { Timeline } from '@/components/timeline/Timeline';

export const metadata = {
  title: 'Timeline',
  description: 'A timeline of my professional journey, education, and projects.',
};

export default function TimelinePage() {
  const entries = getAllTimelineEntries();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight">
          Timeline
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-2xl">
          A chronological view of my professional journey, education, and projects.
        </p>
      </div>

      <Timeline entries={entries} />
    </main>
  );
}
