import { createGitProviderClient, GitProviderError } from '@ftmahringer/git-provider-core';
import type { GitProviderSelection } from '@ftmahringer/git-provider-core';

export const dynamic = 'force-dynamic';

interface GitProviderTestRequest {
  repoUrl?: unknown;
  repoName?: unknown;
  provider?: unknown;
  docsUrl?: unknown;
}

const PREVIEW_LENGTH = 1200;
const VALID_PROVIDERS = new Set(['auto', 'forgejo', 'github']);

export async function POST(request: Request) {
  let body: GitProviderTestRequest;

  try {
    body = (await request.json()) as GitProviderTestRequest;
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const repoUrl = stringField(body.repoUrl);
  const repoName = stringField(body.repoName);
  const provider = stringField(body.provider) || 'auto';
  const docsUrl = stringField(body.docsUrl);

  if (!repoUrl || !repoName) {
    return Response.json({ ok: false, error: 'Repository URL and repository name are required.' }, { status: 400 });
  }

  if (!VALID_PROVIDERS.has(provider)) {
    return Response.json({ ok: false, error: 'Provider must be auto, forgejo, or github.' }, { status: 400 });
  }

  try {
    const client = createGitProviderClient({
      repoUrl,
      repoName,
      provider: provider as GitProviderSelection,
      docsUrl: docsUrl || undefined,
    });

    const [providerInfo, repo, readme, docs, activity] = await Promise.all([
      client.getProviderInfo(),
      client.getRepo(),
      client.getReadme(),
      client.getDocs(),
      client.getActivity(),
    ]);

    return Response.json({
      ok: true,
      provider: providerInfo,
      repo,
      readme: {
        ...readme,
        content: undefined,
        contentPreview: preview(readme.content),
        contentLength: readme.content.length,
      },
      docs: {
        ...docs,
        content: undefined,
        contentPreview: docs.content ? preview(docs.content) : null,
        contentLength: docs.content?.length ?? 0,
        pages: docs.pages.map((page) => ({
          ...page,
          content: undefined,
          contentPreview: preview(page.content),
          contentLength: page.content.length,
        })),
      },
      activity: {
        ...activity,
        commits: activity.commits.slice(0, 10),
      },
    });
  } catch (error) {
    if (error instanceof GitProviderError) {
      const status = error.status && error.status >= 400 && error.status < 600 ? error.status : 400;

      return Response.json(
        {
          ok: false,
          error: error.message,
          code: error.code,
          provider: error.provider,
          status: error.status,
        },
        { status },
      );
    }

    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown git provider test error',
      },
      { status: 500 },
    );
  }
}

function stringField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function preview(content: string): string {
  return content.length > PREVIEW_LENGTH ? `${content.slice(0, PREVIEW_LENGTH)}…` : content;
}
