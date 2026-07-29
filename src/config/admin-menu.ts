import type { ContentFeatureKey } from '@/lib/site-settings';

export interface AdminMenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  children?: AdminMenuItem[];
  external?: boolean;
  featureKey?: ContentFeatureKey;
  section?: string;
}

export const adminMenu: AdminMenuItem[] = [
  {
    id: 'content',
    label: 'Content',
    icon: '📝',
    children: [
      {
        id: 'content-overview',
        label: 'Overview',
        icon: '📚',
        children: [
          { id: 'content-manage', label: 'Manage Content', href: '/content', icon: '📂' },
        ],
      },
      {
        id: 'content-blog',
        label: 'Blog',
        icon: '✍️',
        children: [
          { id: 'blog-new', label: 'New Post', href: '/content/new/blog', icon: '📝', featureKey: 'blog' },
          { id: 'blog-tags', label: 'Tags', href: '/content/tags', icon: '🏷️', featureKey: 'blog' },
        ],
      },
      {
        id: 'content-projects',
        label: 'Projects',
        icon: '🚀',
        children: [
          { id: 'projects-new', label: 'New Project', href: '/content/new/projects', icon: '➕', featureKey: 'projects' },
        ],
      },
      {
        id: 'content-experience',
        label: 'Experience',
        icon: '💼',
        children: [
          { id: 'experience-new', label: 'New Entry', href: '/content/new/experience', icon: '➕', featureKey: 'experience' },
        ],
      },
      {
        id: 'content-media',
        label: 'Media / Utilities',
        icon: '🖼️',
        children: [
          { id: 'media-library', label: 'Media Library', href: '/content/media', icon: '🖼️' },
        ],
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: '🛠️',
    children: [
      { id: 'db', label: 'Database', href: '/settings/db', icon: '🗄️' },
      { id: 'sessions', label: 'Sessions', href: '/settings/sessions', icon: '🔑' },
      { id: 'auth-providers', label: 'Auth Providers', href: '/settings/auth-providers', icon: '🔒' },
      { id: 'api-docs', label: 'API Docs', href: '/settings/api-docs', icon: '📖' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    children: [
      {
        id: 'settings-general',
        label: 'General',
        icon: '🧭',
        children: [
          { id: 'settings-home', label: 'Settings', href: '/settings/settings', icon: '⚙️' },
        ],
      },
      {
        id: 'settings-content',
        label: 'Content',
        icon: '📝',
        children: [
          { id: 'settings-site', label: 'Site', href: '/settings/site', icon: '🌐' },
          { id: 'settings-homepage', label: 'Homepage', href: '/settings/homepage', icon: '🏠' },
        ],
      },
      {
        id: 'settings-publishing',
        label: 'Publishing',
        icon: '📣',
        children: [
          { id: 'settings-features', label: 'Features', href: '/settings/features', icon: '🧩' },
          { id: 'settings-integrations', label: 'Integrations', href: '/settings/integrations', icon: '🔗' },
          { id: 'settings-git-provider', label: 'Git Provider', href: '/settings/git-provider', icon: '🔌' },
        ],
      },
      {
        id: 'settings-utility',
        label: 'Utility',
        icon: '🧰',
        children: [
          { id: 'settings-homepage', label: 'Homepage', href: '/settings/homepage', icon: '🏠' },
          { id: 'settings-site', label: 'Site', href: '/settings/site', icon: '🌐' },
          { id: 'settings-general', label: 'General', href: '/settings/settings', icon: '⚙️' },
        ],
      },
    ],
  },
];
