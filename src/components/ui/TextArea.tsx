import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea({ label, hint, className, id, rows = 5, ...props }, ref) {
  const generated = useId();
  const areaId = id ?? generated;
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={areaId} className="block text-sm font-medium">
        {label}
      </label>
      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        aria-describedby={hint ? `${areaId}-hint` : undefined}
        className="w-full rounded-control border border-control bg-surface px-4 py-3 text-base leading-relaxed"
        {...props}
      />
      {hint && (
        <p id={`${areaId}-hint`} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}
    </div>
  );
});
