import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

export type ContentFeatureKey = 'projects' | 'blog' | 'experience';
export type HomepageStatComputedKey = 'yearsOfExperience' | 'totalProjects' | 'totalBlogPosts';

export interface SiteIdentitySettings {
  title: string;
  tagline: string;
  url: string;
  email: string;
  location: string;
  avatar: string;
  bio: string;
}

export interface SocialSettings {
  github: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  youtube: string;
  email: string;
}

export interface ContactSettings {
  resend_from: string;
  to: string;
}

export interface GiscusSettings {
  enabled: boolean;
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: string;
  reactionsEnabled: boolean;
  emitMetadata: boolean;
  inputPosition: string;
  theme: string;
  lang: string;
}

export interface AnalyticsSettings {
  provider: 'umami' | 'plausible' | 'none';
  umami: {
    enabled: boolean;
    websiteId: string;
    scriptUrl: string;
  };
  plausible: {
    enabled: boolean;
    domain: string;
    scriptUrl: string;
  };
}

export interface SidebarSkillGroup {
  category: string;
  items: string[];
}

export interface FeatureSettings {
  enabled: boolean;
  label: string;
  route: string;
  showInNavigation: boolean;
  showInContentManager: boolean;
  showOnHomepage: boolean;
  showInProjectRelations?: boolean;
}

export interface HomepageStatItem {
  id: string;
  label: string;
  source: 'computed' | 'manual';
  computedKey?: HomepageStatComputedKey;
  value?: number;
  suffix: string;
  enabled: boolean;
}

export interface HomepageSettings {
  stats: {
    enabled: boolean;
    items: HomepageStatItem[];
  };
}

export interface SiteSettings {
  site: SiteIdentitySettings;
  social: SocialSettings;
  contact: ContactSettings;
  giscus: GiscusSettings;
  analytics: AnalyticsSettings;
  sidebar_skills: SidebarSkillGroup[];
  features: Record<ContentFeatureKey, FeatureSettings>;
  homepage: HomepageSettings;
}

const SETTINGS_PATH = path.join(process.cwd(), 'config', 'site.yaml');

