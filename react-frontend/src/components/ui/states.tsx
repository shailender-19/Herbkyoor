import { Link } from "@/components/ui/link";
import { buttonClasses } from "./button";
import { cn } from "@/lib/utils";

/** Simple pulse skeleton block. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-cream-200/80", className)}
      aria-hidden
    />
  );
}

/** Product-card shaped skeleton for loading grids. */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-cream-300 bg-cream-50">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-9 w-full rounded-full" />
      </div>
    </div>
  );
}

/** Centered spinner. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block h-6 w-6 animate-spin rounded-full border-2 border-forest-300 border-t-forest-700",
        className,
      )}
    />
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-cream-400 bg-cream-100/60 px-6 py-16 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-forest-50 text-forest-500">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-forest-800">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-forest-700/60">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className={buttonClasses({ variant: "primary", className: "mt-6" })}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
