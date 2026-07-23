'use client';

import { useDevMode } from '@/context/DevContext';
import { adminMenu, type AdminMenuItem } from '@/config/admin-menu';
import AdminToolbarMenu from './AdminToolbarMenu';

interface AdminToolbarProps {
  menu?: AdminMenuItem[];
  brand?: string;
}

export default function AdminToolbar({ menu = adminMenu, brand = 'Admin' }: AdminToolbarProps) {
  const { isDevMode, logout } = useDevMode();

  if (!isDevMode) return null;

  return (
    <header className="hidden md:block fixed top-0 inset-x-0 z-[300] bg-[#0f0f0f] text-white border-b border-white/10">
      <nav className="flex items-center h-10 px-3 gap-1">
        <span className="font-semibold text-sm px-2 text-white/80">{brand}</span>
        <ul className="flex items-center">
          {menu.map((item) => (
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
