"use client";

import { useEffect, useRef } from "react";
import type { Settings } from "@/context/SettingsContext";
import { useTranslations } from "@/context/TranslationContext";
import LanguageSwitcher from "./LanguageSwitcher";
import PublicSettingsSection from "./PublicSettingsSection";

export type PublicSettingsSectionKey =
  | "appearance"
  | "projects"
  | "experience"
  | "accessibility";

interface PublicSettingsPanelProps {
  open: boolean;
  section: PublicSettingsSectionKey;
  onSectionChange: (section: PublicSettingsSectionKey) => void;
  onClose: () => void;
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const SECTION_ORDER: PublicSettingsSectionKey[] = [
  "appearance",
  "projects",
  "experience",
  "accessibility",
];

export default function PublicSettingsPanel({
  open,
  section,
  onSectionChange,
  onClose,
  settings,
  update,
}: PublicSettingsPanelProps) {
  const { t } = useTranslations();
  const panelRef = useRef<HTMLElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const openRef = useRef(open);

  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      const focusTarget = panelRef.current?.querySelector<HTMLElement>(
        "[data-settings-initial-focus='true']",
      );
      (focusTarget ?? panelRef.current)?.focus();

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") onClose();
      };

      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("keydown", onKeyDown);
      };
    }

    if (openRef.current) {
      previouslyFocusedRef.current?.focus();
    }

    openRef.current = open;
    return undefined;
  }, [open, onClose]);

  const accentOptions = [
    { value: "cyan", label: t("settings.drawer.accent.options.cyan"), color: "#06b6d4" },
    { value: "purple", label: t("settings.drawer.accent.options.purple"), color: "#a855f7" },
    { value: "orange", label: t("settings.drawer.accent.options.orange"), color: "#f97316" },
    { value: "green", label: t("settings.drawer.accent.options.green"), color: "#22c55e" },
  ] as const;

  const colorBlindOptions: { value: Settings["colorBlindMode"]; label: string }[] = [
    { value: "none", label: t("settings.drawer.accessibility.colorBlind.options.none") },
    { value: "deuteranopia", label: t("settings.drawer.accessibility.colorBlind.options.deuteranopia") },
    { value: "protanopia", label: t("settings.drawer.accessibility.colorBlind.options.protanopia") },
    { value: "tritanopia", label: t("settings.drawer.accessibility.colorBlind.options.tritanopia") },
    { value: "high-contrast", label: t("settings.drawer.accessibility.colorBlind.options.highContrast") },
  ];

  const activeSection = section;

  if (!open) return null;

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[260] cursor-default bg-[color:rgba(15,23,42,0.28)] backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="public-settings-title"
        tabIndex={-1}
        className="fixed bottom-4 left-4 right-4 z-[270] max-h-[calc(100vh-2rem)] overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:left-auto sm:right-6 sm:w-[24rem] sm:max-w-[calc(100vw-3rem)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] bg-[var(--muted-bg)]/45 px-4 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              {t("settings.drawer.eyebrow")}
            </p>
            <h2 id="public-settings-title" className="mt-1 text-base font-semibold text-[var(--foreground)]">
              {t("settings.drawer.title")}
            </h2>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
              {t("settings.drawer.description")}
            </p>
          </div>

          <button
            type="button"
            data-settings-initial-focus="true"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            aria-label={t("settings.drawer.close")}
          >
            ✕
          </button>
        </div>

        <div className="border-b border-[var(--border)] px-3 py-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SECTION_ORDER.map((key) => {
              const isActive = activeSection === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSectionChange(key)}
                  className={`rounded-full px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${isActive ? "bg-[var(--accent)] text-white" : "bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}
                >
                  {t(`settings.drawer.sections.${key}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-h-[calc(100vh-11rem)] overflow-y-auto px-4 py-4">
          {activeSection === "appearance" && (
            <div className="space-y-4">
              <LanguageSwitcher />

              <PublicSettingsSection
                title={t("settings.drawer.appearance.title")}
                hint={t("settings.drawer.appearance.hint")}
              >
                <SettingRow label={t("settings.drawer.appearance.theme.label")} hint={t("settings.drawer.appearance.theme.hint")}>
                  <select
                    value={settings.theme}
                    onChange={(event) => update("theme", event.target.value as Settings["theme"])}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
                  >
                    <option value="system">{t("settings.drawer.appearance.theme.options.system")}</option>
                    <option value="dark">{t("settings.drawer.appearance.theme.options.dark")}</option>
                    <option value="light">{t("settings.drawer.appearance.theme.options.light")}</option>
                  </select>
                </SettingRow>

                <SettingRow label={t("settings.drawer.appearance.fontFamily.label")} hint={t("settings.drawer.appearance.fontFamily.hint")}>
                  <select
                    value={settings.fontFamily}
                    onChange={(event) => update("fontFamily", event.target.value as Settings["fontFamily"])}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
                  >
                    <option value="sans">{t("settings.drawer.appearance.fontFamily.options.sans")}</option>
                    <option value="serif">{t("settings.drawer.appearance.fontFamily.options.serif")}</option>
                    <option value="mono">{t("settings.drawer.appearance.fontFamily.options.mono")}</option>
                  </select>
                </SettingRow>
              </PublicSettingsSection>

              <PublicSettingsSection
                title={t("settings.drawer.accent.title")}
                hint={t("settings.drawer.accent.hint")}
              >
                <SettingRow label={t("settings.drawer.accent.label")} hint={t("settings.drawer.accent.labelHint")}>
                  <div className="flex gap-2">
                    {accentOptions.map((accent) => (
                      <button
                        key={accent.value}
                        type="button"
                        onClick={() => update("accentColor", accent.value)}
                        title={accent.label}
                        aria-label={accent.label}
                        className={`size-6 rounded-full border-2 transition-transform hover:scale-110 ${settings.accentColor === accent.value ? "border-[var(--foreground)] scale-110" : "border-transparent opacity-70"}`}
                        style={{ background: accent.color }}
                      />
                    ))}
                  </div>
                </SettingRow>

                <SettingRow label={t("settings.drawer.motion.label")} hint={t("settings.drawer.motion.hint")}>
                  <Toggle
                    checked={settings.reduceMotion}
                    onChange={(value) => update("reduceMotion", value)}
                  />
                </SettingRow>
              </PublicSettingsSection>
            </div>
          )}

          {activeSection === "projects" && (
            <div className="space-y-4">
              <PublicSettingsSection
                title={t("settings.drawer.projects.title")}
                hint={t("settings.drawer.projects.hint")}
              >
                <SettingRow label={t("settings.drawer.projects.view.label")} hint={t("settings.drawer.projects.view.hint")}>
                  <div className="flex gap-1">
                    <ViewBtn
                      active={settings.projectsView === "grid"}
                      onClick={() => update("projectsView", "grid")}
                      label={t("settings.drawer.projects.view.options.grid")}
                    >
                      <GridIcon />
                    </ViewBtn>
                    <ViewBtn
                      active={settings.projectsView === "list"}
                      onClick={() => update("projectsView", "list")}
                      label={t("settings.drawer.projects.view.options.list")}
                    >
                      <ListIcon />
                    </ViewBtn>
                  </div>
                </SettingRow>

                <SettingRow label={t("settings.drawer.projects.cardSize.label")} hint={t("settings.drawer.projects.cardSize.hint")}>
                  <div className="flex gap-1.5">
                    {(["sm", "md", "lg"] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => update("projectsCardSize", size)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${settings.projectsCardSize === size ? "bg-[var(--accent)] text-white" : "bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}
                      >
                        {t(`settings.drawer.projects.cardSize.options.${size}`)}
                      </button>
                    ))}
                  </div>
                </SettingRow>
              </PublicSettingsSection>
            </div>
          )}

          {activeSection === "experience" && (
            <div className="space-y-4">
              <PublicSettingsSection
                title={t("settings.drawer.experience.title")}
                hint={t("settings.drawer.experience.hint")}
              >
                <SettingRow label={t("settings.drawer.experience.expand.label")} hint={t("settings.drawer.experience.expand.hint")}>
                  <Toggle
                    checked={settings.experienceExpanded}
                    onChange={(value) => update("experienceExpanded", value)}
                  />
                </SettingRow>

                <SettingRow label={t("settings.drawer.experience.comments.label")} hint={t("settings.drawer.experience.comments.hint")}>
                  <Toggle
                    checked={settings.showComments}
                    onChange={(value) => update("showComments", value)}
                  />
                </SettingRow>
              </PublicSettingsSection>
            </div>
          )}

          {activeSection === "accessibility" && (
            <div className="space-y-4">
              <PublicSettingsSection
                title={t("settings.drawer.accessibility.title")}
                hint={t("settings.drawer.accessibility.hint")}
              >
                <div>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {t("settings.drawer.accessibility.fontSize.label")}
                    </span>
                    <span className="font-mono text-xs text-[var(--accent)]">
                      {settings.fontSize}%
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-[var(--muted)]">
                    {t("settings.drawer.accessibility.fontSize.hint")}
                  </p>
                  <input
                    type="range"
                    min={80}
                    max={130}
                    step={5}
                    value={settings.fontSize}
                    onChange={(event) => update("fontSize", Number(event.target.value))}
                    className="w-full cursor-pointer accent-[var(--accent)]"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-[var(--muted)]">
                    <span>80%</span>
                    <span>100%</span>
                    <span>130%</span>
                  </div>
                </div>
              </PublicSettingsSection>

              <PublicSettingsSection
                title={t("settings.drawer.accessibility.colorBlind.title")}
                hint={t("settings.drawer.accessibility.colorBlind.hint")}
              >
                <div className="space-y-2">
                  {colorBlindOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => update("colorBlindMode", option.value)}
                      className="flex w-full items-center gap-2.5 rounded-xl border border-[var(--border)] px-3 py-2 text-left text-sm transition-colors hover:border-[var(--accent)] hover:bg-[var(--muted-bg)]"
                    >
                      <span
                        className={`flex size-4 items-center justify-center rounded-full border-2 flex-shrink-0 transition-colors ${settings.colorBlindMode === option.value ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)]"}`}
                      >
                        {settings.colorBlindMode === option.value && (
                          <span className="size-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="text-[var(--foreground)]">{option.label}</span>
                    </button>
                  ))}
                </div>
              </PublicSettingsSection>

              <PublicSettingsSection
                title={t("settings.drawer.motion.title")}
                hint={t("settings.drawer.motion.sectionHint")}
              >
                <SettingRow label={t("settings.drawer.motion.label")} hint={t("settings.drawer.motion.hint")}> 
                  <Toggle
                    checked={settings.reduceMotion}
                    onChange={(value) => update("reduceMotion", value)}
                  />
                </SettingRow>
              </PublicSettingsSection>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border)] px-4 py-3 text-center text-xs text-[var(--muted)]">
          {t("settings.drawer.footer.prefix")} ·{" "}
          <button
            type="button"
            onClick={() => {
              update("fontSize", 100);
              update("theme", "system");
              update("accentColor", "cyan");
              update("colorBlindMode", "none");
              update("reduceMotion", false);
              update("fontFamily", "sans");
              update("projectsView", "grid");
              update("projectsCardSize", "md");
              update("experienceExpanded", false);
              update("showComments", true);
            }}
            className="text-[var(--accent)] transition-colors hover:underline"
          >
            {t("settings.drawer.footer.reset")}
          </button>
        </div>
      </aside>
    </>
  );
}

function SettingRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-medium text-[var(--foreground)]">{label}</div>
        {hint && <div className="mt-0.5 text-xs text-[var(--muted)]">{hint}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-10 flex-shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${checked ? "bg-[var(--accent)]" : "border border-[var(--border)] bg-[var(--muted-bg)]"}`}
    >
      <span
        className={`absolute top-1 inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-1"}`}
      />
    </button>
  );
}

function ViewBtn({
  active,
  onClick,
  children,
  label,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-lg p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${active ? "bg-[var(--accent)] text-white" : "bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}
    >
      {children}
    </button>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="4" height="4" rx="1" fill="currentColor" />
      <rect x="10" y="2" width="4" height="4" rx="1" fill="currentColor" />
      <rect x="2" y="10" width="4" height="4" rx="1" fill="currentColor" />
      <rect x="10" y="10" width="4" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="12" height="2" rx="1" fill="currentColor" />
      <rect x="2" y="7" width="12" height="2" rx="1" fill="currentColor" />
      <rect x="2" y="11" width="12" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}
