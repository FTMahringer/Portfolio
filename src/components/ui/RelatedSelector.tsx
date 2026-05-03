"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Fuse from "fuse.js";
import type { SearchItem } from "@/lib/search-types";

interface RelatedSelectorProps {
  type: "project" | "experience";
  selected: string[]; // slugs
  onChange: (slugs: string[]) => void;
}

export function RelatedSelector({
  type,
  selected,
  onChange,
}: RelatedSelectorProps) {
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch search index, filter to this type
  useEffect(() => {
    fetch("/api/search/index")
      .then((r) => r.json())
      .then((data: SearchItem[]) =>
        setItems(data.filter((i) => i.type === type)),
      )
      .catch(() => setItems([]));
  }, [type]);

  const fuse = useMemo(() => {
    if (!items) return null;
    return new Fuse(items, {
      keys: [
        { name: "title", weight: 0.6 },
        { name: "company", weight: 0.4 },
      ],
      threshold: 0.4,
    });
  }, [items]);

  const results: SearchItem[] =
    query.length >= 1
      ? (fuse?.search(query, { limit: 8 }).map((r) => r.item) ?? [])
      : (items?.slice(0, 8) ?? []);

  const selectedItems = (items ?? []).filter((i) =>
    selected.includes(i.id.replace(`${type}-`, "")),
  );

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function toggle(item: SearchItem) {
    const slug = item.id.replace(`${type}-`, "");
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug));
    } else {
      onChange([...selected, slug]);
      setQuery("");
    }
  }

  const label = type === "project" ? "Related Projects" : "Related Experience";
  const placeholder =
    type === "project" ? "Search projects…" : "Search experience…";

  return (
    <div ref={containerRef} className="col-span-2 space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </label>

      {/* Selected chips */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <span
              key={item.id}
              className="flex items-center gap-1.5 text-xs bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 rounded-full px-3 py-1"
            >
              {item.title}
              {item.company && (
                <span className="opacity-60">· {item.company}</span>
              )}
              <button
                type="button"
                onClick={() => toggle(item)}
                className="hover:text-red-400 transition-colors cursor-pointer ml-0.5 leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-[var(--accent)] transition">
          <svg
            className="text-[var(--muted)] flex-shrink-0"
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={items === null ? "Loading…" : placeholder}
            disabled={items === null}
            className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder-[var(--muted)] outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && results.length > 0 && (
          <div className="absolute z-20 top-full mt-1 w-full bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
            {results.map((item) => {
              const slug = item.id.replace(`${type}-`, "");
              const isSelected = selected.includes(slug);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    toggle(item);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "hover:bg-[var(--muted-bg)] text-[var(--foreground)]"
                  }`}
                >
                  <span className="flex-1 truncate font-medium">
                    {item.title}
                  </span>
                  {item.company && (
                    <span className="text-xs text-[var(--muted)] truncate">
                      {item.company}
                    </span>
                  )}
                  {isSelected && (
                    <svg
                      className="flex-shrink-0 text-[var(--accent)]"
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
