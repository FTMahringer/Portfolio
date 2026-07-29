'use client';

import { useState } from 'react';
import { useTranslations } from '@/context/TranslationContext';

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
  const { t } = useTranslations();
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
      const data = (await response.json().catch(() => ({ ok: false, error: t('settings.pages.gitProvider.errors.invalidJson') }))) as TestResponse;
      setResult(data);
    } catch (error) {
      setResult({ ok: false, error: error instanceof Error ? error.message : t('settings.pages.gitProvider.errors.requestFailed') });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] px-6 py-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-blue-400">{t('settings.pages.gitProvider.badge')}</span>
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">{t('settings.pages.gitProvider.title')}</h1>
        <p className="mt-1 max-w-3xl text-sm text-[var(--muted)]">
          {t('settings.pages.gitProvider.description')}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_1fr]">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{t('settings.pages.gitProvider.sections.connection.title')}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{t('settings.pages.gitProvider.sections.connection.description')}</p>

          <form onSubmit={runTest} className="mt-6 space-y-4">
            <Field label={t('settings.pages.gitProvider.fields.repoUrl')}>
              <input
                required
                value={repoUrl}
                onChange={(event) => setRepoUrl(event.target.value)}
                placeholder="https://codeberg.org/owner/repo"
                className={inputClass}
              />
            </Field>

            <Field label={t('settings.pages.gitProvider.fields.repoName')}>
              <input
                required
                value={repoName}
                onChange={(event) => setRepoName(event.target.value)}
                placeholder="owner/repo"
                className={inputClass}
              />
            </Field>

            <Field label={t('settings.pages.gitProvider.fields.provider')}>
              <select value={provider} onChange={(event) => setProvider(event.target.value as ProviderSelection)} className={inputClass}>
                <option value="auto">{t('settings.pages.gitProvider.providerOptions.auto')}</option>
                <option value="forgejo">{t('settings.pages.gitProvider.providerOptions.forgejo')}</option>
                <option value="github">{t('settings.pages.gitProvider.providerOptions.github')}</option>
              </select>
            </Field>

            <Field label={t('settings.pages.gitProvider.fields.docsUrl')}>
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
              {loading ? t('settings.pages.gitProvider.actions.testing') : t('settings.pages.gitProvider.actions.testConnection')}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          {!result && (
            <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center text-sm text-[var(--muted)]">
              {t('settings.pages.gitProvider.empty')}
            </div>
          )}

          {result && !result.ok && (
            <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-6 text-red-300">
              <h2 className="text-lg font-semibold">{t('settings.pages.gitProvider.errors.title')}</h2>
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
  const { t } = useTranslations();

  return (
    <>
      {result.provider && (
        <Card title={t('settings.pages.gitProvider.sections.detectedProvider.title')}>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Meta label={t('settings.pages.gitProvider.meta.provider')} value={result.provider.provider} />
            <Meta label={t('settings.pages.gitProvider.meta.host')} value={result.provider.host} />
            <Meta label={t('settings.pages.gitProvider.meta.baseUrl')} value={result.provider.baseUrl} />
            <Meta label={t('settings.pages.gitProvider.meta.repo')} value={result.provider.repoName} />
          </dl>
        </Card>
      )}

      {result.repo && (
        <Card title={t('settings.pages.gitProvider.sections.repository.title')}>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Meta label={t('settings.pages.gitProvider.meta.name')} value={result.repo.fullName} />
            <Meta label={t('settings.pages.gitProvider.meta.defaultBranch')} value={result.repo.defaultBranch ?? t('settings.pages.gitProvider.meta.unknown')} />
            <Meta label={t('settings.pages.gitProvider.meta.language')} value={result.repo.language ?? t('settings.pages.gitProvider.meta.unknown')} />
            <Meta label={t('settings.pages.gitProvider.meta.stars')} value={String(result.repo.stars ?? 0)} />
            <Meta label={t('settings.pages.gitProvider.meta.forks')} value={String(result.repo.forks ?? 0)} />
            <Meta label={t('settings.pages.gitProvider.meta.updated')} value={result.repo.updatedAt ?? t('settings.pages.gitProvider.meta.unknown')} />
          </dl>
          {result.repo.description && <p className="mt-4 text-sm text-[var(--muted)]">{result.repo.description}</p>}
        </Card>
      )}

      {result.readme && (
        <Card title={t('settings.pages.gitProvider.sections.readme.title')}>
          <p className="text-sm text-[var(--muted)]">
            {t('settings.pages.gitProvider.readme.source')}: {result.readme.source} · {result.readme.contentLength} {t('settings.pages.gitProvider.readme.chars')}
          </p>
          <pre className="mt-4 max-h-72 overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-xs text-[var(--foreground)]">
            {result.readme.contentPreview}
          </pre>
        </Card>
      )}

      {result.docs && (
        <Card title={t('settings.pages.gitProvider.sections.docs.title')}>
          <p className="text-sm text-[var(--muted)]">
            {t('settings.pages.gitProvider.docs.source')}: {result.docs.source} · {result.docs.pages.length} {result.docs.pages.length === 1 ? t('settings.pages.gitProvider.docs.page') : t('settings.pages.gitProvider.docs.pages')} · {result.docs.contentLength} {t('settings.pages.gitProvider.docs.charsTotal')}
          </p>
          {result.docs.pages.length > 0 ? (
            <div className="mt-4 space-y-4">
              {result.docs.pages.map((page) => (
                <article key={`${page.title}-${page.url ?? 'no-url'}`} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-semibold text-[var(--foreground)]">{page.title}</h3>
                    <span className="font-mono text-xs text-[var(--muted)]">{page.contentLength} {t('settings.pages.gitProvider.readme.chars')}</span>
                  </div>
                  <pre className="max-h-72 overflow-auto rounded-xl border border-[var(--border)] bg-black/20 p-4 text-xs text-[var(--foreground)]">
                    {page.contentPreview}
                  </pre>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">{t('settings.pages.gitProvider.docs.empty')}</p>
          )}
        </Card>
      )}

      {result.activity && (
        <Card title={t('settings.pages.gitProvider.sections.activity.title')}>
          <div className="space-y-3">
            {result.activity.commits.map((commit) => (
              <div key={commit.sha} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-sm font-medium text-[var(--foreground)]">{commit.message || t('settings.pages.gitProvider.commit.noMessage')}</p>
                <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                  {commit.sha.slice(0, 8)} · {commit.authorName ?? t('settings.pages.gitProvider.commit.unknownAuthor')} · {commit.authorDate ?? t('settings.pages.gitProvider.commit.unknownDate')}
                </p>
              </div>
            ))}
            {result.activity.commits.length === 0 && <p className="text-sm text-[var(--muted)]">{t('settings.pages.gitProvider.commit.empty')}</p>}
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
