"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** Build a compact page list with ellipses, e.g. 1 … 4 5 6 … 12 */
function pageList(page: number, total: number): (number | "…")[] {
  if (total <= 7)
    return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const items = pageList(page, totalPages);

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 text-forest-700 transition-colors hover:bg-cream-200 disabled:opacity-40"
      >
        <ChevronLeft size={18} />
      </button>

      {items.map((it, i) =>
        it === "…" ? (
          <span
            key={`e${i}`}
            className="px-2 text-forest-700/50"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={it}
            type="button"
            onClick={() => onChange(it)}
            aria-current={it === page ? "page" : undefined}
            className={cn(
              "h-10 min-w-10 rounded-full px-3 text-sm font-medium transition-colors",
              it === page
                ? "bg-forest-700 text-cream-50"
                : "border border-cream-300 text-forest-700 hover:bg-cream-200",
            )}
          >
            {it}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 text-forest-700 transition-colors hover:bg-cream-200 disabled:opacity-40"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
