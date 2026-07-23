'use client'

import { useEffect, useState } from 'react'

const PROVIDER_TYPES = [
  { value: 'oidc',      label: 'OIDC (Generic)',   icon: '🔑' },
  { value: 'google',    label: 'Google',            icon: '🔵' },
  { value: 'microsoft', label: 'Microsoft',         icon: '🟦' },
  { value: 'entra',     label: 'Microsoft Entra',   icon: '🔷' },
  { value: 'okta',      label: 'Okta',              icon: '⭕' },
  { value: 'zitadel',   label: 'Zitadel',           icon: '🟣' },
  { value: 'pocketid',  label: 'PocketID',          icon: '🪪' },
  { value: 'authentik', label: 'Authentik',         icon: '🔴' },
  { value: 'keycloak',  label: 'Keycloak',          icon: '🔐' },
]

interface SubFieldConfig {
  label: string
  placeholder: string
}

const SUB_FIELDS: Record<string, SubFieldConfig> = {
  microsoft: { label: 'Tenant ID', placeholder: 'your-tenant-id' },
  entra:     { label: 'Tenant ID', placeholder: 'your-tenant-id' },
  okta:      { label: 'Domain',    placeholder: 'yourcompany' },
  zitadel:   { label: 'Instance',  placeholder: 'yourinstance' },
  authentik: { label: 'Application Slug', placeholder: 'my-app' },
  keycloak:  { label: 'Realm',     placeholder: 'master' },
}

function computeIssuerUrl(type: string, subField: string): string {
  switch (type) {
    case 'google':    return 'https://accounts.google.com'
    case 'microsoft': return `https://login.microsoftonline.com/${subField || '{tenant}'}/v2.0`
    case 'entra':     return `https://login.microsoftonline.com/${subField || '{tenant}'}/v2.0`
    case 'okta':      return `https://${subField || '{domain}'}.okta.com`
    case 'zitadel':   return `https://${subField || '{instance}'}.zitadel.cloud`
    case 'authentik': return `https://auth.example.com/application/o/${subField || '{slug}'}/`
    case 'keycloak':  return `https://keycloak.example.com/realms/${subField || '{realm}'}`
    default:          return ''
  }
}

function isIssuerEditable(type: string): boolean {
  return type === 'oidc' || type === 'pocketid'
}

interface Provider {
  id: number
  name: string
  type: string
  issuerUrl: string
  clientId: string
  clientSecret: string
  redirectUri: string | null
  allowedEmail: string | null
  enabled: number
  createdAt: number
}

interface FormState {
  type: string
  name: string
  subField: string
  issuerUrl: string
  clientId: string
  clientSecret: string
  allowedEmail: string
}

const defaultForm: FormState = {
  type: 'oidc',
  name: '',
  subField: '',
  issuerUrl: '',
  clientId: '',
  clientSecret: '',
  allowedEmail: '',
}

