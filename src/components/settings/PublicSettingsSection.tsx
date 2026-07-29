"use client";

import type { ReactNode } from "react";

interface PublicSettingsSectionProps {
  title: string;
  hint?: string;
  children: ReactNode;
}

export default function PublicSettingsSection({ title, hint, children }: PublicSettingsSectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--muted-bg)]/35 p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
        {hint && <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
