import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';
import { SocialLinks } from '@/components/contact/SocialLinks';
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
    title: tr(t, 'public.contact.meta.title', 'Contact'),
    description: tr(
      t,
      'public.contact.meta.description',
      'Get in touch via the contact form, email, GitHub, or LinkedIn.',
    ),
  };
}

export default async function ContactPage({ params }: PageParams) {
  const { lang } = await params;
  const t = await getTranslations(lang);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">
        {tr(t, 'public.contact.heading', 'Contact')}
      </h1>
      <p className="text-[var(--muted)] mb-10">
        {tr(t, 'public.contact.intro', "I'm open to opportunities, collaborations, and interesting conversations.")}
      </p>

      <div className="flex flex-col md:flex-row gap-10">
        <ContactForm />
        <div className="hidden md:block w-px bg-[var(--border)] self-stretch" />
        <SocialLinks
          heading={tr(t, 'public.contact.social.heading', 'Get in Touch')}
          description={tr(t, 'public.contact.social.description', 'Find me on any of these platforms.')}
        />
      </div>
    </main>
  );
}
