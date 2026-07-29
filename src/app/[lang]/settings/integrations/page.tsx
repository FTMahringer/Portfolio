'use client';

import { Card, Field, inputClass, SaveButton, SettingsFormShell } from '../_components/SettingsFormShell';
import { updateSettings } from '../_components/settings-form-utils';
import { useTranslations } from '@/context/TranslationContext';

export default function IntegrationsSettingsPage() {
  const { t } = useTranslations();

  return (
    <SettingsFormShell title={t('settings.pages.integrations.title')} description={t('settings.pages.integrations.description')}>
      {({ settings, setSettings, save, saving }) => (
        <div className="space-y-6">
          <Card title={t('settings.pages.integrations.sections.contact.title')}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('settings.pages.integrations.fields.resendFrom')}>
                <input value={settings.contact.resend_from} onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, contact: { ...current.contact, resend_from: event.target.value } }))} className={inputClass} />
              </Field>
              <Field label={t('settings.pages.integrations.fields.contactRecipient')}>
                <input value={settings.contact.to} onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, contact: { ...current.contact, to: event.target.value } }))} className={inputClass} />
              </Field>
            </div>
          </Card>

          <Card title={t('settings.pages.integrations.sections.comments.title')}>
            <div className="grid gap-4 md:grid-cols-2">
              <Toggle label={t('settings.pages.integrations.fields.enabled')} checked={settings.giscus.enabled} onChange={(checked) => updateSettings(setSettings, (current) => ({ ...current, giscus: { ...current.giscus, enabled: checked } }))} />
              <Toggle label={t('settings.pages.integrations.fields.reactionsEnabled')} checked={settings.giscus.reactionsEnabled} onChange={(checked) => updateSettings(setSettings, (current) => ({ ...current, giscus: { ...current.giscus, reactionsEnabled: checked } }))} />
              <Toggle label={t('settings.pages.integrations.fields.emitMetadata')} checked={settings.giscus.emitMetadata} onChange={(checked) => updateSettings(setSettings, (current) => ({ ...current, giscus: { ...current.giscus, emitMetadata: checked } }))} />
              {(['repo', 'repoId', 'category', 'categoryId', 'mapping', 'inputPosition', 'theme', 'lang'] as const).map((key) => (
                <Field key={key} label={t(`settings.pages.integrations.giscusFields.${key}`)}>
                  <input value={String(settings.giscus[key])} onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, giscus: { ...current.giscus, [key]: event.target.value } }))} className={inputClass} />
                </Field>
              ))}
            </div>
          </Card>

          <Card title={t('settings.pages.integrations.sections.analytics.title')}>
            <div className="space-y-6">
              <Field label={t('settings.pages.integrations.fields.provider')}>
                <select
                  value={settings.analytics.provider}
                  onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, analytics: { ...current.analytics, provider: event.target.value as 'umami' | 'plausible' | 'none' } }))}
                  className={inputClass}
                >
                  <option value="none">{t('settings.pages.integrations.providerOptions.none')}</option>
                  <option value="umami">{t('settings.pages.integrations.providerOptions.umami')}</option>
                  <option value="plausible">{t('settings.pages.integrations.providerOptions.plausible')}</option>
                </select>
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Toggle label={t('settings.pages.integrations.fields.umamiEnabled')} checked={settings.analytics.umami.enabled} onChange={(checked) => updateSettings(setSettings, (current) => ({ ...current, analytics: { ...current.analytics, umami: { ...current.analytics.umami, enabled: checked } } }))} />
                <Field label={t('settings.pages.integrations.fields.umamiWebsiteId')}>
                  <input value={settings.analytics.umami.websiteId} onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, analytics: { ...current.analytics, umami: { ...current.analytics.umami, websiteId: event.target.value } } }))} className={inputClass} />
                </Field>
                <Field label={t('settings.pages.integrations.fields.umamiScriptUrl')}>
                  <input value={settings.analytics.umami.scriptUrl} onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, analytics: { ...current.analytics, umami: { ...current.analytics.umami, scriptUrl: event.target.value } } }))} className={inputClass} />
                </Field>
                <Toggle label={t('settings.pages.integrations.fields.plausibleEnabled')} checked={settings.analytics.plausible.enabled} onChange={(checked) => updateSettings(setSettings, (current) => ({ ...current, analytics: { ...current.analytics, plausible: { ...current.analytics.plausible, enabled: checked } } }))} />
                <Field label={t('settings.pages.integrations.fields.plausibleDomain')}>
                  <input value={settings.analytics.plausible.domain} onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, analytics: { ...current.analytics, plausible: { ...current.analytics.plausible, domain: event.target.value } } }))} className={inputClass} />
                </Field>
                <Field label={t('settings.pages.integrations.fields.plausibleScriptUrl')}>
                  <input value={settings.analytics.plausible.scriptUrl} onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, analytics: { ...current.analytics, plausible: { ...current.analytics.plausible, scriptUrl: event.target.value } } }))} className={inputClass} />
                </Field>
              </div>
            </div>
          </Card>

          <SaveButton onClick={save} saving={saving} />
        </div>
      )}
    </SettingsFormShell>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
