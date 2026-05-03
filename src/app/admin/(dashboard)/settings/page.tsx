'use client';

import { useState } from 'react';

export default function DevSettingsPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-mono font-semibold text-green-400 uppercase tracking-widest">Dev Dashboard</span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Admin Settings</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Manage your admin credentials.</p>
      </div>

      <div className="space-y-6">
        <PasswordForm />
        <EmailForm />
      </div>
    </div>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(''); setError('');
    if (form.newPassword !== form.confirm) {
      setError('Passwords do not match');
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
      setMsg('Password updated');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } else {
      setError(data.error ?? 'Failed to update password');
    }
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="font-semibold text-[var(--foreground)] mb-4">Change Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {(['currentPassword', 'newPassword', 'confirm'] as const).map(field => (
          <div key={field} className="flex flex-col gap-1">
            <label className="text-sm text-[var(--muted)]">
              {field === 'currentPassword' ? 'Current password' : field === 'newPassword' ? 'New password' : 'Confirm new password'}
            </label>
            <input
              type="password"
              required
              value={form[field]}
              onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            />
          </div>
        ))}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {msg && <p className="text-sm text-green-400">{msg}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}

function EmailForm() {
  const [form, setForm] = useState({ currentPassword: '', newEmail: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(''); setError('');
    setLoading(true);
    const res = await fetch('/api/admin/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: form.currentPassword, newEmail: form.newEmail }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg('Email updated');
      setForm({ currentPassword: '', newEmail: '' });
    } else {
      setError(data.error ?? 'Failed to update email');
    }
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="font-semibold text-[var(--foreground)] mb-4">Change Email</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[var(--muted)]">Current password</label>
          <input
            type="password"
            required
            value={form.currentPassword}
            onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[var(--muted)]">New email</label>
          <input
            type="email"
            required
            value={form.newEmail}
            onChange={e => setForm(f => ({ ...f, newEmail: e.target.value }))}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {msg && <p className="text-sm text-green-400">{msg}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Update email'}
        </button>
      </form>
    </div>
  );
}
