"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { useEffect, useState } from "react";

const QUICK_CREATE = [
  {
    href: "/admin/new/blog",
    icon: "📝",
    label: "New Blog Post",
    desc: "Write and publish a blog article",
  },
  {
    href: "/admin/new/projects",
    icon: "🚀",
    label: "New Project",
    desc: "Showcase a new project",
  },
  {
    href: "/admin/new/experience",
    icon: "💼",
    label: "New Experience",
    desc: "Add a work or internship entry",
  },
];

const TOOLS = [
  {
    href: "/admin/api-docs",
    icon: "📖",
    label: "API Docs",
    desc: "Interactive OpenAPI documentation",
    external: false,
  },
  {
    href: "/admin/db",
    icon: "🗄️",
    label: "Database",
    desc: "Browse tables and run SQL queries",
    external: false,
  },
  {
    href: "/admin/sessions",
    icon: "🔑",
    label: "Sessions",
    desc: "Manage active login sessions",
    external: false,
  },
  {
    href: "/admin/settings",
    icon: "⚙️",
    label: "Settings",
    desc: "Change admin password and email",
    external: false,
  },
  {
    href: "/api/openapi",
    icon: "📋",
    label: "Raw OpenAPI Spec",
    desc: "JSON spec endpoint",
    external: true,
  },
];

type DbStats = { table: string; rows: number }[];

export default function AdminOverviewPage() {
  const pathname = usePathname();
  const { settings } = useSettings();
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [browserInfo, setBrowserInfo] = useState<Record<string, string>>({});
  const [perfInfo, setPerfInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    // Browser info (client-only)
    setBrowserInfo({
      userAgent:
        navigator.userAgent.slice(0, 60) +
        (navigator.userAgent.length > 60 ? "…" : ""),
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: String(navigator.cookieEnabled),
      onLine: String(navigator.onLine),
    });

    // Performance timing
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav) {
      setPerfInfo({
        domContentLoaded: `${Math.round(nav.domContentLoadedEventEnd - nav.startTime)}ms`,
        loadComplete: `${Math.round(nav.loadEventEnd - nav.startTime)}ms`,
        ttfb: `${Math.round(nav.responseStart - nav.requestStart)}ms`,
        transferSize:
          nav.transferSize > 0
            ? `${(nav.transferSize / 1024).toFixed(1)} KB`
            : "cached",
      });
    }

    // DB table stats
    fetch("/api/admin/db")
      .then((r) => r.json())
      .then((d) => setDbStats(d.tables ?? null))
      .catch(() => {});
  }, []);

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-mono font-semibold text-green-400 uppercase tracking-widest">
            Dev Dashboard
          </span>
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Overview
        </h1>
        <p className="text-[var(--muted)] text-sm mt-1">
          Create and manage portfolio content.
        </p>
      </div>

      {/* Quick create */}
      <section className="mb-10">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">
          Quick Create
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUICK_CREATE.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col gap-2.5 p-5 rounded-xl border border-[var(--border)] hover:border-green-400/50 hover:bg-green-400/5 transition-all group"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="text-sm font-semibold text-[var(--foreground)] group-hover:text-green-400 transition-colors">
                  {item.label}
                </div>
                <div className="text-xs text-[var(--muted)] mt-0.5">
                  {item.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className="mb-10">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">
          Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TOOLS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5 transition-all group"
            >
              <span className="text-xl mt-0.5">{item.icon}</span>
              <div>
                <div className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  {item.label}
                </div>
                <div className="text-xs text-[var(--muted)]">{item.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Debug info */}
      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">
          Debug
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <DebugCard
            title="Environment"
            rows={[
              { k: "path", v: pathname },
              { k: "env", v: process.env.NODE_ENV ?? "" },
              { k: "next", v: "16.2.4" },
              {
                k: "runtime",
                v: typeof window !== "undefined" ? "client" : "server",
              },
            ]}
          />

          <DebugCard
            title="Performance"
            rows={
              Object.entries(perfInfo).length > 0
                ? Object.entries(perfInfo).map(([k, v]) => ({ k, v }))
                : [{ k: "status", v: "measuring…" }]
            }
          />

          <DebugCard
            title="Browser"
            rows={
              Object.entries(browserInfo).length > 0
                ? Object.entries(browserInfo).map(([k, v]) => ({ k, v }))
                : [{ k: "status", v: "loading…" }]
            }
          />

          <DebugCard
            title="User Settings"
            rows={(Object.entries(settings) as [string, unknown][]).map(
              ([k, v]) => ({ k, v: String(v) }),
            )}
          />

          <DebugCard
            title="Database Tables"
            rows={
              dbStats
                ? dbStats.map((t) => ({ k: t.table, v: `${t.rows} rows` }))
                : [{ k: "status", v: "loading…" }]
            }
          />

          <DebugCard
            title="Request"
            rows={[
              { k: "timestamp", v: new Date().toISOString() },
              { k: "tz", v: Intl.DateTimeFormat().resolvedOptions().timeZone },
              {
                k: "locale",
                v: Intl.DateTimeFormat().resolvedOptions().locale,
              },
            ]}
          />
        </div>
      </section>
    </div>
  );
}

function DebugCard({
  title,
  rows,
}: {
  title: string;
  rows: { k: string; v: string }[];
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--muted-bg)] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[var(--border)]">
        <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="font-mono text-xs px-4 py-3 space-y-2 max-h-44 overflow-y-auto">
        {rows.map((r, i) => (
          <div key={`${r.k}-${i}`} className="flex justify-between gap-4">
            <span className="text-[var(--muted)] shrink-0">{r.k}</span>
            <span className="text-green-400 text-right truncate">{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
