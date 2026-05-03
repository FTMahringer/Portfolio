import type { Metadata } from 'next';
import { getAllTestimonials } from '@/lib/testimonials';
import { TestimonialCard } from '@/components/testimonials/TestimonialCard';

export const metadata: Metadata = {
  title: 'Testimonials',
  description: 'What colleagues and clients say about working with me.',
};

export default function TestimonialsPage() {
  const testimonials = getAllTestimonials();

  if (testimonials.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">Testimonials</h1>
        <p className="text-[var(--muted)] mb-12">
          What colleagues and clients say about working with me.
        </p>
        <p className="text-[var(--muted)]">No testimonials yet.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">Testimonials</h1>
      <p className="text-[var(--muted)] mb-12">
        What colleagues and clients say about working with me.
      </p>

      <div className="grid grid-cols-1 gap-6">
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.slug} testimonial={testimonial} />
        ))}
      </div>
    </main>
  );
}
