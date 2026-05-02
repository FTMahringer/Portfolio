import Button from '@/components/ui/Button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Download the resume of Fynn M. – Software Developer & Systems Engineer.',
};

export default function ResumePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4 text-[var(--foreground)]">Resume / CV</h1>
      <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">
        Download my current resume as a PDF for a quick overview of my experience and skills.
      </p>
      <Button href="/resume.pdf" external>
        ↓ Download Resume (PDF)
      </Button>
      <p className="text-xs text-[var(--muted)] mt-6">Last updated: May 2026</p>
    </main>
  );
}
