import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** A sheet of paper on the canvas: no outline, lifted by a warm shadow. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-card bg-surface p-5 shadow-card ring-1 ring-line/60 sm:p-6', className)} {...props} />;
}
