export interface AdminMenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  children?: AdminMenuItem[];
  external?: boolean;
}

export const adminMenu: AdminMenuItem[] = [
  {
    id: 'content',
    label: 'Content',
    icon: '📝',
    children: [
      { id: 'new-blog', label: 'New Blog Post', href: '/admin/new/blog', icon: '📝' },
      { id: 'new-project', label: 'New Project', href: '/admin/new/projects', icon: '🚀' },
      { id: 'new-experience', label: 'New Experience', href: '/admin/new/experience', icon: '💼' },
      { id: 'content-list', label: 'Manage Content', href: '/admin/content', icon: '📂' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: '🛠️',
    children: [
      { id: 'tags', label: 'Tags', href: '/admin/tags', icon: '🏷️' },
      { id: 'db', label: 'Database', href: '/admin/db', icon: '🗄️' },
      { id: 'sessions', label: 'Sessions', href: '/admin/sessions', icon: '🔑' },
      { id: 'settings', label: 'Settings', href: '/admin/settings', icon: '⚙️' },
    ],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    icon: '⚡',
  },
];
