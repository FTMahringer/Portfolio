'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import type { SiteSettings } from '@/lib/site-settings-types';
import { useTranslations } from '@/context/TranslationContext';

export const inputClass =
  'w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]';

export const textareaClass = `${inputClass} min-h-24 resize-y`;

interface SettingsFormShellProps {
  title: string;
  description: string;
  children: (props: {
    settings: SiteSettings;
    setSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
    save: () => Promise<void>;
    saving: boolean;
  }) => React.ReactNode;
}

export function SettingsFormShell({ title, description, children }: SettingsFormShellProps) {
  const { t } = useTranslations();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setError('');
      const response = await fetch('/api/admin/site-settings');
      const data = (await response.json().catch(() => ({}))) as { settings?: SiteSettings; error?: string };

      if (cancelled) return;

      if (response.ok && data.settings) {
        setSettings(data.settings);
      } else {
        setError(data.error ?? t('settings.forms.errors.load'));
      }

      setLoading(false);
    }

    void loadSettings();
    return () => {
      cancelled = true;
    };
  }, [t]);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setMessage('');
    setError('');

    const response = await fetch('/api/admin/site-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });
    const data = (await response.json().catch(() => ({}))) as { settings?: SiteSettings; error?: string };

    if (response.ok && data.settings) {
      setSettings(data.settings);
      setMessage(t('settings.forms.messages.saved'));
    } else {
      setError(data.error ?? t('settings.forms.errors.save'));
    }

    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] px-6 py-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[var(--accent)]">{t('settings.forms.badge')}</span>
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-[var(--muted)]">{description}</p>
      </div>

      {loading && <Card>{t('settings.forms.loading')}</Card>}
      {error && <p className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-400">{error}</p>}
      {message && <p className="mb-4 rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-sm text-green-400">{message}</p>}

      {settings && children({ settings, setSettings, save, saving })}
    </div>
  );
}

export function Card({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      {title && <h2 className="text-xl font-semibold text-[var(--foreground)]">{title}</h2>}
      {description && <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>}
      <div className={title || description ? 'mt-6' : ''}>{children}</div>
    </section>
  );
}

export function Field({ label, children, help }: { label: string; children: React.ReactNode; help?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      {children}
      {help && <span className="block text-xs text-[var(--muted)]">{help}</span>}
    </label>
  );
}

export function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  const { t } = useTranslations();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
    >
      {saving ? t('settings.forms.actions.saving') : t('settings.forms.actions.save')}
    </button>
  );
}
