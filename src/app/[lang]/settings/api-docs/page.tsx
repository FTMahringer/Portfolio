'use client';

import { OPENAPI_SPEC } from '@/lib/openapi';
import ApiDocsClient from './ApiDocsClient';
import { useTranslations } from '@/context/TranslationContext';

export default function DevApiDocsPage() {
  const { t } = useTranslations();

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-8 pt-8 pb-2">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-0.5">{t('settings.pages.apiDocs.title')}</h1>
        <p className="text-sm text-[var(--muted)]">{t('settings.pages.apiDocs.description')}</p>
      </div>
      <ApiDocsClient spec={OPENAPI_SPEC} embedded />
    </div>
  );
}
