'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  children: string;
  className?: string;
  filename?: string;
  terminal?: boolean;
}

export function CodeBlock({ children, className, filename, terminal }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  
  const language = className?.replace('language-', '') || 'text';
  const code = children.trim();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (terminal) {
    return (
      <div className="my-6 rounded-lg overflow-hidden border border-[var(--border)] bg-[#1e1e1e] shadow-lg">
        {/* Terminal header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#323233] border-b border-[#1e1e1e]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            {filename && (
              <span className="ml-2 text-xs text-gray-400 font-mono">{filename}</span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-[#404040] transition-colors text-gray-400 hover:text-gray-200"
            title="Copy to clipboard"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        {/* Terminal content */}
        <pre className="p-4 overflow-x-auto">
          <code className={`font-mono text-sm ${className}`}>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="relative group my-6">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-[var(--code-header)] rounded-t-lg border-b border-[var(--border)]">
          <span className="text-xs text-[var(--muted-foreground)] font-mono">{filename}</span>
          <span className="text-xs text-[var(--muted-foreground)] uppercase">{language}</span>
        </div>
      )}
      <div className="relative">
        <button
          onClick={handleCopy}
          className={`absolute top-3 right-3 p-2 rounded bg-[var(--background)] border border-[var(--border)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--muted)] ${
            copied ? 'opacity-100' : ''
          }`}
          title="Copy to clipboard"
        >
          {copied ? (
            <Check size={16} className="text-green-500" />
          ) : (
            <Copy size={16} className="text-[var(--muted-foreground)]" />
          )}
        </button>
        <pre className={`overflow-x-auto p-4 ${filename ? 'rounded-b-lg' : 'rounded-lg'} bg-[var(--code-bg)] border border-[var(--border)]`}>
          <code className={`font-mono text-sm ${className}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
}
