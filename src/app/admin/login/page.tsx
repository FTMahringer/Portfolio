'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface SsoProvider { id: string; name: string; type: string }

const PROVIDER_ICONS: Record<string, string> = {
  google: '🔵', microsoft: '🟦', entra: '🔷', okta: '⭕',
  zitadel: '🟣', pocketid: '🪪', authentik: '🔴', keycloak: '🔐', oidc: '🔑',
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState(() =>
    searchParams.get('error') === 'sso_failed' ? 'SSO authentication failed — please try again' : ''
  );
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<SsoProvider[]>([]);

  useEffect(() => {
    fetch('/api/admin/auth/sso-available')
      .then((r) => r.json())
      .then((d: { available: boolean; providers?: SsoProvider[] }) => setProviders(d.providers ?? []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        // Full reload so DevContext re-checks auth status with the new cookie
        window.location.href = '/admin';
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? 'Invalid credentials');
        setLoading(false);
      }
    } catch {
      setError('Network error — please try again');
      setLoading(false);
    }
  }

  return (
    <div
      className="w-full max-w-sm rounded-xl border p-8 shadow-lg"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <h1 className="mb-6 text-xl font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
        Admin
      </h1>

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
          <label htmlFor="email" className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]"
            style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Password
          </label>
          <input
            id="password"
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
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

