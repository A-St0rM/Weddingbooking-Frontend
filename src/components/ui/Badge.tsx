import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type Tone = 'ok' | 'warn' | 'danger' | 'info' | 'neutral' | 'primary';

const tones: Record<Tone, string> = {
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  neutral: 'bg-neutral-soft text-neutral',
  primary: 'bg-primary-soft text-primary',
};

/** Colour supports the meaning; the text carries it. Never a colour alone. */
export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone], className)}
    >
      {children}
    </span>
  );
}
