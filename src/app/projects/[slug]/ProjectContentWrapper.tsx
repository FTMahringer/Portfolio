import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';

interface ProjectContentWrapperProps {
  content: string;
}

export default function ProjectContentWrapper({ content }: ProjectContentWrapperProps) {
  return (
    <article className="prose-content">
      <MDXRemote source={content} components={mdxComponents} />
    </article>
  );
}
