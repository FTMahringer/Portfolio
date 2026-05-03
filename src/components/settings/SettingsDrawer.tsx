'use client'

import { useSettings } from '@/context/SettingsContext'
import type { Settings } from '@/context/SettingsContext'
import React, { useState } from 'react'

const ACCENT_OPTIONS = [
  { value: 'cyan',   label: 'Cyan',   color: '#06b6d4' },
  { value: 'purple', label: 'Purple', color: '#a855f7' },
  { value: 'orange', label: 'Orange', color: '#f97316' },
  { value: 'green',  label: 'Green',  color: '#22c55e' },
] as const

const COLORBLIND_OPTIONS: { value: Settings['colorBlindMode']; label: string }[] = [
  { value: 'none',          label: 'None' },
  { value: 'deuteranopia',  label: 'Deuteranopia (red-green)' },
  { value: 'protanopia',    label: 'Protanopia (red-green)' },
  { value: 'tritanopia',    label: 'Tritanopia (blue-yellow)' },
  { value: 'high-contrast', label: 'High Contrast' },
]

export function SettingsDrawer() {
  const { settings, update } = useSettings()
  const [open, setOpen] = useState(false)
  const [section, setSection] = useState<'appearance' | 'projects' | 'experience' | 'accessibility'>('appearance')

  return (
    <>
      {/* SVG colorblind filters (hidden) */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="filter-deuteranopia">
            <feColorMatrix type="matrix" values="0.367 0.861 -0.228 0 0  0.280 0.673 0.047 0 0  -0.012 0.043 0.969 0 0  0 0 0 1 0"/>
          </filter>
          <filter id="filter-protanopia">
            <feColorMatrix type="matrix" values="0.152 0.772 -0.040 0 0  0.155 0.793 0.052 0 0  -0.004 -0.040 1.044 0 0  0 0 0 1 0"/>
          </filter>
          <filter id="filter-tritanopia">
            <feColorMatrix type="matrix" values="1.256 -0.077 -0.180 0 0  -0.078 0.931 0.148 0 0  0.005 0.691 0.304 0 0  0 0 0 1 0"/>
          </filter>
        </defs>
      </svg>

      {/* Tab handle */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open settings"
        style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1.5 px-2 py-4 bg-[var(--card)] border border-[var(--border)] border-r-0 rounded-l-md text-[var(--accent)] hover:text-[var(--foreground)] transition-colors text-xs font-medium tracking-wide cursor-pointer select-none"
      >
        ⚙ Settings
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 z-50 bg-[var(--card)] border-l border-[var(--border)] flex flex-col shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <span className="font-bold text-base text-[var(--foreground)]">⚙ Settings</span>
          <button onClick={() => setOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl leading-none cursor-pointer">✕</button>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-[var(--border)] text-xs overflow-x-auto">
          {(['appearance', 'projects', 'experience', 'accessibility'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`flex-1 py-2.5 capitalize cursor-pointer transition-colors text-xs font-medium whitespace-nowrap px-1 ${section === s ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            >
              {s === 'accessibility' ? 'A11y' : s}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 text-sm">

          {section === 'appearance' && (
            <>
              <SettingRow label="Theme" hint="Color scheme">
                <select
                  value={settings.theme}
                  onChange={e => update('theme', e.target.value as Settings['theme'])}
                  className="settings-select"
                >
                  <option value="system">System</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </SettingRow>

              <SettingRow label="Accent Color" hint="Highlight / link color">
                <div className="flex gap-2">
                  {ACCENT_OPTIONS.map(a => (
                    <button
                      key={a.value}
                      onClick={() => update('accentColor', a.value)}
                      title={a.label}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${settings.accentColor === a.value ? 'border-white scale-110' : 'border-transparent opacity-70'}`}
                      style={{ background: a.color }}
                    />
                  ))}
                </div>
              </SettingRow>

              <SettingRow label="Reduce Motion" hint="Disable animations">
                <Toggle checked={settings.reduceMotion} onChange={v => update('reduceMotion', v)} />
              </SettingRow>
            </>
          )}

          {section === 'projects' && (
            <>
              <SettingRow label="View" hint="Layout style">
                <div className="flex gap-1">
                  <ViewBtn active={settings.projectsView === 'grid'} onClick={() => update('projectsView', 'grid')}>
                    <GridIcon />
                  </ViewBtn>
                  <ViewBtn active={settings.projectsView === 'list'} onClick={() => update('projectsView', 'list')}>
                    <ListIcon />
                  </ViewBtn>
                </div>
              </SettingRow>

              <SettingRow label="Card Size" hint="Grid card size">
                <div className="flex gap-1.5">
                  {(['sm', 'md', 'lg'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => update('projectsCardSize', s)}
                      className={`px-2.5 py-1 rounded text-xs cursor-pointer transition-colors font-medium ${settings.projectsCardSize === s ? 'bg-[var(--accent)] text-white' : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </SettingRow>
            </>
          )}

          {section === 'experience' && (
            <SettingRow label="Auto-expand" hint="Show full content by default">
              <Toggle checked={settings.experienceExpanded} onChange={v => update('experienceExpanded', v)} />
            </SettingRow>
          )}

          {section === 'accessibility' && (            <>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-[var(--foreground)]">Font Size</span>
                  <span className="text-xs text-[var(--accent)] font-mono">{settings.fontSize}%</span>
                </div>
                <p className="text-xs text-[var(--muted)] mb-3">Scales all text globally</p>
                <input
                  type="range"
                  min={80}
                  max={130}
                  step={5}
                  value={settings.fontSize}
                  onChange={e => update('fontSize', Number(e.target.value))}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
                  <span>80%</span><span>100%</span><span>130%</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {[80, 90, 100, 110, 120, 130].map(v => (
                    <button
                      key={v}
                      onClick={() => update('fontSize', v)}
                      className={`flex-1 py-1 rounded text-[10px] cursor-pointer transition-colors ${settings.fontSize === v ? 'bg-[var(--accent)] text-white' : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                    >
                      {v}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[var(--border)]" />

              <div>
                <div className="text-sm font-medium text-[var(--foreground)] mb-1">Color Vision</div>
                <p className="text-xs text-[var(--muted)] mb-3">Simulate or adjust colors for color vision differences</p>
                <div className="space-y-2">
                  {COLORBLIND_OPTIONS.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${settings.colorBlindMode === opt.value ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]'}`}>
                        {settings.colorBlindMode === opt.value && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span
                        className="text-sm text-[var(--foreground)] cursor-pointer"
                        onClick={() => update('colorBlindMode', opt.value)}
                      >
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[var(--border)]" />

              <SettingRow label="Reduce Motion" hint="Disable all animations">
                <Toggle checked={settings.reduceMotion} onChange={v => update('reduceMotion', v)} />
              </SettingRow>
            </>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[var(--border)] text-xs text-[var(--muted)] text-center">
          Preferences saved in cookies · <button onClick={() => { update('fontSize', 100); update('theme', 'system'); update('accentColor', 'cyan'); update('colorBlindMode', 'none'); }} className="text-[var(--accent)] hover:underline cursor-pointer">Reset</button>
        </div>
      </aside>

      <style>{`
        .settings-select {
          background: var(--muted-bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--foreground);
          font-size: 13px;
          padding: 4px 10px;
          cursor: pointer;
        }
        .settings-select:focus { outline: 1px solid var(--accent); }
      `}</style>
    </>
  )
}

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-medium text-[var(--foreground)]">{label}</div>
        {hint && <div className="text-xs text-[var(--muted)] mt-0.5">{hint}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-10 h-6 flex-shrink-0 rounded-full cursor-pointer transition-colors duration-200 ${checked ? 'bg-[var(--accent)]' : 'bg-[var(--muted-bg)] border border-[var(--border)]'}`}
    >
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-1 ${checked ? 'translate-x-5' : 'translate-x-1'}`}
      />
    </button>
  )
}

function ViewBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded cursor-pointer transition-colors ${active ? 'bg-[var(--accent)] text-white' : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)]'}`}
    >
      {children}
    </button>
  )
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4-1.5a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1H6zm0 4a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1H6zm0 4a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1H6zM2 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
    </svg>
  )
}

