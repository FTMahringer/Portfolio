'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/context/TranslationContext';



const PROVIDER_ICON_MAP: Record<string, string> = {
  oidc: '🔑',
  google: '🔵',
  microsoft: '🟦',
  entra: '🔷',
  okta: '⭕',
  zitadel: '🟣',
  pocketid: '🪪',
  authentik: '🔴',
  keycloak: '🔐',
};

const PROVIDER_TYPE_KEYS = ['oidc', 'google', 'microsoft', 'entra', 'okta', 'zitadel', 'pocketid', 'authentik', 'keycloak'] as const;



interface SubFieldConfig {
  labelKey: string;
  placeholder: string;
}

const SUB_FIELDS: Record<string, SubFieldConfig> = {
  microsoft: { labelKey: 'settings.pages.authProviders.subFields.tenantId', placeholder: 'your-tenant-id' },
  entra: { labelKey: 'settings.pages.authProviders.subFields.tenantId', placeholder: 'your-tenant-id' },
  okta: { labelKey: 'settings.pages.authProviders.subFields.domain', placeholder: 'yourcompany' },
  zitadel: { labelKey: 'settings.pages.authProviders.subFields.instance', placeholder: 'yourinstance' },
  authentik: { labelKey: 'settings.pages.authProviders.subFields.applicationSlug', placeholder: 'my-app' },
  keycloak: { labelKey: 'settings.pages.authProviders.subFields.realm', placeholder: 'master' },
};

function computeIssuerUrl(type: string, subField: string): string {
  switch (type) {
    case 'google':    return 'https://accounts.google.com';
    case 'microsoft': return `https://login.microsoftonline.com/${subField || '{tenant}'}/v2.0`;
    case 'entra':     return `https://login.microsoftonline.com/${subField || '{tenant}'}/v2.0`;
    case 'okta':      return `https://${subField || '{domain}'}.okta.com`;
    case 'zitadel':   return `https://${subField || '{instance}'}.zitadel.cloud`;
    case 'authentik': return `https://auth.example.com/application/o/${subField || '{slug}'}/`;
    case 'keycloak':  return `https://keycloak.example.com/realms/${subField || '{realm}'}`;
    default:          return '';
  }
}

function isIssuerEditable(type: string): boolean {
  return type === 'oidc' || type === 'pocketid';
}

interface Provider {
  id: number;
  name: string;
  type: string;
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string | null;
  allowedEmail: string | null;
  enabled: number;
  createdAt: number;
}

interface FormState {
  type: string;
  name: string;
  subField: string;
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  allowedEmail: string;
}

const defaultForm: FormState = {
  type: 'oidc',
  name: '',
  subField: '',
  issuerUrl: '',
  clientId: '',
  clientSecret: '',
  allowedEmail: '',
};

