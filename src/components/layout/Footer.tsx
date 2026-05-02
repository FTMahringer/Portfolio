import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)]">
          © {new Date().getFullYear()} Fynn M. Built with Next.js &amp; Tailwind CSS.
        </p>
        <div className="flex items-center gap-5 text-sm text-[var(--muted)]">
          <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)] transition-colors">
            GitHub
          </Link>
          <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)] transition-colors">
            LinkedIn
          </Link>
          <Link href="/contact" className="hover:text-[var(--foreground)] transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