const DEFAULT_SETTINGS: SiteSettings = {
  site: {
    title: 'Fynn Mahringer',
    tagline: 'Full-stack developer & open-source contributor',
    url: 'https://portfolio.ftmahringer.com',
    email: 'fynn@ftmahringer.com',
    location: 'Bad Hall, Austria',
    avatar: '/images/avatar.png',
    bio: 'I develop for the web, working on open source projects, developer tools, and structured, maintainable systems.',
  },
  social: {
    github: 'FTMahringer',
    linkedin: 'fynn-mahringer-30a36b285',
    twitter: '',
    instagram: '',
    youtube: '',
    email: 'fynn@ftmahringer.com',
  },
  contact: {
    resend_from: 'Portfolio Contact <noreply@resend.dev>',
    to: 'contact@ftmahringer.com',
  },
  giscus: {
    enabled: true,
    repo: 'FTMahringer/Portfolio',
    repoId: '',
    category: 'Comments',
    categoryId: '',
    mapping: 'pathname',
    reactionsEnabled: true,
    emitMetadata: false,
    inputPosition: 'bottom',
    theme: 'preferred_color_scheme',
    lang: 'en',
  },
  analytics: {
    provider: 'umami',
    umami: {
      enabled: false,
      websiteId: '',
      scriptUrl: 'https://analytics.yourdomain.com/script.js',
    },
    plausible: {
      enabled: false,
      domain: '',
      scriptUrl: 'https://plausible.io/js/script.js',
    },
  },
  sidebar_skills: [
    { category: 'Frontend', items: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS'] },
    { category: 'Backend', items: ['Java', 'Spring Boot', 'Node.js'] },
    { category: 'Infrastructure', items: ['Docker', 'K3s', 'Linux', 'GitHub Actions'] },
  ],
  features: {
    projects: {
      enabled: true,
      label: 'Projects',
      route: '/projects',
      showInNavigation: true,
      showInContentManager: true,
      showOnHomepage: true,
    },
    blog: {
      enabled: true,
      label: 'Blog',
      route: '/blog',
      showInNavigation: true,
      showInContentManager: true,
      showOnHomepage: true,
    },
    experience: {
      enabled: true,
      label: 'Experience',
      route: '/experience',
      showInNavigation: true,
      showInContentManager: true,
      showOnHomepage: true,
      showInProjectRelations: true,
    },
  },
  homepage: {
    stats: {
      enabled: true,
      items: [
        {
          id: 'years-experience',
          label: 'Years Experience',
          source: 'computed',
          computedKey: 'yearsOfExperience',
          suffix: '+',
          enabled: true,
        },
        {
          id: 'projects',
          label: 'Projects',
          source: 'computed',
          computedKey: 'totalProjects',
          suffix: '+',
          enabled: true,
        },
        {
          id: 'blog-posts',
          label: 'Blog Posts',
          source: 'computed',
          computedKey: 'totalBlogPosts',
          suffix: '+',
          enabled: true,
        },
      ],
    },
  },
};

let settingsCache: SiteSettings | null = null;

export function getDefaultSiteSettings(): SiteSettings {
  return structuredClone(DEFAULT_SETTINGS);
}

export function getSiteSettings(): SiteSettings {
  if (!settingsCache) {
    const raw = fs.readFileSync(SETTINGS_PATH, 'utf8');
    settingsCache = normalizeSiteSettings(yaml.load(raw));
  }

  return settingsCache;
}

export function saveSiteSettings(settings: SiteSettings): SiteSettings {
  const normalized = normalizeSiteSettings(settings);
  const serialized = yaml.dump(normalized, {
    lineWidth: 120,
    noRefs: true,
  });

  fs.writeFileSync(SETTINGS_PATH, serialized, 'utf8');
  settingsCache = normalized;
  return normalized;
}

export function clearSiteSettingsCache() {
  settingsCache = null;
}

export function normalizeSiteSettings(value: unknown): SiteSettings {
  const input = asRecord(value);
  const defaults = getDefaultSiteSettings();

  return {
    site: normalizeSite(input.site, defaults.site),
    social: normalizeSocial(input.social, defaults.social),
    contact: normalizeContact(input.contact, defaults.contact),
    giscus: normalizeGiscus(input.giscus, defaults.giscus),
    analytics: normalizeAnalytics(input.analytics, defaults.analytics),
    sidebar_skills: normalizeSidebarSkills(input.sidebar_skills, defaults.sidebar_skills),
    features: normalizeFeatures(input.features, defaults.features),
    homepage: normalizeHomepage(input.homepage, defaults.homepage),
  };
}

export function getFeatureSettings(feature: ContentFeatureKey): FeatureSettings {
  return getSiteSettings().features[feature];
}

export function isFeatureEnabled(feature: ContentFeatureKey): boolean {
  return getFeatureSettings(feature).enabled;
}

export function shouldShowFeatureInNavigation(feature: ContentFeatureKey): boolean {
  const settings = getFeatureSettings(feature);
  return settings.enabled && settings.showInNavigation;
}

export function shouldShowFeatureInContentManager(feature: ContentFeatureKey): boolean {
  const settings = getFeatureSettings(feature);
  return settings.enabled && settings.showInContentManager;
}

export function shouldShowFeatureOnHomepage(feature: ContentFeatureKey): boolean {
  const settings = getFeatureSettings(feature);
  return settings.enabled && settings.showOnHomepage;
}

export function shouldShowExperienceRelations(): boolean {
  const settings = getFeatureSettings('experience');
  return settings.enabled && Boolean(settings.showInProjectRelations);
}

function normalizeSite(value: unknown, defaults: SiteIdentitySettings): SiteIdentitySettings {
  const input = asRecord(value);
  return {
    title: stringValue(input.title, defaults.title),
    tagline: stringValue(input.tagline, defaults.tagline),
    url: stringValue(input.url, defaults.url),
    email: stringValue(input.email, defaults.email),
    location: stringValue(input.location, defaults.location),
    avatar: stringValue(input.avatar, defaults.avatar),
    bio: stringValue(input.bio, defaults.bio),
  };
}

function normalizeSocial(value: unknown, defaults: SocialSettings): SocialSettings {
  const input = asRecord(value);
  return {
    github: stringValue(input.github, defaults.github),
    linkedin: stringValue(input.linkedin, defaults.linkedin),
    twitter: stringValue(input.twitter, defaults.twitter),
    instagram: stringValue(input.instagram, defaults.instagram),
    youtube: stringValue(input.youtube, defaults.youtube),
    email: stringValue(input.email, defaults.email),
  };
}

function normalizeContact(value: unknown, defaults: ContactSettings): ContactSettings {
  const input = asRecord(value);
  return {
    resend_from: stringValue(input.resend_from, defaults.resend_from),
    to: stringValue(input.to, defaults.to),
  };
}

function normalizeGiscus(value: unknown, defaults: GiscusSettings): GiscusSettings {
  const input = asRecord(value);
  return {
    enabled: booleanValue(input.enabled, defaults.enabled),
    repo: stringValue(input.repo, defaults.repo),
    repoId: stringValue(input.repoId, defaults.repoId),
    category: stringValue(input.category, defaults.category),
    categoryId: stringValue(input.categoryId, defaults.categoryId),
    mapping: stringValue(input.mapping, defaults.mapping),
    reactionsEnabled: booleanValue(input.reactionsEnabled, defaults.reactionsEnabled),
    emitMetadata: booleanValue(input.emitMetadata, defaults.emitMetadata),
    inputPosition: stringValue(input.inputPosition, defaults.inputPosition),
    theme: stringValue(input.theme, defaults.theme),
    lang: stringValue(input.lang, defaults.lang),
  };
}

function normalizeAnalytics(value: unknown, defaults: AnalyticsSettings): AnalyticsSettings {
  const input = asRecord(value);
  const umami = asRecord(input.umami);
  const plausible = asRecord(input.plausible);
  const provider = input.provider === 'plausible' || input.provider === 'none' || input.provider === 'umami' ? input.provider : defaults.provider;

  return {
    provider,
    umami: {
      enabled: booleanValue(umami.enabled, defaults.umami.enabled),
      websiteId: stringValue(umami.websiteId, defaults.umami.websiteId),
      scriptUrl: stringValue(umami.scriptUrl, defaults.umami.scriptUrl),
    },
    plausible: {
      enabled: booleanValue(plausible.enabled, defaults.plausible.enabled),
      domain: stringValue(plausible.domain, defaults.plausible.domain),
      scriptUrl: stringValue(plausible.scriptUrl, defaults.plausible.scriptUrl),
    },
  };
}

function normalizeSidebarSkills(value: unknown, defaults: SidebarSkillGroup[]): SidebarSkillGroup[] {
  if (!Array.isArray(value)) return defaults;
  const groups = value
    .map((group) => {
      const input = asRecord(group);
      return {
        category: stringValue(input.category, ''),
        items: Array.isArray(input.items) ? input.items.map((item) => String(item).trim()).filter(Boolean) : [],
      };
    })
    .filter((group) => group.category.length > 0);

  return groups.length > 0 ? groups : defaults;
}

function normalizeFeatures(value: unknown, defaults: Record<ContentFeatureKey, FeatureSettings>): Record<ContentFeatureKey, FeatureSettings> {
  const input = asRecord(value);
  return {
    projects: normalizeFeature(input.projects, defaults.projects),
    blog: normalizeFeature(input.blog, defaults.blog),
    experience: normalizeFeature(input.experience, defaults.experience),
  };
}

function normalizeFeature(value: unknown, defaults: FeatureSettings): FeatureSettings {
  const input = asRecord(value);
  return {
    enabled: booleanValue(input.enabled, defaults.enabled),
    label: stringValue(input.label, defaults.label),
    route: stringValue(input.route, defaults.route),
    showInNavigation: booleanValue(input.showInNavigation, defaults.showInNavigation),
    showInContentManager: booleanValue(input.showInContentManager, defaults.showInContentManager),
    showOnHomepage: booleanValue(input.showOnHomepage, defaults.showOnHomepage),
    ...(defaults.showInProjectRelations === undefined
      ? {}
      : { showInProjectRelations: booleanValue(input.showInProjectRelations, defaults.showInProjectRelations) }),
  };
}

function normalizeHomepage(value: unknown, defaults: HomepageSettings): HomepageSettings {
  const input = asRecord(value);
  const stats = asRecord(input.stats);
  const items = Array.isArray(stats.items)
    ? stats.items.map(normalizeHomepageStat).filter((item): item is HomepageStatItem => item !== null)
    : defaults.stats.items;

  return {
    stats: {
      enabled: booleanValue(stats.enabled, defaults.stats.enabled),
      items: items.length > 0 ? items : defaults.stats.items,
    },
  };
}

function normalizeHomepageStat(value: unknown): HomepageStatItem | null {
  const input = asRecord(value);
  const id = stringValue(input.id, crypto.randomUUID());
  const source = input.source === 'manual' ? 'manual' : 'computed';
  const computedKey = isComputedKey(input.computedKey) ? input.computedKey : undefined;
  const rawValue = Number(input.value);

  return {
    id,
    label: stringValue(input.label, source === 'manual' ? 'Manual Stat' : 'Computed Stat'),
    source,
    computedKey: source === 'computed' ? computedKey ?? 'totalProjects' : undefined,
    value: source === 'manual' && Number.isFinite(rawValue) ? rawValue : undefined,
    suffix: stringValue(input.suffix, '+'),
    enabled: booleanValue(input.enabled, true),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function isComputedKey(value: unknown): value is HomepageStatComputedKey {
  return value === 'yearsOfExperience' || value === 'totalProjects' || value === 'totalBlogPosts';
}
