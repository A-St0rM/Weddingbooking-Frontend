import { useId, type SelectHTMLAttributes } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
}

/** The native select: on a phone it opens the system picker, which beats anything custom. */
export function Select({ label, hint, options, className, id, ...props }: SelectProps) {
  const generated = useId();
  const selectId = id ?? generated;
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={selectId} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-describedby={hint ? `${selectId}-hint` : undefined}
          className="min-h-12 w-full cursor-pointer appearance-none rounded-control border border-control bg-surface pr-11 pl-4 text-base disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <CaretDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-muted" />
      </div>
      {hint && (
        <p id={`${selectId}-hint`} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
