'use client';

import { Card, Field, inputClass, SaveButton, SettingsFormShell, textareaClass } from '../_components/SettingsFormShell';
import { joinList, splitList, updateSettings } from '../_components/settings-form-utils';

export default function SiteSettingsPage() {
  return (
    <SettingsFormShell title="Site Identity" description="Edit the main site, social profile, and sidebar skill settings stored in config/site.yaml.">
      {({ settings, setSettings, save, saving }) => (
        <div className="space-y-6">
          <Card title="Main site" description="These values feed metadata, homepage copy, and contact links.">
            <div className="grid gap-4 md:grid-cols-2">
              {(['title', 'tagline', 'url', 'email', 'location', 'avatar'] as const).map((key) => (
                <Field key={key} label={labelFor(key)}>
                  <input
                    value={settings.site[key]}
                    onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, site: { ...current.site, [key]: event.target.value } }))}
                    className={inputClass}
                  />
                </Field>
              ))}
              <div className="md:col-span-2">
                <Field label="Bio">
                  <textarea
                    value={settings.site.bio}
                    onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, site: { ...current.site, bio: event.target.value } }))}
                    className={textareaClass}
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card title="Social links" description="Store usernames or IDs used by the public site.">
            <div className="grid gap-4 md:grid-cols-2">
              {(['github', 'linkedin', 'twitter', 'instagram', 'youtube', 'email'] as const).map((key) => (
                <Field key={key} label={labelFor(key)}>
                  <input
                    value={settings.social[key]}
                    onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, social: { ...current.social, [key]: event.target.value } }))}
                    className={inputClass}
                  />
                </Field>
              ))}
            </div>
          </Card>

          <Card title="Sidebar skills" description="Groups shown in the About page sidebar. Items are comma-separated.">
            <div className="space-y-4">
              {settings.sidebar_skills.map((group, index) => (
                <div key={`${group.category}-${index}`} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <div className="grid gap-4 md:grid-cols-[1fr_2fr_auto] md:items-end">
                    <Field label="Category">
                      <input
                        value={group.category}
                        onChange={(event) => updateSettings(setSettings, (current) => ({
                          ...current,
                          sidebar_skills: current.sidebar_skills.map((item, itemIndex) => itemIndex === index ? { ...item, category: event.target.value } : item),
                        }))}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Items">
                      <input
                        value={joinList(group.items)}
                        onChange={(event) => updateSettings(setSettings, (current) => ({
                          ...current,
                          sidebar_skills: current.sidebar_skills.map((item, itemIndex) => itemIndex === index ? { ...item, items: splitList(event.target.value) } : item),
                        }))}
                        className={inputClass}
                      />
                    </Field>
                    <button
                      type="button"
                      onClick={() => updateSettings(setSettings, (current) => ({ ...current, sidebar_skills: current.sidebar_skills.filter((_, itemIndex) => itemIndex !== index) }))}
                      className="rounded-xl border border-red-400/30 px-3 py-2 text-sm text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => updateSettings(setSettings, (current) => ({ ...current, sidebar_skills: [...current.sidebar_skills, { category: 'New Category', items: [] }] }))}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)]"
              >
                Add skill group
              </button>
            </div>
          </Card>

          <SaveButton onClick={save} saving={saving} />
        </div>
      )}
    </SettingsFormShell>
  );
}

function labelFor(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
