
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Optional static footer (e.g. action buttons) pinned below the body. */
  footer?: React.ReactNode;
  className?: string;
}

/** Accessible modal dialog with backdrop, Escape-to-close and scroll lock. */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-forest-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-cream-50 shadow-xl focus:outline-none animate-[scale-in_0.25s_ease-out]",
          className,
        )}
      >
        {/* Static header — stays pinned while the body scrolls. */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-cream-300 bg-cream-50 px-6 py-4">
          {title && (
            <h2 className="text-xl font-bold text-forest-800">{title}</h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1.5 ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-forest-700 transition-colors hover:bg-cream-200"
          >
            <X size={20} />
          </button>
        </div>
        {/* Scrollable body. */}
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {/* Static footer — stays pinned while the body scrolls. */}
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-cream-300 bg-cream-50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
