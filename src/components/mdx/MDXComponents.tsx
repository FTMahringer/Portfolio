import { isValidElement, type ReactNode } from 'react';
import type { MDXComponents } from 'mdx/types';
import { CodeBlock } from './CodeBlock';
import { slugify } from '@/lib/toc-utils';

function getHeadingText(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map((child) => getHeadingText(child)).join('');
  }

  if (isValidElement(children)) {
    const nestedChildren = children.props as { children?: ReactNode };
    return getHeadingText(nestedChildren.children);
  }

  return '';
}

function headingId(children: ReactNode): string | undefined {
  const text = getHeadingText(children).trim();
  return text ? slugify(text) : undefined;
}

export const mdxComponents: MDXComponents = {
  h1: (props) => {
    const { children, ...rest } = props;
    const id = headingId(children);
    return <h1 {...rest} id={id} className="scroll-mt-24 text-3xl font-bold mt-8 mb-4 text-[var(--foreground)]">{children}</h1>;
  },
  h2: (props) => {
    const { children, ...rest } = props;
    const id = headingId(children);
    return <h2 {...rest} id={id} className="scroll-mt-24 text-2xl font-semibold mt-8 mb-3 text-[var(--foreground)] border-b border-[var(--border)] pb-2">{children}</h2>;
  },
  h3: (props) => {
    const { children, ...rest } = props;
    const id = headingId(children);
    return <h3 {...rest} id={id} className="scroll-mt-24 text-xl font-semibold mt-6 mb-2 text-[var(--foreground)]">{children}</h3>;
  },
  h4: (props) => {
    const { children, ...rest } = props;
    const id = headingId(children);
    return <h4 {...rest} id={id} className="scroll-mt-24 text-lg font-semibold mt-4 mb-2 text-[var(--foreground)]">{children}</h4>;
  },
  p: (props) => <p className="leading-7 mb-4 text-[var(--foreground)]" {...props} />,
  a: (props) => <a className="text-[var(--accent)] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
  ul: (props) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
  li: (props) => <li className="leading-7 text-[var(--foreground)]" {...props} />,
  code: (props) => {
    // Inline code
    if (!props.className) {
      return <code className="font-mono text-sm bg-[var(--muted-bg)] text-[var(--accent)] px-1.5 py-0.5 rounded" {...props} />;
    }
    // Block code - handled by pre
    return <code {...props} />;
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => {
    const code = (props.children as { props?: { children?: string } })?.props?.children || '';
    const className = (props.children as { props?: { className?: string } })?.props?.className || '';
    const filename = (props.children as { props?: { filename?: string } })?.props?.filename;
    const terminal = (props.children as { props?: { terminal?: string | boolean } })?.props?.terminal === 'true' || 
                     (props.children as { props?: { terminal?: string | boolean } })?.props?.terminal === true;
    
    return <CodeBlock className={className} filename={filename} terminal={terminal}>{code}</CodeBlock>;
  },
  blockquote: (props) => <blockquote className="border-l-4 border-[var(--accent)] pl-4 italic text-[var(--muted)] mb-4" {...props} />,
  hr: () => <hr className="border-[var(--border)] my-8" />,
  strong: (props) => <strong className="font-semibold text-[var(--foreground)]" {...props} />,
  em: (props) => <em className="italic" {...props} />,
};
