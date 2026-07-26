'use client';

import type React from 'react';
import type { ContentFeatureKey } from '@/lib/site-settings';
import { Card, Field, inputClass, SaveButton, SettingsFormShell } from '../_components/SettingsFormShell';
import { updateSettings } from '../_components/settings-form-utils';

const FEATURE_KEYS: ContentFeatureKey[] = ['projects', 'blog', 'experience'];

export default function FeatureSettingsPage() {
  return (
    <SettingsFormShell title="Feature Visibility" description="Disable portfolio features everywhere they appear in public and admin UI.">
      {({ settings, setSettings, save, saving }) => (
        <div className="space-y-6">
          {FEATURE_KEYS.map((featureKey) => {
            const feature = settings.features[featureKey];
            return (
              <Card key={featureKey} title={feature.label} description={`Controls visibility for ${featureKey}.`}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Label">
                    <input value={feature.label} onChange={(event) => updateFeature(setSettings, featureKey, { label: event.target.value })} className={inputClass} />
                  </Field>
                  <Field label="Route">
                    <input value={feature.route} onChange={(event) => updateFeature(setSettings, featureKey, { route: event.target.value })} className={inputClass} />
                  </Field>
                  <Toggle label="Enabled" checked={feature.enabled} onChange={(checked) => updateFeature(setSettings, featureKey, { enabled: checked })} />
                  <Toggle label="Show in navigation" checked={feature.showInNavigation} onChange={(checked) => updateFeature(setSettings, featureKey, { showInNavigation: checked })} />
                  <Toggle label="Show in content manager" checked={feature.showInContentManager} onChange={(checked) => updateFeature(setSettings, featureKey, { showInContentManager: checked })} />
                  <Toggle label="Show on homepage" checked={feature.showOnHomepage} onChange={(checked) => updateFeature(setSettings, featureKey, { showOnHomepage: checked })} />
                  {featureKey === 'experience' && (
                    <Toggle
                      label="Show in project relation picker"
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
