'use client';

import { Card, Field, inputClass, SaveButton, SettingsFormShell, textareaClass } from '../_components/SettingsFormShell';
import { joinList, splitList, updateSettings } from '../_components/settings-form-utils';
import { useTranslations } from '@/context/TranslationContext';

export default function SiteSettingsPage() {
  const { t } = useTranslations();

  return (
    <SettingsFormShell title={t('settings.pages.site.title')} description={t('settings.pages.site.description')}>
      {({ settings, setSettings, save, saving }) => (
        <div className="space-y-6">
          <Card title={t('settings.pages.site.sections.main.title')} description={t('settings.pages.site.sections.main.description')}>
            <div className="grid gap-4 md:grid-cols-2">
              {(['title', 'tagline', 'url', 'email', 'location', 'avatar'] as const).map((key) => (
                <Field key={key} label={t(`settings.pages.site.fields.${key}`)}>
                  <input
                    value={settings.site[key]}
                    onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, site: { ...current.site, [key]: event.target.value } }))}
                    className={inputClass}
                  />
                </Field>
              ))}
              <div className="md:col-span-2">
                <Field label={t('settings.pages.site.fields.bio')}>
                  <textarea
                    value={settings.site.bio}
                    onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, site: { ...current.site, bio: event.target.value } }))}
                    className={textareaClass}
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card title={t('settings.pages.site.sections.social.title')} description={t('settings.pages.site.sections.social.description')}>
            <div className="grid gap-4 md:grid-cols-2">
              {(['github', 'linkedin', 'twitter', 'instagram', 'youtube', 'email'] as const).map((key) => (
                <Field key={key} label={t(`settings.pages.site.fields.${key}`)}>
                  <input
                    value={settings.social[key]}
                    onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, social: { ...current.social, [key]: event.target.value } }))}
                    className={inputClass}
                  />
                </Field>
              ))}
            </div>
          </Card>

          <Card title={t('settings.pages.site.sections.skills.title')} description={t('settings.pages.site.sections.skills.description')}>
            <div className="space-y-4">
              {settings.sidebar_skills.map((group, index) => (
                <div key={`${group.category}-${index}`} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <div className="grid gap-4 md:grid-cols-[1fr_2fr_auto] md:items-end">
                    <Field label={t('settings.pages.site.fields.category')}>
                      <input
                        value={group.category}
                        onChange={(event) => updateSettings(setSettings, (current) => ({
                          ...current,
                          sidebar_skills: current.sidebar_skills.map((item, itemIndex) => itemIndex === index ? { ...item, category: event.target.value } : item),
                        }))}
                        className={inputClass}
                      />
                    </Field>
                    <Field label={t('settings.pages.site.fields.items')}>
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
                      {t('settings.pages.site.actions.remove')}
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => updateSettings(setSettings, (current) => ({ ...current, sidebar_skills: [...current.sidebar_skills, { category: 'New Category', items: [] }] }))}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)]"
              >
                {t('settings.pages.site.actions.addSkillGroup')}
              </button>
            </div>
          </Card>

          <SaveButton onClick={save} saving={saving} />
        </div>
      )}
    </SettingsFormShell>
  );
}
