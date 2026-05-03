'use client';

import { useEffect, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';

interface GiscusConfig {
  enabled: boolean;
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: string;
  reactionsEnabled: boolean;
  emitMetadata: boolean;
  inputPosition: string;
  lang: string;
}

interface GiscusCommentsProps {
  config: GiscusConfig;
}

export function GiscusComments({ config }: GiscusCommentsProps) {
  const { settings } = useSettings();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !settings.showComments || !config.enabled) return;

    // Determine theme based on current settings
    const giscusTheme = settings.theme === 'light' 
      ? 'light' 
      : settings.theme === 'dark' 
      ? 'dark' 
      : 'preferred_color_scheme';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', config.repo);
    script.setAttribute('data-repo-id', config.repoId || '');
    script.setAttribute('data-category', config.category);
    script.setAttribute('data-category-id', config.categoryId || '');
    script.setAttribute('data-mapping', config.mapping);
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', config.reactionsEnabled ? '1' : '0');
    script.setAttribute('data-emit-metadata', config.emitMetadata ? '1' : '0');
    script.setAttribute('data-input-position', config.inputPosition);
    script.setAttribute('data-theme', giscusTheme);
    script.setAttribute('data-lang', config.lang);
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    ref.current.appendChild(script);

    return () => {
      if (ref.current) {
        ref.current.innerHTML = '';
      }
    };
  }, [settings.showComments, settings.theme, config]);

  if (!settings.showComments || !config.enabled) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-[var(--border)]">
      <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Comments</h3>
      <div ref={ref} className="giscus" />
    </div>
  );
}
