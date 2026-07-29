"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";

import { getLocaleFromPath } from "@/lib/locale-routing";
import { DEFAULT_LOCALE_CODE, isLocaleCode, type LocaleCode } from "@/lib/locale-registry";

export interface Settings {
  theme: "dark" | "light" | "system";
  accentColor: "cyan" | "purple" | "orange" | "green";
  reduceMotion: boolean;
  fontSize: number; // 80–130 (percent)
  fontFamily: "sans" | "serif" | "mono";
  colorBlindMode:
    | "none"
    | "deuteranopia"
    | "protanopia"
    | "tritanopia"
    | "high-contrast";
  projectsView: "grid" | "list";
  projectsCardSize: "sm" | "md" | "lg";
  experienceExpanded: boolean;
  showComments: boolean;
  locale: LocaleCode;
}

const DEFAULTS: Settings = {
  theme: "system",
  accentColor: "cyan",
  reduceMotion: false,
  fontSize: 100,
  fontFamily: "sans",
  colorBlindMode: "none",
  projectsView: "grid",
  projectsCardSize: "md",
  experienceExpanded: false,
  showComments: true,
  locale: DEFAULT_LOCALE_CODE,
};

const COOKIE_KEY = "portfolio_settings";
const VALID_COLOR_BLIND_MODES = new Set<Settings['colorBlindMode']>([
  'none',
  'deuteranopia',
  'protanopia',
  'tritanopia',
  'high-contrast',
]);

function normalizeSettings(input: unknown): Settings {
  const saved = input && typeof input === 'object' ? (input as Partial<Settings>) : {};
  const next: Settings = { ...DEFAULTS, ...saved };

  if (!VALID_COLOR_BLIND_MODES.has(next.colorBlindMode)) {
    next.colorBlindMode = 'none';
  }

  if (!isLocaleCode(next.locale)) {
    next.locale = DEFAULT_LOCALE_CODE;
  }

  return next;
}

interface SettingsContextValue {
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULTS,
  update: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = Cookies.get(COOKIE_KEY);
    if (saved) {
      try {
        setSettings(normalizeSettings(JSON.parse(saved)));
      } catch {
        setSettings(DEFAULTS);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    const pathLocale = getLocaleFromPath(pathname);
    if (!pathLocale) {
      return;
    }

    setSettings((prev) => (prev.locale === pathLocale ? prev : { ...prev, locale: pathLocale }));
  }, [pathname]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;

    // Theme
    if (settings.theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else if (settings.theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.remove("dark", "light");
    }

    // Accent
    root.setAttribute("data-accent", settings.accentColor);

    // Font family
    root.setAttribute("data-font", settings.fontFamily);

    // Colorblind
    if (settings.colorBlindMode === "none") {
      root.removeAttribute("data-colorblind");
    } else {
      root.setAttribute("data-colorblind", settings.colorBlindMode);
    }

    // Font size
    root.style.setProperty("--base-font-size", `${settings.fontSize}%`);

    // Reduce motion
    if (settings.reduceMotion) {
      root.style.setProperty("--tw-transition-duration", "0ms");
    } else {
      root.style.removeProperty("--tw-transition-duration");
    }

    Cookies.set(COOKIE_KEY, JSON.stringify(normalizeSettings(settings)), { expires: 365 });
  }, [settings, mounted]);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <SettingsContext.Provider value={{ settings, update }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
