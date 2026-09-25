import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
  error?: string;
  trailing?: ReactNode;
}

/**
 * A labelled input. The label is always visible — a placeholder is not a label —
 * and hint and error are tied to the input with aria-describedby so a screen
 * reader reads them with it.
 */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, hint, error, trailing, className, id, required, ...props },
  ref,
) {
  const generated = useId();
  const inputId = id ?? generated;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={inputId} className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          className={cn(
            'min-h-12 w-full rounded-control border bg-surface px-4 text-base text-ink',
            'placeholder:text-ink-muted/70',
            error ? 'border-danger-solid' : 'border-control',
            trailing ? 'pr-14' : undefined,
          )}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
