'use client';

import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import { TableOfContents } from '@/components/mdx/TableOfContents';
import { extractHeadings } from '@/lib/toc-utils';
import { ProjectFrontmatter } from '@/lib/types'; // Assuming ProjectFrontmatter is needed for props

interface ProjectContentWrapperProps {
  content: string;
  frontmatter: ProjectFrontmatter;
}

export default function ProjectContentWrapper({ content, frontmatter }: ProjectContentWrapperProps) {
  const headings = extractHeadings(content);

  return (
    <>
      <TableOfContents headings={headings} />
      <article className="prose-content">
        <MDXRemote source={content} components={mdxComponents} />
      </article>
    </>
  );
}
