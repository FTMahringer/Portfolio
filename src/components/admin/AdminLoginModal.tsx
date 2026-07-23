'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useDevMode } from '@/context/DevContext';

interface SsoProvider { id: string; name: string; type: string }

const PROVIDER_ICONS: Record<string, string> = {
  google: '🔵', microsoft: '🟦', entra: '🔷', okta: '⭕',
  zitadel: '🟣', pocketid: '🪪', authentik: '🔴', keycloak: '🔐', oidc: '🔑',
};

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({ open, onClose }: AdminLoginModalProps) {
  const { login } = useDevMode();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<SsoProvider[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch('/api/admin/auth/sso-available')
      .then((r) => r.json())
      .then((d: { available: boolean; providers?: SsoProvider[] }) => setProviders(d.providers ?? []))
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) {
      setError('');
      setLoading(false);
    }
  }, [open]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const ok = await login(email, password);
    if (ok) {
      onClose();
      window.location.reload();
    } else {
      setError('Invalid credentials');
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-xl border p-8 shadow-lg"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Admin Login
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {providers.length > 0 && (
          <>
            <div className="flex flex-col gap-2 mb-1">
              {providers.map((p) => (
                <a
                  key={p.id}
                  href={`/api/admin/auth/sso${p.id !== 'env' ? `?provider_id=${p.id}` : ''}`}
                  className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--background)' }}
                >
                  <span>{PROVIDER_ICONS[p.type] ?? '🔑'}</span>
                  Continue with {p.name}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
              <span className="text-xs" style={{ color: 'var(--muted)' }}>or</span>
              <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="admin-login-email" className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
              Email
            </label>
            <input
              id="admin-login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]"
              style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="admin-login-password" className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
              Password
            </label>
            <input
              id="admin-login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]"
              style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-800/40 bg-red-900/20 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ background: loading ? 'var(--muted)' : 'var(--accent)' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
