
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

/** Controlled search input with a leading icon and a clear button. */
export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search Ayurvedic products…",
  className,
  autoFocus,
}: SearchBarProps) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className={cn("relative w-full", className)}
    >
      <Search
        size={18}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-700/50"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        className="h-11 w-full rounded-full border border-cream-300 bg-cream-50 pl-10 pr-10 text-base sm:text-sm text-forest-900 placeholder:text-forest-700/40 focus:border-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-400/30"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-forest-700/60 hover:bg-cream-200"
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
}
