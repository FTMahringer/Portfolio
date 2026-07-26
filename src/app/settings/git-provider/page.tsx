'use client';

import { useState } from 'react';

type ProviderSelection = 'auto' | 'forgejo' | 'github';

interface TestResponse {
  ok: boolean;
  error?: string;
  code?: string;
  status?: number;
  provider?: {
    provider: string;
    host: string;
    baseUrl: string;
    repoUrl: string;
    repoName: string;
    supports: Record<string, boolean>;
  };
  repo?: {
    name: string;
    fullName: string;
    description: string | null;
    url: string;
    defaultBranch: string | null;
    stars: number | null;
    forks: number | null;
    language: string | null;
    updatedAt: string | null;
  };
  readme?: {
    source: string;
    path?: string;
    url?: string;
    contentPreview: string;
    contentLength: number;
    contentType: string;
  };
  docs?: {
    url: string | null;
    source: string;
    contentPreview: string | null;
    contentLength: number;
    pages: Array<{
      title: string;
      url: string | null;
      contentPreview: string;
      contentLength: number;
      contentType: string;
    }>;
  };
  activity?: {
    source: string;
    commits: Array<{
      sha: string;
      message: string;
      authorName: string | null;
      authorDate: string | null;
      url: string | null;
    }>;
  };
}

const inputClass =
  'w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]';

export default function GitProviderSettingsPage() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/FTMahringer/Portfolio');
  const [repoName, setRepoName] = useState('FTMahringer/Portfolio');
  const [provider, setProvider] = useState<ProviderSelection>('auto');
  const [docsUrl, setDocsUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResponse | null>(null);

  async function runTest(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/git-provider/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, repoName, provider, docsUrl }),
      });
      const data = (await response.json().catch(() => ({ ok: false, error: 'Invalid JSON response' }))) as TestResponse;
      setResult(data);
    } catch (error) {
      setResult({ ok: false, error: error instanceof Error ? error.message : 'Request failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] px-6 py-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-blue-400">Package Test</span>
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Git Provider Core</h1>
        <p className="mt-1 max-w-3xl text-sm text-[var(--muted)]">
          Test the locally installed <code className="font-mono">@ftmahringer/git-provider-core</code> package through its public client API.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_1fr]">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Connection input</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Uses a server route so future tokens or keys can stay off the browser.</p>

          <form onSubmit={runTest} className="mt-6 space-y-4">
            <Field label="Repository URL">
              <input
                required
                value={repoUrl}
                onChange={(event) => setRepoUrl(event.target.value)}
                placeholder="https://codeberg.org/owner/repo"
                className={inputClass}
              />
            </Field>

            <Field label="Repository name">
              <input
                required
                value={repoName}
                onChange={(event) => setRepoName(event.target.value)}
                placeholder="owner/repo"
                className={inputClass}
              />
            </Field>

            <Field label="Provider">
              <select value={provider} onChange={(event) => setProvider(event.target.value as ProviderSelection)} className={inputClass}>
                <option value="auto">Auto detect</option>
                <option value="forgejo">Forgejo-compatible</option>
                <option value="github">GitHub</option>
              </select>
            </Field>

            <Field label="Optional docs URL">
              <input
                value={docsUrl}
                onChange={(event) => setDocsUrl(event.target.value)}
                placeholder="https://example.com/docs.md"
                className={inputClass}
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
            >
              {loading ? 'Testing…' : 'Test connection'}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          {!result && (
            <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center text-sm text-[var(--muted)]">
              Run a test to see provider detection, repo metadata, README, docs, and activity results.
            </div>
          )}

          {result && !result.ok && (
            <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-6 text-red-300">
              <h2 className="text-lg font-semibold">Test failed</h2>
              <p className="mt-2 text-sm">{result.error}</p>
              {(result.code || result.status) && (
                <p className="mt-3 font-mono text-xs text-red-200/80">
                  {result.code ? `code=${result.code}` : ''} {result.status ? `status=${result.status}` : ''}
                </p>
              )}
            </div>
          )}

          {result?.ok && <ResultView result={result} />}
        </section>
      </div>
    </div>
  );
}

function ResultView({ result }: { result: TestResponse }) {
  return (
    <>
      {result.provider && (
        <Card title="Detected provider">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Meta label="Provider" value={result.provider.provider} />
            <Meta label="Host" value={result.provider.host} />
            <Meta label="Base URL" value={result.provider.baseUrl} />
            <Meta label="Repo" value={result.provider.repoName} />
          </dl>
        </Card>
      )}

      {result.repo && (
        <Card title="Repository">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Meta label="Name" value={result.repo.fullName} />
            <Meta label="Default branch" value={result.repo.defaultBranch ?? 'Unknown'} />
            <Meta label="Language" value={result.repo.language ?? 'Unknown'} />
            <Meta label="Stars" value={String(result.repo.stars ?? 0)} />
            <Meta label="Forks" value={String(result.repo.forks ?? 0)} />
            <Meta label="Updated" value={result.repo.updatedAt ?? 'Unknown'} />
          </dl>
          {result.repo.description && <p className="mt-4 text-sm text-[var(--muted)]">{result.repo.description}</p>}
        </Card>
      )}

      {result.readme && (
        <Card title="README">
          <p className="text-sm text-[var(--muted)]">
            Source: {result.readme.source} · {result.readme.contentLength} chars
          </p>
          <pre className="mt-4 max-h-72 overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-xs text-[var(--foreground)]">
            {result.readme.contentPreview}
          </pre>
        </Card>
      )}

      {result.docs && (
        <Card title="Docs">
          <p className="text-sm text-[var(--muted)]">
            Source: {result.docs.source} · {result.docs.pages.length} page{result.docs.pages.length === 1 ? '' : 's'} · {result.docs.contentLength} chars total
          </p>
          {result.docs.pages.length > 0 ? (
            <div className="mt-4 space-y-4">
              {result.docs.pages.map((page) => (
                <article key={`${page.title}-${page.url ?? 'no-url'}`} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-semibold text-[var(--foreground)]">{page.title}</h3>
                    <span className="font-mono text-xs text-[var(--muted)]">{page.contentLength} chars</span>
                  </div>
                  <pre className="max-h-72 overflow-auto rounded-xl border border-[var(--border)] bg-black/20 p-4 text-xs text-[var(--foreground)]">
                    {page.contentPreview}
                  </pre>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">No docs URL was provided or discovered.</p>
          )}
        </Card>
      )}

      {result.activity && (
        <Card title="Latest activity">
          <div className="space-y-3">
            {result.activity.commits.map((commit) => (
              <div key={commit.sha} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-sm font-medium text-[var(--foreground)]">{commit.message || 'No commit message'}</p>
                <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                  {commit.sha.slice(0, 8)} · {commit.authorName ?? 'Unknown author'} · {commit.authorDate ?? 'Unknown date'}
                </p>
              </div>
            ))}
            {result.activity.commits.length === 0 && <p className="text-sm text-[var(--muted)]">No commits returned.</p>}
          </div>
        </Card>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-[var(--foreground)]">{title}</h2>
      {children}
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 break-all font-mono text-[var(--foreground)]">{value}</dd>
    </div>
  );
}
