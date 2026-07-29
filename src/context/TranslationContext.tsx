'use client';

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import type { TranslationMap } from '@/lib/translation-types';
import type { LocaleCode } from '@/lib/locale-registry';

interface TranslationContextValue {
  locale: LocaleCode;
  translations: TranslationMap;
  t: (key: string, fallback?: string) => string;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function TranslationProvider({
  locale,
  translations,
  children,
}: {
  locale: LocaleCode;
  translations: TranslationMap;
  children: ReactNode;
}) {
  const value = useMemo<TranslationContextValue>(() => ({
    locale,
    translations,
    t: (key: string, fallback = key) => {
      const value = translations[key];

      if (typeof value === 'string') {
        return value;
      }

      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
      }

      return fallback;
    },
  }), [locale, translations]);

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslations() {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error('useTranslations must be used within a TranslationProvider');
  }

  return context;
}
