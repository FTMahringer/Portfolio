import type { ContentFeatureKey } from '@/lib/site-settings';

export interface AdminMenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  children?: AdminMenuItem[];
  external?: boolean;
  featureKey?: ContentFeatureKey;
}

export const adminMenu: AdminMenuItem[] = [
  {
    id: 'content',
    label: 'Content',
    icon: '📝',
    children: [
      { id: 'new-blog', label: 'New Blog Post', href: '/content/new/blog', icon: '📝', featureKey: 'blog' },
      { id: 'new-project', label: 'New Project', href: '/content/new/projects', icon: '🚀', featureKey: 'projects' },
      { id: 'new-experience', label: 'New Experience', href: '/content/new/experience', icon: '💼', featureKey: 'experience' },
      { id: 'content-list', label: 'Manage Content', href: '/content', icon: '📂' },
      { id: 'tags', label: 'Tags', href: '/content/tags', icon: '🏷️' },
      { id: 'media', label: 'Media Library', href: '/content/media', icon: '🖼️' },
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
    href: '/settings/settings',
    icon: '⚙️',
  },
];
