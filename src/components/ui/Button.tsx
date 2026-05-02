import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  external?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Button({ href, onClick, variant = 'primary', external, children, className }: ButtonProps) {
  const classes = cn(
    'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer',
    variant === 'primary' && 'bg-[var(--accent)] text-[#0a0a0a] hover:opacity-90 font-semibold',
    variant === 'secondary' && 'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted-bg)]',
    variant === 'ghost' && 'text-[var(--muted)] hover:text-[var(--foreground)]',
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
