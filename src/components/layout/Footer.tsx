import Link from 'next/link';
import { VersionInfo } from './VersionInfo';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-auto bg-[var(--muted-bg)]/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          {/* Column 1: Navigation */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">Navigation</h3>
            <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">Home</Link>
            <Link href="/projects" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">Projects</Link>
            <Link href="/blog" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">Blog</Link>
            <Link href="/experience" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">Experience</Link>
            <Link href="/skills" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">Skills</Link>
          </div>

          {/* Column 2: Discovery */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">Discovery</h3>
            <Link href="/about" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">About Me</Link>
            <Link href="/now" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">Now</Link>
            <Link href="/uses" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">Uses</Link>
            <Link href="/homelab" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">Homelab</Link>
            <Link href="/feed.xml" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">RSS Feed</Link>
          </div>

          {/* Column 3: Legal & Social */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">Legal {"&"} Social</h3>
            <Link href="/impressum" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">Datenschutz</Link>
            <div className="h-px bg-[var(--border)] my-1" />
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">GitHub</Link>
            <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">LinkedIn</Link>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <p className="text-xs text-[var(--muted)]">
              © {new Date().getFullYear()} Fynn M. Built with Next.js &amp; Tailwind CSS.
            </p>
            <span className="hidden sm:inline text-xs text-[var(--muted)]">•</span>
            <VersionInfo />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="text-xs font-medium text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
