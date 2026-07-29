'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from '@/context/TranslationContext';

type Session = {
  id: string;
  userId: number;
  expiresAt: number;
  createdAt: number;
  ip: string | null;
  userAgent: string | null;
};

export default function DevSessionsPage() {
  const { t } = useTranslations();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/sessions');
    if (res.ok) {
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } else {
      setError(t('settings.pages.sessions.errors.load'));
    }
    setLoading(false);
  }, [t]);

  useEffect(() => { load(); }, [load]);

  async function revoke(id: string) {
    await fetch(`/api/admin/sessions?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    await load();
  }

  async function revokeOthers() {
    await fetch('/api/admin/sessions?others=1', { method: 'DELETE' });
    await load();
  }

  function formatDate(ts: number) {
    return new Date(ts * 1000).toLocaleString();
  }

  function formatUA(ua: string | null) {
    if (!ua) return '—';
    const m = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
    return m ? m[0] : ua.slice(0, 40);
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold text-green-400 uppercase tracking-widest">{t('settings.pages.sessions.badge')}</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{t('settings.pages.sessions.title')}</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">{t('settings.pages.sessions.description')}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--muted)]">{sessions.length} {sessions.length === 1 ? t('settings.pages.sessions.activeSingle') : t('settings.pages.sessions.activePlural')}</span>
          <button
            onClick={revokeOthers}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-red-500/50 hover:text-red-400"
          >
            {t('settings.pages.sessions.actions.revokeOthers')}
          </button>
          <button
            onClick={load}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
          >
            {t('settings.pages.sessions.actions.refresh')}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-800/40 bg-red-900/20 px-4 py-2 text-sm text-red-400">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--muted)] animate-pulse">{t('settings.pages.sessions.loading')}</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{t('settings.pages.sessions.empty')}</p>
      ) : (
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left bg-[var(--card)]">
                <th className="px-4 py-3 font-medium text-[var(--muted)]">{t('settings.pages.sessions.columns.id')}</th>
                <th className="px-4 py-3 font-medium text-[var(--muted)] hidden sm:table-cell">{t('settings.pages.sessions.columns.ip')}</th>
                <th className="px-4 py-3 font-medium text-[var(--muted)] hidden md:table-cell">{t('settings.pages.sessions.columns.browser')}</th>
                <th className="px-4 py-3 font-medium text-[var(--muted)] hidden lg:table-cell">{t('settings.pages.sessions.columns.created')}</th>
                <th className="px-4 py-3 font-medium text-[var(--muted)]">{t('settings.pages.sessions.columns.expires')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr
                  key={s.id}
                  className="border-b border-[var(--border)] last:border-0 transition-colors hover:bg-[var(--card)]"
                >
                  <td className="px-4 py-3 font-mono text-xs text-[var(--foreground)]">{s.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-[var(--muted)]">{s.ip ?? '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-[var(--muted)]">{formatUA(s.userAgent)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-[var(--muted)]">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">{formatDate(s.expiresAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => revoke(s.id)}
                      className="text-xs text-[var(--muted)] hover:text-red-400 transition-colors"
                    >
                      {t('settings.pages.sessions.actions.revoke')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
