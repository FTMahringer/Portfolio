'use client';

import { Card, Field, inputClass, SaveButton, SettingsFormShell } from '../_components/SettingsFormShell';
import { updateSettings } from '../_components/settings-form-utils';

export default function IntegrationsSettingsPage() {
  return (
    <SettingsFormShell title="Integrations" description="Edit contact delivery, comments, and analytics settings stored in config/site.yaml.">
      {({ settings, setSettings, save, saving }) => (
        <div className="space-y-6">
          <Card title="Contact">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Resend from">
                <input value={settings.contact.resend_from} onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, contact: { ...current.contact, resend_from: event.target.value } }))} className={inputClass} />
              </Field>
              <Field label="Contact recipient">
                <input value={settings.contact.to} onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, contact: { ...current.contact, to: event.target.value } }))} className={inputClass} />
              </Field>
            </div>
          </Card>

          <Card title="Comments / Giscus">
            <div className="grid gap-4 md:grid-cols-2">
              <Toggle label="Enabled" checked={settings.giscus.enabled} onChange={(checked) => updateSettings(setSettings, (current) => ({ ...current, giscus: { ...current.giscus, enabled: checked } }))} />
              <Toggle label="Reactions enabled" checked={settings.giscus.reactionsEnabled} onChange={(checked) => updateSettings(setSettings, (current) => ({ ...current, giscus: { ...current.giscus, reactionsEnabled: checked } }))} />
              <Toggle label="Emit metadata" checked={settings.giscus.emitMetadata} onChange={(checked) => updateSettings(setSettings, (current) => ({ ...current, giscus: { ...current.giscus, emitMetadata: checked } }))} />
              {(['repo', 'repoId', 'category', 'categoryId', 'mapping', 'inputPosition', 'theme', 'lang'] as const).map((key) => (
                <Field key={key} label={labelFor(key)}>
                  <input value={String(settings.giscus[key])} onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, giscus: { ...current.giscus, [key]: event.target.value } }))} className={inputClass} />
                </Field>
              ))}
            </div>
          </Card>

          <Card title="Analytics">
            <div className="space-y-6">
              <Field label="Provider">
                <select
                  value={settings.analytics.provider}
                  onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, analytics: { ...current.analytics, provider: event.target.value as 'umami' | 'plausible' | 'none' } }))}
                  className={inputClass}
                >
                  <option value="none">None</option>
                  <option value="umami">Umami</option>
                  <option value="plausible">Plausible</option>
                </select>
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Toggle label="Umami enabled" checked={settings.analytics.umami.enabled} onChange={(checked) => updateSettings(setSettings, (current) => ({ ...current, analytics: { ...current.analytics, umami: { ...current.analytics.umami, enabled: checked } } }))} />
                <Field label="Umami website ID">
                  <input value={settings.analytics.umami.websiteId} onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, analytics: { ...current.analytics, umami: { ...current.analytics.umami, websiteId: event.target.value } } }))} className={inputClass} />
                </Field>
                <Field label="Umami script URL">
                  <input value={settings.analytics.umami.scriptUrl} onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, analytics: { ...current.analytics, umami: { ...current.analytics.umami, scriptUrl: event.target.value } } }))} className={inputClass} />
                </Field>
                <Toggle label="Plausible enabled" checked={settings.analytics.plausible.enabled} onChange={(checked) => updateSettings(setSettings, (current) => ({ ...current, analytics: { ...current.analytics, plausible: { ...current.analytics.plausible, enabled: checked } } }))} />
                <Field label="Plausible domain">
                  <input value={settings.analytics.plausible.domain} onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, analytics: { ...current.analytics, plausible: { ...current.analytics.plausible, domain: event.target.value } } }))} className={inputClass} />
                </Field>
                <Field label="Plausible script URL">
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

function labelFor(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
