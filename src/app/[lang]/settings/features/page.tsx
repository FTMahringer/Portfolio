'use client';

import type React from 'react';
import type { ContentFeatureKey } from '@/lib/site-settings-types';
import { Card, Field, inputClass, SaveButton, SettingsFormShell } from '../_components/SettingsFormShell';
import { updateSettings } from '../_components/settings-form-utils';
import { useTranslations } from '@/context/TranslationContext';

const FEATURE_KEYS: ContentFeatureKey[] = ['projects', 'blog', 'experience'];

export default function FeatureSettingsPage() {
  const { t } = useTranslations();

  return (
    <SettingsFormShell title={t('settings.pages.features.title')} description={t('settings.pages.features.description')}>
      {({ settings, setSettings, save, saving }) => (
        <div className="space-y-6">
          {FEATURE_KEYS.map((featureKey) => {
            const feature = settings.features[featureKey];
            return (
              <Card key={featureKey} title={feature.label} description={t('settings.pages.features.cardDescription')}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t('settings.pages.features.fields.label')}>
                    <input value={feature.label} onChange={(event) => updateFeature(setSettings, featureKey, { label: event.target.value })} className={inputClass} />
                  </Field>
                  <Field label={t('settings.pages.features.fields.route')}>
                    <input value={feature.route} onChange={(event) => updateFeature(setSettings, featureKey, { route: event.target.value })} className={inputClass} />
                  </Field>
                  <Toggle label={t('settings.pages.features.fields.enabled')} checked={feature.enabled} onChange={(checked) => updateFeature(setSettings, featureKey, { enabled: checked })} />
                  <Toggle label={t('settings.pages.features.fields.showInNavigation')} checked={feature.showInNavigation} onChange={(checked) => updateFeature(setSettings, featureKey, { showInNavigation: checked })} />
                  <Toggle label={t('settings.pages.features.fields.showInContentManager')} checked={feature.showInContentManager} onChange={(checked) => updateFeature(setSettings, featureKey, { showInContentManager: checked })} />
                  <Toggle label={t('settings.pages.features.fields.showOnHomepage')} checked={feature.showOnHomepage} onChange={(checked) => updateFeature(setSettings, featureKey, { showOnHomepage: checked })} />
                  {featureKey === 'experience' && (
                    <Toggle
                      label={t('settings.pages.features.fields.showInProjectRelationPicker')}
                      checked={Boolean(feature.showInProjectRelations)}
                      onChange={(checked) => updateFeature(setSettings, featureKey, { showInProjectRelations: checked })}
                    />
                  )}
                </div>
              </Card>
            );
          })}
          <SaveButton onClick={save} saving={saving} />
        </div>
      )}
    </SettingsFormShell>
  );
}

function updateFeature(
  setSettings: React.Dispatch<React.SetStateAction<import('@/lib/site-settings').SiteSettings | null>>,
  feature: ContentFeatureKey,
  patch: Partial<import('@/lib/site-settings').FeatureSettings>,
) {
  updateSettings(setSettings, (current) => ({
    ...current,
    features: {
      ...current.features,
      [feature]: {
        ...current.features[feature],
        ...patch,
      },
    },
  }));
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