export default function AuthProvidersPage() {
  const { t } = useTranslations();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth-providers');
      if (res.ok) {
        const data = await res.json() as Provider[];
        setProviders(data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function openAdd() {
    setForm(defaultForm);
    setEditingId(null);
    setShowSecret(false);
    setModalOpen(true);
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
    });
    setEditingId(p.id);
    setShowSecret(false);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(defaultForm);
  }

  function handleTypeChange(type: string) {
    const issuerUrl = isIssuerEditable(type) ? '' : computeIssuerUrl(type, '');
    setForm(f => ({ ...f, type, subField: '', issuerUrl }));
  }

  function handleSubFieldChange(val: string) {
    const issuerUrl = computeIssuerUrl(form.type, val);
    setForm(f => ({ ...f, subField: val, issuerUrl }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name,
        type: form.type,
        issuerUrl: form.issuerUrl,
        clientId: form.clientId,
        clientSecret: form.clientSecret,
        allowedEmail: form.allowedEmail || undefined,
      };
      let res: Response;
      if (editingId !== null) {
        res = await fetch(`/api/admin/auth-providers/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch('/api/admin/auth-providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      if (res.ok) {
        closeModal();
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(p: Provider) {
    const newEnabled = p.enabled === 1 ? 0 : 1;
    await fetch(`/api/admin/auth-providers/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: newEnabled }),
    });
    await load();
  }

  async function handleDelete(p: Provider) {
    if (!confirm(`${t('settings.pages.authProviders.confirmDelete')} ${p.name}?`)) return;
    await fetch(`/api/admin/auth-providers/${p.id}`, { method: 'DELETE' });
    await load();
  }

  function copyCallback() {
    void navigator.clipboard.writeText(`${origin}/api/admin/auth/callback`);
  }

  const typeInfo = (type: string) => ({
    icon: PROVIDER_ICON_MAP[type] ?? '🔑',
    label: t(`settings.pages.authProviders.providerTypes.${type}`),
  });
  const subFieldConfig = SUB_FIELDS[form.type];
  const issuerReadOnly = !isIssuerEditable(form.type);

  const inputCls = 'bg-[var(--muted-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] w-full focus:outline-none focus:border-green-400/50';
  const readonlyInputCls = `${inputCls} opacity-50 cursor-default`;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{t('settings.pages.authProviders.title')}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{t('settings.pages.authProviders.description')}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-400/10 text-green-400 border border-green-400/20 text-sm font-medium hover:bg-green-400/20 transition-colors"
        >
          {t('settings.pages.authProviders.actions.addProvider')}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted)] animate-pulse">{t('settings.pages.authProviders.loading')}</p>
      ) : providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <p className="text-[var(--muted)] text-sm">{t('settings.pages.authProviders.empty')}</p>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-400/10 text-green-400 border border-green-400/20 text-sm font-medium hover:bg-green-400/20 transition-colors"
          >
            {t('settings.pages.authProviders.actions.addProvider')}
          </button>
        </div>
      ) : (
        <div className="border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted-bg)]">
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">{t('settings.pages.authProviders.table.provider')}</th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">{t('settings.pages.authProviders.table.issuer')}</th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">{t('settings.pages.authProviders.table.enabled')}</th>
                <th className="text-right px-4 py-3 text-[var(--muted)] font-medium">{t('settings.pages.authProviders.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {providers.map(p => {
                const info = typeInfo(p.type);
                return (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted-bg)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{info.icon}</span>
                        <div>
                          <div className="font-medium text-[var(--foreground)]">{p.name}</div>
                          <div className="text-xs text-[var(--muted)]">{info.label}</div>
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
                        aria-label={p.enabled === 1 ? t('settings.pages.authProviders.actions.disableProvider') : t('settings.pages.authProviders.actions.enableProvider')}
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
                          {t('settings.pages.authProviders.actions.edit')}
                        </button>
                        <button
                          onClick={() => void handleDelete(p)}
                          className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-400/10 border border-red-400/20 transition-colors"
                        >
                          {t('settings.pages.authProviders.actions.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl">
            <div className="px-6 pt-6 pb-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {editingId !== null ? t('settings.pages.authProviders.modal.editTitle') : t('settings.pages.authProviders.modal.addTitle')}
              </h2>
              <p className="text-xs text-[var(--muted)] mt-1">{t('settings.pages.authProviders.modal.description')}</p>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">{t('settings.pages.authProviders.fields.providerType')}</label>
                <select
                  value={form.type}
                  onChange={e => handleTypeChange(e.target.value)}
                  className={inputCls}
                >
                  {PROVIDER_TYPE_KEYS.map((value) => (
                    <option key={value} value={value}>{PROVIDER_ICON_MAP[value] ?? '🔑'} {t(`settings.pages.authProviders.providerTypes.${value}`)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">{t('settings.pages.authProviders.fields.name')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('settings.pages.authProviders.placeholders.name')}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputCls}
                />
              </div>

              {subFieldConfig && (
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">{t(subFieldConfig.labelKey)}</label>
                  <input
                    type="text"
                    placeholder={subFieldConfig.placeholder}
                    value={form.subField}
                    onChange={e => handleSubFieldChange(e.target.value)}
                    className={inputCls}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">{t('settings.pages.authProviders.fields.issuerUrl')}</label>
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

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">{t('settings.pages.authProviders.fields.clientId')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('settings.pages.authProviders.placeholders.clientId')}
                  value={form.clientId}
                  onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">{t('settings.pages.authProviders.fields.clientSecret')}</label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    required
                    placeholder={editingId !== null ? t('settings.pages.authProviders.placeholders.keepSecret') : t('settings.pages.authProviders.placeholders.clientSecret')}
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

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">{t('settings.pages.authProviders.fields.callbackUrl')}</label>
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
                    {t('settings.pages.authProviders.actions.copy')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                  {t('settings.pages.authProviders.fields.allowedEmail')} <span className="text-[var(--muted)] font-normal">({t('settings.pages.authProviders.optional')})</span>
                </label>
                <input
                  type="email"
                  placeholder={t('settings.pages.authProviders.placeholders.allowedEmail')}
                  value={form.allowedEmail}
                  onChange={e => setForm(f => ({ ...f, allowedEmail: e.target.value }))}
                  className={inputCls}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors"
                >
                  {t('settings.pages.authProviders.actions.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-400/10 border border-green-400/20 text-green-400 text-sm font-medium hover:bg-green-400/20 disabled:opacity-50 transition-colors"
                >
                  {saving ? t('settings.pages.authProviders.actions.saving') : editingId !== null ? t('settings.pages.authProviders.actions.saveChanges') : t('settings.pages.authProviders.actions.addProvider')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