export default function AuthProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [showSecret, setShowSecret] = useState(false)
  const [saving, setSaving] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth-providers')
      if (res.ok) {
        const data = await res.json() as Provider[]
        setProviders(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  function openAdd() {
    setForm(defaultForm)
    setEditingId(null)
    setShowSecret(false)
    setModalOpen(true)
  }

  function openEdit(p: Provider) {
    setForm({
      type: p.type,
      name: p.name,
      subField: '',
      issuerUrl: p.issuerUrl,
      clientId: p.clientId,
      clientSecret: '***',
      allowedEmail: p.allowedEmail ?? '',
    })
    setEditingId(p.id)
    setShowSecret(false)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
    setForm(defaultForm)
  }

  function handleTypeChange(type: string) {
    const issuerUrl = isIssuerEditable(type) ? '' : computeIssuerUrl(type, '')
    setForm(f => ({ ...f, type, subField: '', issuerUrl }))
  }

  function handleSubFieldChange(val: string) {
    const issuerUrl = computeIssuerUrl(form.type, val)
    setForm(f => ({ ...f, subField: val, issuerUrl }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {
        name: form.name,
        type: form.type,
        issuerUrl: form.issuerUrl,
        clientId: form.clientId,
        clientSecret: form.clientSecret,
        allowedEmail: form.allowedEmail || undefined,
      }
      let res: Response
      if (editingId !== null) {
        res = await fetch(`/api/admin/auth-providers/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/auth-providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }
      if (res.ok) {
        closeModal()
        await load()
      }
    } finally {
      setSaving(false)
    }
  }

  async function toggleEnabled(p: Provider) {
    const newEnabled = p.enabled === 1 ? 0 : 1
    await fetch(`/api/admin/auth-providers/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: newEnabled }),
    })
    await load()
  }

  async function handleDelete(p: Provider) {
    if (!confirm(`Delete provider "${p.name}"?`)) return
    await fetch(`/api/admin/auth-providers/${p.id}`, { method: 'DELETE' })
    await load()
  }

  function copyCallback() {
    void navigator.clipboard.writeText(`${origin}/api/admin/auth/callback`)
  }

  const typeInfo = (type: string) => PROVIDER_TYPES.find(t => t.value === type)
  const subFieldConfig = SUB_FIELDS[form.type]
  const issuerReadOnly = !isIssuerEditable(form.type)

  const inputCls = 'bg-[var(--muted-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] w-full focus:outline-none focus:border-green-400/50'
  const readonlyInputCls = `${inputCls} opacity-50 cursor-default`

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Auth Providers</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Manage OIDC / SSO identity providers for admin login.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-400/10 text-green-400 border border-green-400/20 text-sm font-medium hover:bg-green-400/20 transition-colors"
        >
          + Add Provider
        </button>
      </div>

      {/* Table / Empty state */}
      {loading ? (
        <p className="text-sm text-[var(--muted)] animate-pulse">Loading…</p>
      ) : providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <p className="text-[var(--muted)] text-sm">No auth providers configured yet.</p>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-400/10 text-green-400 border border-green-400/20 text-sm font-medium hover:bg-green-400/20 transition-colors"
          >
            + Add Provider
          </button>
        </div>
      ) : (
        <div className="border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted-bg)]">
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Provider</th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Issuer</th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">Enabled</th>
                <th className="text-right px-4 py-3 text-[var(--muted)] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map(p => {
                const info = typeInfo(p.type)
                return (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted-bg)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{info?.icon ?? '🔑'}</span>
                        <div>
                          <div className="font-medium text-[var(--foreground)]">{p.name}</div>
                          <div className="text-xs text-[var(--muted)]">{info?.label ?? p.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)] max-w-xs truncate">
                      {p.issuerUrl}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => void toggleEnabled(p)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.enabled === 1 ? 'bg-green-400' : 'bg-[var(--border)]'}`}
                        aria-label={p.enabled === 1 ? 'Disable provider' : 'Enable provider'}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${p.enabled === 1 ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(p)}
                          className="px-3 py-1.5 rounded-lg text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] border border-[var(--border)] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => void handleDelete(p)}
                          className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-400/10 border border-red-400/20 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl">
            {/* Modal header */}
            <div className="px-6 pt-6 pb-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {editingId !== null ? 'Edit Identity Provider' : 'Add Identity Provider'}
              </h2>
              <p className="text-xs text-[var(--muted)] mt-1">Configure an OIDC / SSO identity provider for admin login.</p>
            </div>

            {/* Form */}
            <form onSubmit={(e) => void handleSubmit(e)} className="px-6 py-5 space-y-4">
              {/* Provider Type */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Provider Type</label>
                <select
                  value={form.type}
                  onChange={e => handleTypeChange(e.target.value)}
                  className={inputCls}
                >
                  {PROVIDER_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  placeholder="My Identity Provider"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputCls}
                />
              </div>

              {/* Sub-field (tenant/domain/etc.) */}
              {subFieldConfig && (
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">{subFieldConfig.label}</label>
                  <input
                    type="text"
                    placeholder={subFieldConfig.placeholder}
                    value={form.subField}
                    onChange={e => handleSubFieldChange(e.target.value)}
                    className={inputCls}
                  />
                </div>
              )}

              {/* Issuer URL */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Issuer URL</label>
                {issuerReadOnly ? (
                  <input
                    type="text"
                    readOnly
                    value={form.issuerUrl}
                    placeholder={form.type === 'pocketid' ? 'https://pocketid.example.com' : ''}
                    className={readonlyInputCls}
                  />
                ) : (
                  <input
                    type="text"
                    required
                    placeholder={form.type === 'pocketid' ? 'https://pocketid.example.com' : 'https://auth.example.com'}
                    value={form.issuerUrl}
                    onChange={e => setForm(f => ({ ...f, issuerUrl: e.target.value }))}
                    className={inputCls}
                  />
                )}
              </div>

              {/* Client ID */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Client ID</label>
                <input
                  type="text"
                  required
                  placeholder="your-client-id"
                  value={form.clientId}
                  onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                  className={inputCls}
                />
              </div>

              {/* Client Secret */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Client Secret</label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    required
                    placeholder={editingId !== null ? 'Leave as *** to keep current' : 'your-client-secret'}
                    value={form.clientSecret}
                    onChange={e => setForm(f => ({ ...f, clientSecret: e.target.value }))}
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(s => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] text-xs"
                    tabIndex={-1}
                  >
                    {showSecret ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {/* Redirect / Callback URL */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Redirect / Callback URL</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={`${origin}/api/admin/auth/callback`}
                    className={`${readonlyInputCls} pr-16`}
                  />
                  <button
                    type="button"
                    onClick={copyCallback}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-green-400 transition-colors px-1.5 py-0.5 rounded border border-[var(--border)] hover:border-green-400/40"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Allowed Email */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Allowed Email <span className="text-[var(--muted)] font-normal">(optional)</span></label>
                <input
                  type="email"
                  placeholder="anyone@example.com"
                  value={form.allowedEmail}
                  onChange={e => setForm(f => ({ ...f, allowedEmail: e.target.value }))}
                  className={inputCls}
                />
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-400/10 border border-green-400/20 text-green-400 text-sm font-medium hover:bg-green-400/20 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving…' : editingId !== null ? 'Save Changes' : 'Add Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
