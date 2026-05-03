import type { MDXComponents } from 'mdx/types';
import { CodeBlock } from './CodeBlock';

export const mdxComponents: MDXComponents = {
  h1: (props) => <h1 className="text-3xl font-bold mt-8 mb-4 text-[var(--foreground)]" {...props} />,
  h2: (props) => {
    const id = typeof props.children === 'string' ? props.children.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : undefined;
    return <h2 id={id} className="text-2xl font-semibold mt-8 mb-3 text-[var(--foreground)] border-b border-[var(--border)] pb-2" {...props} />;
  },
  h3: (props) => {
    const id = typeof props.children === 'string' ? props.children.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : undefined;
    return <h3 id={id} className="text-xl font-semibold mt-6 mb-2 text-[var(--foreground)]" {...props} />;
  },
  h4: (props) => {
    const id = typeof props.children === 'string' ? props.children.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : undefined;
    return <h4 id={id} className="text-lg font-semibold mt-4 mb-2 text-[var(--foreground)]" {...props} />;
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
  pre: (props: any) => {
    const code = props.children?.props?.children || '';
    const className = props.children?.props?.className || '';
    const filename = props.children?.props?.filename;
    const terminal = props.children?.props?.terminal === 'true' || props.children?.props?.terminal === true;
    
    return <CodeBlock className={className} filename={filename} terminal={terminal}>{code}</CodeBlock>;
  },
  blockquote: (props) => <blockquote className="border-l-4 border-[var(--accent)] pl-4 italic text-[var(--muted)] mb-4" {...props} />,
  hr: () => <hr className="border-[var(--border)] my-8" />,
  strong: (props) => <strong className="font-semibold text-[var(--foreground)]" {...props} />,
  em: (props) => <em className="italic" {...props} />,
};
