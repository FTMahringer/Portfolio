"use client";

import { useDevMode } from "@/context/DevContext";
import { useState } from "react";

/* ─── Gate component ─── */
function ApiDocsGate({ children }: { children: React.ReactNode }) {
  const { isDevMode, loading } = useDevMode();

  if (loading) return null;
  if (isDevMode) return <>{children}</>;

  return (
    <main className="max-w-md mx-auto px-4 py-24 flex flex-col items-center gap-6 text-center">
      <div className="text-4xl">🔒</div>
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          Admin Access Required
        </h1>
        <p className="text-[var(--muted)] text-sm">
          You need to be logged in as admin to view the API documentation.
        </p>
      </div>
      <a
        href="/admin"
        className="inline-block px-6 py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
      >
        Go to Admin Login →
      </a>
    </main>
  );
}

/* ─── types ─── */
type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface Endpoint {
  method: Method;
  path: string;
  operationId: string;
  summary: string;
  description: string;
  requiresAuth: boolean;
  tags: string[];
  requestBody?: {
    required: boolean;
    content: Record<string, { schema: unknown }>;
  };
  responses: Record<string, { description: string }>;
  parameters?: {
    name: string;
    in: string;
    required: boolean;
    schema: { type: string; enum?: string[] };
    description?: string;
  }[];
}

/* ─── helpers ─── */
const METHOD_COLORS: Record<Method, string> = {
  GET: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  POST: "bg-green-500/15 text-green-400 border-green-500/30",
  PUT: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  PATCH: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  "2": "text-green-400",
  "4": "text-yellow-400",
  "5": "text-red-400",
};

function statusColor(code: string) {
  return STATUS_COLORS[code[0]] ?? "text-[var(--muted)]";
}

function buildCurl(endpoint: Endpoint, serverUrl: string): string {
  const url = `${serverUrl}${endpoint.path.replace("{type}", "<type>")}`;
  const lines: string[] = [`curl -X ${endpoint.method} '${url}'`];
  if (endpoint.requiresAuth)
    lines.push(`  -H 'Authorization: Bearer <API_SECRET>'`);
  if (endpoint.method !== "GET")
    lines.push(`  -H 'Content-Type: application/json'`);
  if (endpoint.method === "POST" && endpoint.path.includes("contact")) {
    lines.push(
      `  -d '{"name":"Jane","email":"jane@example.com","message":"Hello!"}'`,
    );
  } else if (endpoint.method === "POST" && endpoint.path.includes("content")) {
    lines.push(
      `  -d '{"slug":"my-post","frontmatter":{"title":"My Post","date":"2024-01-01"},"content":"## Hello"}'`,
    );
  }
  return lines.join(" \\\n");
}

