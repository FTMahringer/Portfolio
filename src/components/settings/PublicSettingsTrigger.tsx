"use client";

import { useTranslations } from "@/context/TranslationContext";

interface PublicSettingsTriggerProps {
  open: boolean;
  onClick: () => void;
}

export default function PublicSettingsTrigger({ open, onClick }: PublicSettingsTriggerProps) {
  const { t } = useTranslations();

  return (
    <button
      type="button"
      aria-label={open ? t('settings.drawer.trigger.close') : t('settings.drawer.trigger.open')}
      aria-expanded={open}
      aria-haspopup="dialog"
      onClick={onClick}
      className="fixed bottom-4 right-4 z-[280] inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium text-[var(--foreground)] shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-md transition-transform hover:-translate-y-0.5 hover:bg-[var(--muted-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] sm:bottom-6 sm:right-6"
    >
      <span className="grid size-8 place-items-center rounded-full bg-[var(--muted-bg)] text-[var(--accent)]">
        ⚙
      </span>
      <span className="whitespace-nowrap">{t('settings.drawer.trigger.label')}</span>
    </button>
  );
}
