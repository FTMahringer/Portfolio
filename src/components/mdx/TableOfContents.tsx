'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildTocTree, TocHeading, TocNode } from '@/lib/toc-utils';

interface TableOfContentsProps {
  headings: TocHeading[];
  depth?: 2 | 3;
  variant?: 'floating' | 'panel';
  className?: string;
}

function tocContainsActive(node: TocNode, activeId: string): boolean {
  if (node.id === activeId) return true;
  return node.children.some((child) => tocContainsActive(child, activeId));
}

function TocLink({
  node,
  activeId,
  onNavigate,
  level,
}: {
  node: TocNode;
  activeId: string;
  onNavigate: (id: string) => void;
  level: number;
}) {
  const isActive = activeId === node.id;
  const baseClass = cn(
    'block text-sm leading-snug transition-colors',
    level === 0 && 'text-[var(--foreground)]',
    level > 0 && 'text-[var(--muted)] hover:text-[var(--foreground)]',
    isActive && 'text-[var(--accent)] font-medium',
  );

  return (
    <a
      href={`#${node.id}`}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(node.id);
      }}
      className={baseClass}
    >
      <span>{node.text}</span>
    </a>
  );
}

function TocItems({
  nodes,
  activeId,
  onNavigate,
  level = 0,
}: {
  nodes: TocNode[];
  activeId: string;
  onNavigate: (id: string) => void;
  level?: number;
}) {
  return (
    <ul className={cn('space-y-1.5', level > 0 && 'border-l border-[var(--border)] pl-3')}>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isActiveBranch = hasChildren && tocContainsActive(node, activeId);

        if (!hasChildren) {
          return (
            <li key={node.id} className={cn(level > 0 && 'pl-0.5')}>
              <TocLink node={node} activeId={activeId} onNavigate={onNavigate} level={level} />
            </li>
          );
        }

        return (
          <li key={node.id} className={cn(level > 0 && 'pl-0.5')}>
            <details open={isActiveBranch} className="group">
              <summary className="flex cursor-pointer list-none items-start gap-1.5 rounded-md py-0.5 [&::-webkit-details-marker]:hidden">
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--muted)] transition-transform group-open:rotate-90" />
                <TocLink node={node} activeId={activeId} onNavigate={onNavigate} level={level} />
              </summary>
              <div className="mt-1">
                <TocItems nodes={node.children} activeId={activeId} onNavigate={onNavigate} level={level + 1} />
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}

export function TableOfContents({ headings, depth = 3, variant = 'floating', className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const tree = useMemo(() => buildTocTree(headings, depth), [headings, depth]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -75% 0px', threshold: 0 },
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (tree.length === 0) return null;

  const onNavigate = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (variant === 'panel') {
    return (
      <nav aria-label="Table of contents" className={cn('space-y-4', className)}>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Contents</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">Jump to sections in this project.</p>
        </div>
        <TocItems nodes={tree} activeId={activeId} onNavigate={onNavigate} />
      </nav>
    );
  }

  return (
    <nav
      className={cn(
        'hidden xl:block fixed top-20 w-56 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm',
        className,
      )}
      style={{ left: 'calc(50% + 26rem)' }}
      aria-label="Table of contents"
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">On this page</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">Jump to sections and subsections.</p>
      </div>
      <TocItems nodes={tree} activeId={activeId} onNavigate={onNavigate} />
    </nav>
  );
}
