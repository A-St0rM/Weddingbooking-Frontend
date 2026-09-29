import type { ReactNode } from 'react';

/** Nothing here yet — said calmly, with the next step when there is one. */
export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-card bg-surface/60 px-6 py-12 text-center ring-1 ring-line">
      <Sprig className="mx-auto mb-4 h-10 w-10 text-primary/40" />
      <p className="font-display text-xl font-medium">{title}</p>
      {children && <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-muted">{children}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

/** A small botanical mark, drawn in one line — the estate's garden, not a stock icon. */
export function Sprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M24 44V14" />
      <path d="M24 30c-6-1-10-5-11-11 6 1 10 5 11 11Z" />
      <path d="M24 24c6-1 10-5 11-11-6 1-10 5-11 11Z" />
      <path d="M24 16c-3-2-4-5-3-9 3 2 4 5 3 9Z" />
      <path d="M24 38c5 0 9-3 10-8-5 0-9 3-10 8Z" />
    </svg>
  );
}
