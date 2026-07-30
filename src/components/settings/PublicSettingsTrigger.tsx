"use client";

import { useTranslations } from "@/context/TranslationContext";
import { usePublicSettingsDrawer } from "@/context/PublicSettingsDrawerContext";

export default function PublicSettingsTrigger() {
  const { t } = useTranslations();
  const { open, toggleDrawer } = usePublicSettingsDrawer();

  return (
    <button
      type="button"
      aria-label={open ? t('settings.drawer.trigger.close') : t('settings.drawer.trigger.open')}
      aria-expanded={open}
      aria-haspopup="dialog"
      onClick={toggleDrawer}
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
    >
      <span className="grid size-6 place-items-center rounded-md bg-[var(--background)] text-[var(--accent)]">
        ⚙
      </span>
      <span className="whitespace-nowrap">{t('settings.drawer.trigger.label')}</span>
    </button>
  );
}
