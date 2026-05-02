import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/lib/types';

const STATUS_STYLES: Record<ProjectStatus, string> = {
  'Completed': 'bg-green-500/10 text-green-400 border border-green-500/20',
  'Work in Progress': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  'Archived': 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
  'Idea': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'status';
  status?: ProjectStatus;
  className?: string;
}

export default function Badge({ children, variant = 'default', status, className }: BadgeProps) {
  if (variant === 'status' && status) {
    return (
      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', STATUS_STYLES[status], className)}>
        {children}
      </span>
    );
  }
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium',
      'bg-[var(--muted-bg)] text-[var(--muted)] border border-[var(--border)]',
      className
    )}>
      {children}
    </span>
  );
}
