import type { Metadata } from 'next';
import { getAllTestimonials } from '@/lib/testimonials';
import { TestimonialCard } from '@/components/testimonials/TestimonialCard';
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
    title: tr(t, 'public.testimonials.meta.title', 'Testimonials'),
    description: tr(
      t,
      'public.testimonials.meta.description',
      'What colleagues and clients say about working with me.',
    ),
  };
}

export default async function TestimonialsPage({ params }: PageParams) {
  const { lang } = await params;
  const t = await getTranslations(lang);
  const testimonials = getAllTestimonials();

  if (testimonials.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">
          {tr(t, 'public.testimonials.heading', 'Testimonials')}
        </h1>
        <p className="text-[var(--muted)] mb-12">
          {tr(t, 'public.testimonials.intro', 'What colleagues and clients say about working with me.')}
        </p>
        <p className="text-[var(--muted)]">
          {tr(t, 'public.testimonials.empty', 'No testimonials yet.')}
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">
        {tr(t, 'public.testimonials.heading', 'Testimonials')}
      </h1>
      <p className="text-[var(--muted)] mb-12">
        {tr(t, 'public.testimonials.intro', 'What colleagues and clients say about working with me.')}
      </p>

      <div className="grid grid-cols-1 gap-6">
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.slug} testimonial={testimonial} />
        ))}
      </div>
    </main>
  );
}
