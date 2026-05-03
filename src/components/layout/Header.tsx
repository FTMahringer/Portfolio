import Link from 'next/link';
import NavLink from './NavLink';
import { SearchButton } from '@/components/search/SearchButton';

const NAV_LINKS = [
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-mono text-sm font-semibold text-[var(--accent)] hover:opacity-80 transition-opacity shrink-0"
        >
          fynn.dev
        </Link>
        <nav className="flex items-center gap-4 sm:gap-5">
          {NAV_LINKS.map(link => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <SearchButton />
      </div>
    </header>
  );
}
