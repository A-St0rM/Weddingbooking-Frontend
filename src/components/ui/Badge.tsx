import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type Tone = 'ok' | 'warn' | 'danger' | 'info' | 'neutral' | 'primary';

const tones: Record<Tone, { box: string; dot: string }> = {
  ok: { box: 'bg-ok-soft text-ok', dot: 'bg-ok' },
  warn: { box: 'bg-warn-soft text-warn', dot: 'bg-warn' },
  danger: { box: 'bg-danger-soft text-danger', dot: 'bg-danger' },
  info: { box: 'bg-info-soft text-info', dot: 'bg-info' },
  neutral: { box: 'bg-neutral-soft text-neutral', dot: 'bg-neutral' },
  primary: { box: 'bg-primary-soft text-primary', dot: 'bg-primary' },
};

/** Colour supports the meaning; the text carries it. Never a colour alone. */
export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap', tones[tone].box, className)}>
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', tones[tone].dot)} />
      {children}
    </span>
  );
}
