'use client';

import { useDevMode } from '@/context/DevContext';

export function ToolbarLayout({ children }: { children: React.ReactNode }) {
  const { isDevMode, loading } = useDevMode();
  const hasToolbar = !loading && isDevMode;

  return (
    <div className={`flex min-h-full flex-col ${hasToolbar ? 'md:pt-10' : ''}`}>
      {children}
    </div>
  );
}
