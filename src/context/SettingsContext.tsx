"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

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
  locale: "en";
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
  locale: "en",
};

const COOKIE_KEY = "portfolio_settings";

interface SettingsContextValue {
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULTS,
  update: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = Cookies.get(COOKIE_KEY);
    if (saved) {
      try {
        setSettings({ ...DEFAULTS, ...JSON.parse(saved) });
      } catch {
        // ignore malformed cookie
      }
    }
    setMounted(true);
  }, []);

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

    Cookies.set(COOKIE_KEY, JSON.stringify(settings), { expires: 365 });
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
