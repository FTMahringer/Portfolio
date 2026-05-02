import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';
import { SocialLinks } from '@/components/contact/SocialLinks';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch via the contact form, email, GitHub, or LinkedIn.',
};

export default function ContactPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">Contact</h1>
      <p className="text-[var(--muted)] mb-10">
        I&apos;m open to opportunities, collaborations, and interesting conversations.
      </p>

      <div className="flex flex-col md:flex-row gap-10">
        <ContactForm />
        <div className="hidden md:block w-px bg-[var(--border)] self-stretch" />
        <SocialLinks />
      </div>
    </main>
  );
}
