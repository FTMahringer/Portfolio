'use client';

import { useState } from 'react';
import { useTranslations } from '@/context/TranslationContext';

export default function DevSettingsPage() {
  const { t } = useTranslations();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] px-6 py-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-green-400">
              {t('settings.pages.admin.badge')}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">{t('settings.pages.admin.title')}</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
            {t('settings.pages.admin.description')}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--muted)]">
          {t('settings.pages.admin.notice')}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PasswordForm />
        <EmailForm />
      </div>
    </div>
  );
}

function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      </div>
      {children}
    </section>
  );
}

function PasswordForm() {
  const { t } = useTranslations();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setError('');
    if (form.newPassword !== form.confirm) {
      setError(t('settings.pages.admin.errors.passwordMismatch'));
      return;
    }
    setLoading(true);
    const res = await fetch('/api/admin/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg(t('settings.pages.admin.messages.passwordUpdated'));
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } else {
      setError(data.error ?? t('settings.pages.admin.errors.passwordUpdateFailed'));
    }
    setLoading(false);
  }

  return (
    <Card
      title={t('settings.pages.admin.password.title')}
      description={t('settings.pages.admin.password.description')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {(['currentPassword', 'newPassword', 'confirm'] as const).map((field) => (
          <div key={field} className="space-y-1.5">
            <label className="text-sm text-[var(--muted)]">
              {field === 'currentPassword' ? t('settings.pages.admin.password.fields.current') : field === 'newPassword' ? t('settings.pages.admin.password.fields.new') : t('settings.pages.admin.password.fields.confirm')}
            </label>
            <input
              type="password"
              required
              value={form[field]}
              onChange={(e) => setForm((current) => ({ ...current, [field]: e.target.value }))}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
            />
          </div>
        ))}

        {error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-400">{error}</p>}
        {msg && <p className="rounded-xl border border-green-400/20 bg-green-400/10 px-3 py-2 text-sm text-green-400">{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
        >
          {loading ? t('settings.pages.admin.actions.saving') : t('settings.pages.admin.actions.updatePassword')}
        </button>
      </form>
    </Card>
  );
}

function EmailForm() {
  const { t } = useTranslations();
  const [form, setForm] = useState({ currentPassword: '', newEmail: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setError('');
    setLoading(true);
    const res = await fetch('/api/admin/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: form.currentPassword, newEmail: form.newEmail }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg(t('settings.pages.admin.messages.emailUpdated'));
      setForm({ currentPassword: '', newEmail: '' });
    } else {
      setError(data.error ?? t('settings.pages.admin.errors.emailUpdateFailed'));
    }
    setLoading(false);
  }

  return (
    <Card
      title={t('settings.pages.admin.email.title')}
      description={t('settings.pages.admin.email.description')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm text-[var(--muted)]">{t('settings.pages.admin.email.fields.currentPassword')}</label>
          <input
            type="password"
            required
            value={form.currentPassword}
            onChange={(e) => setForm((current) => ({ ...current, currentPassword: e.target.value }))}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-[var(--muted)]">{t('settings.pages.admin.email.fields.newEmail')}</label>
          <input
            type="email"
            required
            value={form.newEmail}
            onChange={(e) => setForm((current) => ({ ...current, newEmail: e.target.value }))}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
          />
        </div>

        {error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-400">{error}</p>}
        {msg && <p className="rounded-xl border border-green-400/20 bg-green-400/10 px-3 py-2 text-sm text-green-400">{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
        >
          {loading ? t('settings.pages.admin.actions.saving') : t('settings.pages.admin.actions.updateEmail')}
        </button>
      </form>
    </Card>
  );
}
