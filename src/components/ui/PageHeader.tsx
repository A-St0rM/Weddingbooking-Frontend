import type { ReactNode } from 'react';

export function PageHeader({ title, description, actions, eyebrow }: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** A short line above the title: where you are, or what day it is. */
  eyebrow?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-4xl leading-[1.05] font-medium tracking-tight lg:text-5xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
