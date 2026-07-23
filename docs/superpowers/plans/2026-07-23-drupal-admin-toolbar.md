# Drupal-Style Admin Toolbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable, Drupal-like admin toolbar that lets logged-in admins create and manage content directly from public pages.

**Architecture:** A new `AdminToolbar` React component reads a typed nested menu config. It renders fixed at the top of every public page when the user is authenticated via `DevContext`. On mobile it hides completely. Menu config supports arbitrary nesting and is stored in a dedicated config file.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, existing `DevContext`.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/config/admin-menu.ts` | Typed menu configuration tree (headers, submenus, nested submenus). |
| `src/components/admin/AdminToolbar.tsx` | Reusable toolbar UI with hover menus and recursive rendering. |
| `src/components/admin/AdminToolbarMenu.tsx` | Recursive menu item component (separates hover logic from toolbar shell). |
| `src/app/layout.tsx` | Mount `AdminToolbar` inside root layout, gated by `DevProvider`. |
| `src/context/DevContext.tsx` | Already exists; no changes needed unless `isDevMode` hydration issue found. |

---

## Task 1: Create typed admin menu config

**Files:**
- Create: `src/config/admin-menu.ts`

- [ ] **Step 1: Write config file**

```ts
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit src/config/admin-menu.ts`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/config/admin-menu.ts
git commit -m "feat(admin): add typed admin menu config"
```

---

## Task 2: Create recursive menu item component

**Files:**
- Create: `src/components/admin/AdminToolbarMenu.tsx`

- [ ] **Step 1: Write component**

```tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { AdminMenuItem } from '@/config/admin-menu';

interface AdminToolbarMenuProps {
  item: AdminMenuItem;
  depth?: number;
}

export default function AdminToolbarMenu({ item, depth = 0 }: AdminToolbarMenuProps) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const baseClasses =
    'block px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap';

  const content = (
    <>
      {item.icon && <span className="mr-2">{item.icon}</span>}
      <span>{item.label}</span>
      {hasChildren && <span className="ml-2 text-[10px] opacity-70">▾</span>}
    </>
  );

  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {item.href ? (
        item.external ? (
          <a href={item.href} target="_blank" rel="noopener noreferrer" className={baseClasses}>
            {content}
          </a>
        ) : (
          <Link href={item.href} className={baseClasses}>
            {content}
          </Link>
        )
      ) : (
        <button type="button" className={`${baseClasses} w-full text-left`}>
          {content}
        </button>
      )}

      {hasChildren && open && (
        <ul
          className={`absolute top-full left-0 min-w-[12rem] rounded-b-md bg-[#1a1a1a] shadow-lg border border-white/10 ${
            depth > 0 ? 'left-full top-0 rounded-r-md rounded-bl-md' : ''
          }`}
        >
          {item.children!.map((child) => (
            <AdminToolbarMenu key={child.id} item={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
```

- [ ] **Step 2: Verify component compiles**

Run: `npx tsc --noEmit src/components/admin/AdminToolbarMenu.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AdminToolbarMenu.tsx
git commit -m "feat(admin): add recursive toolbar menu component"
```

---

## Task 3: Create reusable admin toolbar shell

**Files:**
- Create: `src/components/admin/AdminToolbar.tsx`

- [ ] **Step 1: Write toolbar component**

```tsx
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
```

- [ ] **Step 2: Verify component compiles**

Run: `npx tsc --noEmit src/components/admin/AdminToolbar.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AdminToolbar.tsx
git commit -m "feat(admin): add reusable admin toolbar shell"
```

---

## Task 4: Mount toolbar in root layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Read current layout**

Read `src/app/layout.tsx` to find exact insertion point.

- [ ] **Step 2: Add import and mount toolbar**

Add import:
```tsx
import AdminToolbar from '@/components/admin/AdminToolbar';
```

Insert `<AdminToolbar />` as the first child inside `<body>` (before any other content), so it sits above page content.

- [ ] **Step 3: Add top padding compensation on desktop**

Ensure the main page content is not hidden behind the toolbar. Add a wrapper or adjust body classes. If layout already wraps children, add `md:pt-10` to the main wrapper. If no wrapper exists, wrap children in:
```tsx
<div className="md:pt-10">{children}</div>
```

- [ ] **Step 4: Verify layout compiles**

Run: `npx tsc --noEmit src/app/layout.tsx`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(admin): mount admin toolbar in root layout"
```

---

## Task 5: Hide login link on mobile

**Files:**
- Modify: `src/components/layout/Header.tsx` (or wherever login/admin link lives)

- [ ] **Step 1: Find admin/login link**

Search for `/admin` link in layout/header components.

- [ ] **Step 2: Hide on mobile**

Wrap the admin/login link in a container with `hidden md:block` (or equivalent responsive class) so it does not appear on mobile.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit src/components/layout/Header.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat(ui): hide admin login link on mobile"
```

---

## Task 6: Build and smoke test

- [ ] **Step 1: Run Next.js build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 2: Start dev server and verify toolbar**

Run: `npm run dev`
Open `http://localhost:3000/`, click the **Login** button in the header, log in with seeded admin credentials.
Expected:
- Toolbar visible at top on desktop.
- Hover over "Content" shows submenu with New Blog Post / New Project / New Experience / Manage Content.
- Clicking item navigates to correct admin page.
- Toolbar hidden on mobile (resize browser to < 768px).
- Login link hidden on mobile.

- [ ] **Step 3: Commit any fixes**

If changes needed, commit with descriptive message.

---

## Self-Review Checklist

- [ ] Spec coverage: toolbar renders only for admins, supports nested menus, mobile hidden, reusable component, mounted globally.
- [ ] No placeholders: every step has concrete code/commands.
- [ ] Type consistency: `AdminMenuItem` used everywhere; `AdminToolbar` accepts `menu` prop.
