import { useId } from 'react';
import { cn } from '@/lib/cn';

/** A choice between a few options, all visible at once. Radio buttons underneath. */
export function Segmented<T extends string>({ label, value, onChange, options, hint }: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  hint?: string;
}) {
  const name = useId();
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-control bg-neutral-soft p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex min-h-11 cursor-pointer items-center justify-center rounded-[0.6rem] px-3 text-center text-sm font-medium transition-colors',
              'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-primary',
              value === option.value ? 'bg-surface text-ink shadow-card' : 'text-ink-muted hover:text-ink',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
      {hint && <p className="text-sm text-ink-muted">{hint}</p>}
    </fieldset>
  );
}
