import { notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/session';
import { getBlogPostBySlug, getProjectBySlug, getExperienceBySlug } from '@/lib/mdx';
import ContentEditor from '@/components/admin/ContentEditor';

const VALID_TYPES = ['blog', 'projects', 'experience'] as const;
type ContentType = typeof VALID_TYPES[number];

const TYPE_MAP: Record<ContentType, 'blog' | 'project' | 'experience'> = {
  blog: 'blog',
  projects: 'project',
  experience: 'experience',
};

const LOADERS = {
  blog: getBlogPostBySlug,
  projects: getProjectBySlug,
  experience: getExperienceBySlug,
};

export const metadata = { title: 'Edit Content | Dev' };

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}) {
  const { type, slug } = await params;
  if (!VALID_TYPES.includes(type as ContentType)) notFound();

  await requireAdminSession();

  const editorType = TYPE_MAP[type as ContentType];
  const entry = LOADERS[type as ContentType](slug);
  if (!entry) notFound();

  return (
    <ContentEditor
      type={editorType}
      slug={slug}
      frontmatter={entry.frontmatter as unknown as Record<string, unknown>}
      content={entry.content}
    />
  );
}
