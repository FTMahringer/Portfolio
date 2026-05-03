'use client';

import { useState, useEffect } from 'react';

type Session = {
  id: string;
  userId: number;
  expiresAt: number;
  createdAt: number;
  ip: string | null;
  userAgent: string | null;
};

export default function DevSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/sessions');
    if (res.ok) {
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } else {
      setError('Failed to load sessions');
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

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
            <span className="text-xs font-mono font-semibold text-green-400 uppercase tracking-widest">Dev Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Sessions</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Manage active login sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--muted)]">{sessions.length} active</span>
          <button
            onClick={revokeOthers}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-red-500/50 hover:text-red-400"
          >
            Revoke all others
          </button>
          <button
            onClick={load}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-800/40 bg-red-900/20 px-4 py-2 text-sm text-red-400">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--muted)] animate-pulse">Loading…</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No active sessions.</p>
      ) : (
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left bg-[var(--card)]">
                <th className="px-4 py-3 font-medium text-[var(--muted)]">ID</th>
                <th className="px-4 py-3 font-medium text-[var(--muted)] hidden sm:table-cell">IP</th>
                <th className="px-4 py-3 font-medium text-[var(--muted)] hidden md:table-cell">Browser</th>
                <th className="px-4 py-3 font-medium text-[var(--muted)] hidden lg:table-cell">Created</th>
                <th className="px-4 py-3 font-medium text-[var(--muted)]">Expires</th>
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
                      Revoke
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
