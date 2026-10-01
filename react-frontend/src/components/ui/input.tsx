import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-base sm:text-sm text-forest-900 placeholder:text-forest-700/40 transition-colors focus:border-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-400/30 disabled:opacity-60";

interface FieldWrapProps {
  label?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  id: string;
  children: React.ReactNode;
}

function FieldWrap({ label, error, required, hint, id, children }: FieldWrapProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-forest-800"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs text-forest-700/50">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, id, className, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <FieldWrap
        label={label}
        error={error}
        hint={hint}
        required={required}
        id={fieldId}
      >
        <input
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(fieldBase, error && "border-red-400", className)}
          {...props}
        />
      </FieldWrap>
    );
  },
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, required, id, className, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <FieldWrap
        label={label}
        error={error}
        hint={hint}
        required={required}
        id={fieldId}
      >
        <textarea
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(fieldBase, "min-h-28 resize-y", error && "border-red-400", className)}
          {...props}
        />
      </FieldWrap>
    );
  },
);
Textarea.displayName = "Textarea";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, required, id, className, children, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <FieldWrap label={label} error={error} required={required} id={fieldId}>
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(fieldBase, "cursor-pointer pr-10", error && "border-red-400", className)}
          {...props}
        >
          {children}
        </select>
      </FieldWrap>
    );
  },
);
Select.displayName = "Select";
