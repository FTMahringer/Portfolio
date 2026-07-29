import { randomUUID } from 'crypto';
import { notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/session';
import ContentEditor from '@/components/admin/ContentEditor';
import { buildInitialContent, buildInitialFrontmatter } from '@/lib/content-editor';
import { shouldShowExperienceRelations, shouldShowFeatureInContentManager, type ContentFeatureKey } from '@/lib/site-settings';

const VALID_TYPES = ['blog', 'projects', 'experience'] as const;
type ContentType = typeof VALID_TYPES[number];
type FormType = 'blog' | 'project' | 'experience';

export const metadata = { title: 'Create Content | Dev' };

export default async function NewContentPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type as ContentType)) notFound();
  if (!shouldShowFeatureInContentManager(contentTypeToFeature(type as ContentType))) notFound();
  await requireAdminSession();
  const formType: FormType = type === 'projects' ? 'project' : (type as FormType);

  return (
    <ContentEditor
      mode="create"
      type={formType}
      slug={formType === 'project' ? randomUUID() : ''}
      frontmatter={buildInitialFrontmatter(formType)}
      content={buildInitialContent()}
      showExperienceRelations={shouldShowExperienceRelations()}
    />
  );
}

function contentTypeToFeature(type: ContentType): ContentFeatureKey {
  return type === 'projects' ? 'projects' : type;
}
