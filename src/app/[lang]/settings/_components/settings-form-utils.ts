import type React from 'react';
import type { SiteSettings } from '@/lib/site-settings-types';

export function updateSettings(setSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>, updater: (settings: SiteSettings) => SiteSettings) {
  setSettings((current) => (current ? updater(current) : current));
}

export function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinList(value: string[]): string {
  return value.join(', ');
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const next = [...items];
  const target = index + direction;

  if (target < 0 || target >= next.length) return next;

  const item = next[index];
  const other = next[target];
  if (item === undefined || other === undefined) return next;

  next[index] = other;
  next[target] = item;
  return next;
}
