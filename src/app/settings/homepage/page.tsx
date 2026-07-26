'use client';

import type React from 'react';
import type { HomepageStatComputedKey, HomepageStatItem } from '@/lib/site-settings';
import { Card, Field, inputClass, SaveButton, SettingsFormShell } from '../_components/SettingsFormShell';
import { moveItem, updateSettings } from '../_components/settings-form-utils';

const COMPUTED_KEYS: HomepageStatComputedKey[] = ['yearsOfExperience', 'totalProjects', 'totalBlogPosts'];

export default function HomepageSettingsPage() {
  return (
    <SettingsFormShell title="Homepage" description="Configure showcase numbers shown on the homepage. Computed entries use live app data; manual entries use a saved value.">
      {({ settings, setSettings, save, saving }) => (
        <div className="space-y-6">
          <Card title="Stats">
            <div className="space-y-4">
              <label className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]">
                <span>Stats section enabled</span>
                <input
                  type="checkbox"
                  checked={settings.homepage.stats.enabled}
                  onChange={(event) => updateSettings(setSettings, (current) => ({ ...current, homepage: { ...current.homepage, stats: { ...current.homepage.stats, enabled: event.target.checked } } }))}
                />
              </label>

              {settings.homepage.stats.items.map((item, index) => (
                <StatEditor key={item.id} item={item} index={index} setSettings={setSettings} />
              ))}

              <button
                type="button"
                onClick={() => updateSettings(setSettings, (current) => ({
                  ...current,
                  homepage: {
                    ...current.homepage,
                    stats: {
                      ...current.homepage.stats,
                      items: [
                        ...current.homepage.stats.items,
                        {
                          id: crypto.randomUUID(),
                          label: 'New Stat',
                          source: 'manual',
                          value: 0,
                          suffix: '+',
                          enabled: true,
                        },
                      ],
                    },
                  },
                }))}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)]"
              >
                Add stat
              </button>
            </div>
          </Card>
          <SaveButton onClick={save} saving={saving} />
        </div>
      )}
    </SettingsFormShell>
  );
}

function StatEditor({
  item,
  index,
  setSettings,
}: {
  item: HomepageStatItem;
  index: number;
  setSettings: React.Dispatch<React.SetStateAction<import('@/lib/site-settings').SiteSettings | null>>;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-xs text-[var(--muted)]">{item.id}</div>
        <div className="flex gap-2">
          <SmallButton onClick={() => moveStat(setSettings, index, -1)}>↑</SmallButton>
          <SmallButton onClick={() => moveStat(setSettings, index, 1)}>↓</SmallButton>
          <SmallButton danger onClick={() => removeStat(setSettings, index)}>Remove</SmallButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Label">
          <input value={item.label} onChange={(event) => updateStat(setSettings, index, { label: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Suffix">
          <input value={item.suffix} onChange={(event) => updateStat(setSettings, index, { suffix: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Source">
          <select value={item.source} onChange={(event) => updateStat(setSettings, index, { source: event.target.value as 'computed' | 'manual' })} className={inputClass}>
            <option value="computed">Computed</option>
            <option value="manual">Manual</option>
          </select>
        </Field>
        {item.source === 'computed' ? (
          <Field label="Computed key">
            <select value={item.computedKey ?? 'totalProjects'} onChange={(event) => updateStat(setSettings, index, { computedKey: event.target.value as HomepageStatComputedKey })} className={inputClass}>
              {COMPUTED_KEYS.map((key) => <option key={key} value={key}>{key}</option>)}
            </select>
          </Field>
        ) : (
          <Field label="Manual value">
            <input type="number" value={item.value ?? 0} onChange={(event) => updateStat(setSettings, index, { value: Number(event.target.value) })} className={inputClass} />
          </Field>
        )}
        <label className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] px-4 py-3 text-sm text-[var(--foreground)] md:col-span-2">
          <span>Enabled</span>
          <input type="checkbox" checked={item.enabled} onChange={(event) => updateStat(setSettings, index, { enabled: event.target.checked })} />
        </label>
      </div>
    </div>
  );
}

function updateStat(setSettings: React.Dispatch<React.SetStateAction<import('@/lib/site-settings').SiteSettings | null>>, index: number, patch: Partial<HomepageStatItem>) {
  updateSettings(setSettings, (current) => ({
    ...current,
    homepage: {
      ...current.homepage,
      stats: {
        ...current.homepage.stats,
        items: current.homepage.stats.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
      },
    },
  }));
}

function moveStat(setSettings: React.Dispatch<React.SetStateAction<import('@/lib/site-settings').SiteSettings | null>>, index: number, direction: -1 | 1) {
  updateSettings(setSettings, (current) => ({
    ...current,
    homepage: {
      ...current.homepage,
      stats: {
        ...current.homepage.stats,
        items: moveItem(current.homepage.stats.items, index, direction),
      },
    },
  }));
}

function removeStat(setSettings: React.Dispatch<React.SetStateAction<import('@/lib/site-settings').SiteSettings | null>>, index: number) {
  updateSettings(setSettings, (current) => ({
    ...current,
    homepage: {
      ...current.homepage,
      stats: {
        ...current.homepage.stats,
        items: current.homepage.stats.items.filter((_, itemIndex) => itemIndex !== index),
      },
    },
  }));
}

function SmallButton({ children, onClick, danger = false }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-lg border px-3 py-1 text-xs ${danger ? 'border-red-400/30 text-red-400' : 'border-[var(--border)] text-[var(--foreground)]'}`}>
      {children}
    </button>
  );
}
