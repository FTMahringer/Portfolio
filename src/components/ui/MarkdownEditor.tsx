"use client";

import { useState, useRef, useCallback, useId } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownEditorProps {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  label?: string;
  basic?: boolean;
}

interface ToolbarAction {
  icon: string;
  title: string;
  action: (text: string, sel: SelectionRange) => InsertResult;
}

interface SelectionRange {
  start: number;
  end: number;
}

interface InsertResult {
  text: string;
  cursorStart: number;
  cursorEnd: number;
}

function wrap(before: string, after: string, placeholder: string) {
  return (text: string, { start, end }: SelectionRange): InsertResult => {
    const selected = text.slice(start, end);
    const inner = selected || placeholder;
    const next =
      text.slice(0, start) + before + inner + after + text.slice(end);
    return {
      text: next,
      cursorStart: start + before.length,
      cursorEnd: start + before.length + inner.length,
    };
  };
}

function linePrefix(prefix: string, placeholder: string) {
  return (text: string, { start, end }: SelectionRange): InsertResult => {
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = text.indexOf("\n", end);
    const actualEnd = lineEnd === -1 ? text.length : lineEnd;
    const lineText = text.slice(lineStart, actualEnd);
    const already = lineText.startsWith(prefix);
    const newLine = already
      ? lineText.slice(prefix.length)
      : prefix + (lineText || placeholder);
    const next = text.slice(0, lineStart) + newLine + text.slice(actualEnd);
    return {
      text: next,
      cursorStart: lineStart + (already ? 0 : prefix.length),
      cursorEnd: lineStart + newLine.length,
    };
  };
}

function insertBlock(before: string, inner: string, after: string) {
  return (text: string, { start }: SelectionRange): InsertResult => {
    const nl = start > 0 && text[start - 1] !== "\n" ? "\n" : "";
    const block = nl + before + inner + after;
    const next = text.slice(0, start) + block + text.slice(start);
    const offset = start + nl.length + before.length;
    return {
      text: next,
      cursorStart: offset,
      cursorEnd: offset + inner.length,
    };
  };
}

const TOOLBAR: (ToolbarAction | "sep")[] = [
  { icon: "B", title: "Bold", action: wrap("**", "**", "bold text") },
  { icon: "I", title: "Italic", action: wrap("*", "*", "italic text") },
  {
    icon: "S̶",
    title: "Strikethrough",
    action: wrap("~~", "~~", "strikethrough"),
  },
  "sep",
  { icon: "H1", title: "Heading 1", action: linePrefix("# ", "Heading") },
  { icon: "H2", title: "Heading 2", action: linePrefix("## ", "Heading") },
  { icon: "H3", title: "Heading 3", action: linePrefix("### ", "Heading") },
  "sep",
  { icon: "`·`", title: "Inline code", action: wrap("`", "`", "code") },
  {
    icon: "```",
    title: "Code block",
    action: insertBlock("```\n", "code here", "\n```\n"),
  },
  "sep",
  {
    icon: "—",
    title: "Horizontal rule",
    action: insertBlock("\n", "---", "\n\n"),
  },
  { icon: "❝", title: "Blockquote", action: linePrefix("> ", "quote") },
  { icon: "•", title: "Bullet list", action: linePrefix("- ", "list item") },
  {
    icon: "1.",
    title: "Numbered list",
    action: linePrefix("1. ", "list item"),
  },
  "sep",
  {
    icon: "🔗",
    title: "Link",
    action: (text, { start, end }) => {
      const sel = text.slice(start, end);
      const md = `[${sel || "link text"}](url)`;
      const next = text.slice(0, start) + md + text.slice(end);
      return { text: next, cursorStart: start, cursorEnd: start + md.length };
    },
  },
  {
    icon: "🖼",
    title: "Image",
    action: (text, { start }) => {
      const md = "![alt text](url)";
      const next = text.slice(0, start) + md + text.slice(start);
      return { text: next, cursorStart: start + 2, cursorEnd: start + 10 };
    },
  },
];

export function MarkdownEditor({
  value,
  onChange,
  rows = 20,
  placeholder,
  label,
  basic = false,
}: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uid = useId();

  const applyAction = useCallback(
    (action: ToolbarAction["action"]) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const { selectionStart: start, selectionEnd: end } = ta;
      const result = action(value, { start, end });
      onChange(result.text);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(result.cursorStart, result.cursorEnd);
      });
    },
    [value, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const { selectionStart: s, selectionEnd: e2 } = ta;
        const next = value.slice(0, s) + "  " + value.slice(e2);
        onChange(next);
        requestAnimationFrame(() => ta.setSelectionRange(s + 2, s + 2));
      }
    },
    [value, onChange],
  );

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={uid}
            className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
          >
            {label}
          </label>
          <span className="text-[11px] text-[var(--muted)] font-mono">
            Markdown supported
          </span>
        </div>
      )}

      {/* Toolbar / Basic Bar */}
      <div
        className={`flex items-center gap-0.5 flex-wrap p-1.5 rounded-t-lg border border-b-0 border-[var(--border)] bg-[var(--muted-bg)] ${
          preview && !basic ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {basic ? (
          <>
            <span className="px-2 text-xs text-[var(--muted)]">
              Markdown is supported.
            </span>
            <div className="flex-1" />
          </>
        ) : (
          <>
            {TOOLBAR.map((item, i) => {
              if (item === "sep") {
                return (
                  <div
                    key={`sep-${i}`}
                    className="w-px h-4 bg-[var(--border)] mx-1 self-stretch"
                  />
                );
              }

              return (
                <button
                  key={item.title}
                  type="button"
                  title={item.title}
                  onClick={() => applyAction(item.action)}
                  className="px-2 py-1 text-[11px] font-mono text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] rounded transition-colors cursor-pointer min-w-[28px] text-center"
                >
                  {item.icon}
                </button>
              );
            })}
            <div className="flex-1" />
          </>
        )}

        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors cursor-pointer border ${
            preview
              ? "bg-[var(--accent)] text-white border-[var(--accent)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)] border-[var(--border)] hover:border-[var(--accent)]/50"
          }`}
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div
          className="min-h-[320px] border border-[var(--border)] rounded-b-lg px-5 py-4 prose prose-invert max-w-none overflow-auto bg-[var(--background)]"
          style={{ minHeight: `${rows * 1.5}rem` }}
        >
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-[var(--muted)] italic text-sm">
              Nothing to preview yet…
            </p>
          )}
        </div>
      ) : (
        <textarea
          id={uid}
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={rows}
          placeholder={placeholder}
          spellCheck={false}
          className="w-full bg-[var(--background)] border border-[var(--border)] rounded-b-lg px-4 py-3 text-sm font-mono text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-y leading-relaxed transition"
        />
      )}
    </div>
  );
}
