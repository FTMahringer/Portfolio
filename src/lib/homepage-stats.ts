import type { HomepageStatItem, SiteSettings } from './site-settings';
import type { getPortfolioStats } from './stats';

type ComputedStats = ReturnType<typeof getPortfolioStats>;

export interface ResolvedHomepageStat {
  id: string;
  label: string;
  value: number | string;
  suffix: string;
}

export function resolveHomepageStats(settings: SiteSettings, computedStats: ComputedStats): ResolvedHomepageStat[] {
  if (!settings.homepage.stats.enabled) return [];

  return settings.homepage.stats.items
    .filter((item) => item.enabled)
    .map((item) => resolveStatItem(item, computedStats))
    .filter((item): item is ResolvedHomepageStat => item !== null);
}

function resolveStatItem(item: HomepageStatItem, computedStats: ComputedStats): ResolvedHomepageStat | null {
  if (item.source === 'manual') {
    return {
      id: item.id,
      label: item.label,
      value: item.value ?? 0,
      suffix: item.suffix,
    };
  }

  if (!item.computedKey) return null;

  return {
    id: item.id,
    label: item.label,
    value: computedStats[item.computedKey],
    suffix: item.suffix,
  };
}
