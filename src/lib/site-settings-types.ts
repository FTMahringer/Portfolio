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
