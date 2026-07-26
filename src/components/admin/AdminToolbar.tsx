'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDevMode } from '@/context/DevContext';
import { adminMenu, type AdminMenuItem } from '@/config/admin-menu';
import type { SiteSettings } from '@/lib/site-settings';
import AdminToolbarMenu from './AdminToolbarMenu';

interface AdminToolbarProps {
  menu?: AdminMenuItem[];
  brand?: string;
}

function filterMenu(menu: AdminMenuItem[], settings: SiteSettings | null): AdminMenuItem[] {
  if (!settings) return menu;

  const visibleItems: AdminMenuItem[] = [];

  for (const item of menu) {
    if (item.featureKey) {
      const feature = settings.features[item.featureKey];
      if (!feature.enabled || !feature.showInContentManager) continue;
    }

    const children = item.children ? filterMenu(item.children, settings) : undefined;
    if (item.children && children?.length === 0 && !item.href) continue;

    visibleItems.push({ ...item, children });
  }

  return visibleItems;
}

export default function AdminToolbar({ menu = adminMenu, brand = 'Admin' }: AdminToolbarProps) {
  const { isDevMode, logout } = useDevMode();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    if (!isDevMode) return;

    let cancelled = false;
    void fetch('/api/admin/site-settings')
      .then((response) => response.json())
      .then((data: { settings?: SiteSettings }) => {
        if (!cancelled && data.settings) setSettings(data.settings);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [isDevMode]);

  const visibleMenu = useMemo(() => filterMenu(menu, settings), [menu, settings]);

  if (!isDevMode) return null;

  return (
    <header className="hidden md:block fixed top-0 inset-x-0 z-[300] bg-[#0f0f0f] text-white border-b border-white/10">
      <nav className="flex items-center h-10 px-3 gap-1">
        <span className="font-semibold text-sm px-2 text-white/80">{brand}</span>
        <ul className="flex items-center">
          {visibleMenu.map((item) => (
            <AdminToolbarMenu key={item.id} item={item} />
          ))}
        </ul>
        <div className="flex-1" />
        <button
          type="button"
          onClick={logout}
          className="px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
