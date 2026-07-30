'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { PublicSettingsSectionKey } from '@/components/settings/public-settings-types';

interface PublicSettingsDrawerContextValue {
  open: boolean;
  section: PublicSettingsSectionKey;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setSection: (section: PublicSettingsSectionKey) => void;
}

const PublicSettingsDrawerContext = createContext<PublicSettingsDrawerContextValue | null>(null);

export function PublicSettingsDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<PublicSettingsSectionKey>('appearance');

  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  const toggleDrawer = useCallback(() => setOpen((current) => !current), []);

  const value = useMemo(
    () => ({
      open,
      section,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      setSection,
    }),
    [closeDrawer, open, openDrawer, section, toggleDrawer],
  );

  return <PublicSettingsDrawerContext.Provider value={value}>{children}</PublicSettingsDrawerContext.Provider>;
}

export function usePublicSettingsDrawer() {
  const context = useContext(PublicSettingsDrawerContext);

  if (!context) {
    throw new Error('usePublicSettingsDrawer must be used within PublicSettingsDrawerProvider');
  }

  return context;
}