/* ─── sub-components ─── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="text-xs px-2 py-0.5 rounded border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function EndpointCard({ ep, serverUrl }: { ep: Endpoint; serverUrl: string }) {
  const [open, setOpen] = useState(false);
  const curl = buildCurl(ep, serverUrl);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--muted-bg)] transition-colors"
      >
        <span
          className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${METHOD_COLORS[ep.method]}`}
        >
          {ep.method}
        </span>
        <code className="text-sm font-mono text-[var(--foreground)]">
          {ep.path}
        </code>
        {ep.requiresAuth && (
          <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            🔑 Auth
          </span>
        )}
        <span className="ml-auto text-sm text-[var(--muted)]">
          {ep.summary}
        </span>
        <span className="text-[var(--muted)] text-xs ml-3">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="px-5 pb-5 border-t border-[var(--border)] space-y-4 pt-4">
          {/* Description */}
          <p
            className="text-sm text-[var(--muted)] leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: ep.description.replace(
                /\*\*(.+?)\*\*/g,
                "<strong>$1</strong>",
              ),
            }}
          />

          {/* Path params */}
          {ep.parameters && ep.parameters.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                Parameters
              </h4>
              <div className="space-y-1">
                {ep.parameters.map((p) => (
                  <div key={p.name} className="flex items-start gap-2 text-sm">
                    <code className="text-[var(--accent)] font-mono text-xs">
                      {p.name}
                    </code>
                    <span className="text-xs text-[var(--muted)] bg-[var(--muted-bg)] rounded px-1">
                      {p.in}
                    </span>
                    {p.required && (
                      <span className="text-xs text-red-400">required</span>
                    )}
                    {p.schema.enum && (
                      <span className="text-xs text-[var(--muted)]">
                        one of:{" "}
                        {p.schema.enum.map((v) => (
                          <code
                            key={v}
                            className="mx-0.5 px-1 bg-[var(--muted-bg)] rounded"
                          >
                            {v}
                          </code>
                        ))}
                      </span>
                    )}
                    {p.description && (
                      <span className="text-xs text-[var(--muted)]">
                        — {p.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Responses */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
              Responses
            </h4>
            <div className="space-y-1">
              {Object.entries(ep.responses).map(([code, r]) => (
                <div key={code} className="flex items-center gap-3 text-sm">
                  <code
                    className={`font-mono font-bold text-xs ${statusColor(code)}`}
                  >
                    {code}
                  </code>
                  <span className="text-[var(--muted)]">{r.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* cURL example */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Example (cURL)
              </h4>
              <CopyButton text={curl} />
            </div>
            <pre className="text-xs font-mono p-3 rounded-lg bg-[var(--muted-bg)] border border-[var(--border)] overflow-x-auto text-[var(--foreground)] whitespace-pre-wrap">
              {curl}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── main component ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ApiDocsInner({ spec }: { spec: any }) {
  const serverUrl = spec.servers?.[0]?.url ?? "/api";

  // Flatten paths into endpoint objects
  const endpoints: Endpoint[] = [];
  for (const [path, pathItem] of Object.entries(spec.paths ?? {}) as [
    string,
    Record<string, unknown>,
  ][]) {
    const params = (pathItem.parameters ?? []) as Endpoint["parameters"];
    for (const method of ["get", "post", "put", "patch", "delete"] as const) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const op = pathItem[method] as any;
      if (!op) continue;
      endpoints.push({
        method: method.toUpperCase() as Method,
        path,
        operationId: op.operationId ?? "",
        summary: op.summary ?? "",
        description: op.description ?? "",
        requiresAuth: !!op.security?.length,
        tags: op.tags ?? [],
        requestBody: op.requestBody,
        responses: op.responses ?? {},
        parameters: params,
      });
    }
  }

  const tags: string[] = Array.from(new Set(endpoints.flatMap((e) => e.tags)));
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? endpoints.filter((e) => e.tags.includes(activeTag))
    : endpoints;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            {spec.info.title}
          </h1>
          <span className="text-xs px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)] font-mono">
            v{spec.info.version}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)] font-mono">
            OpenAPI {spec.openapi}
          </span>
        </div>
        <p
          className="text-[var(--muted)] leading-relaxed max-w-2xl"
          dangerouslySetInnerHTML={{
            __html: spec.info.description.replace(
              /\*\*(.+?)\*\*/g,
              '<strong class="text-[var(--foreground)]">$1</strong>',
            ),
          }}
        />
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <span>Base URL:</span>
          <code className="font-mono text-[var(--accent)] bg-[var(--muted-bg)] px-2 py-0.5 rounded">
            {serverUrl}
          </code>
          <a
            href="/api/openapi"
            target="_blank"
            className="ml-2 text-xs border border-[var(--border)] px-2 py-0.5 rounded hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
          >
            openapi.json ↗
          </a>
        </div>
      </div>

      {/* Auth notice */}
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex gap-3">
        <span className="text-lg">🔑</span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Authentication
          </p>
          <p className="text-sm text-[var(--muted)]">
            Write endpoints require{" "}
            <code className="font-mono text-xs bg-[var(--muted-bg)] px-1 py-0.5 rounded">
              Authorization: Bearer &lt;API_SECRET&gt;
            </code>
            . The secret is set by the site owner via the{" "}
            <code className="font-mono text-xs bg-[var(--muted-bg)] px-1 py-0.5 rounded">
              API_SECRET
            </code>{" "}
            environment variable. Public (read-only) endpoints need no auth.
          </p>
        </div>
      </div>

      {/* Tag filter */}
      {tags.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-[var(--muted)]">Filter:</span>
          <button
            onClick={() => setActiveTag(null)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              !activeTag
                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                activeTag === tag
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Endpoints */}
      <div className="space-y-3">
        {filtered.map((ep) => (
          <EndpointCard
            key={`${ep.method}-${ep.path}`}
            ep={ep}
            serverUrl={serverUrl}
          />
        ))}
      </div>
    </main>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ApiDocsClient({ spec, embedded = false }: { spec: any; embedded?: boolean }) {
  if (embedded) {
    // Inside dev layout — skip the auth gate, no outer chrome
    return <ApiDocsInner spec={spec} />;
  }
  return (
    <ApiDocsGate>
      <ApiDocsInner spec={spec} />
    </ApiDocsGate>
  );
}
