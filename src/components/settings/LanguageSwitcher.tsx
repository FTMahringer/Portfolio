'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ChangeEvent } from 'react';

import { useSettings } from '@/context/SettingsContext';
import { buildLocalePath, getLocaleFromPath } from '@/lib/locale-routing';
import { DEFAULT_LOCALE_CODE, type LocaleCode } from '@/lib/locale-registry';
import { useTranslations } from '@/context/TranslationContext';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { settings, update } = useSettings();
  const { t } = useTranslations();

  const pathLocale = getLocaleFromPath(pathname);
  const selectedLocale = pathLocale ?? settings.locale ?? DEFAULT_LOCALE_CODE;

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as LocaleCode;

    if (nextLocale === selectedLocale) {
      return;
    }

    update('locale', nextLocale);
    router.replace(buildLocalePath(nextLocale, pathname));
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted-bg)]/35 p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{t('settings.language.title')}</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">{t('settings.language.description')}</p>
      </div>

      <label className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[var(--foreground)]">{t('settings.language.label')}</span>
        <select
          value={selectedLocale}
          onChange={handleChange}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
        >
          <option value="en">{t('language.options.en')}</option>
          <option value="de">{t('language.options.de')}</option>
        </select>
      </label>
    </div>
  );
}
