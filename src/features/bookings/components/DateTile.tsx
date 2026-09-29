import { cn } from '@/lib/cn';

const weekday = new Intl.DateTimeFormat('da-DK', { weekday: 'short' });
const month = new Intl.DateTimeFormat('da-DK', { month: 'short' });

/** A date the way a paper calendar shows it: the day large, the rest small. */
export function DateTile({ iso, className }: { iso: string; className?: string }) {
  const date = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return (
    <span aria-hidden="true" className={cn('flex w-14 shrink-0 flex-col items-center rounded-xl bg-canvas py-1.5 ring-1 ring-line', className)}>
      <span className="text-[0.65rem] font-semibold tracking-wider text-ink-muted uppercase">{weekday.format(date).replace('.', '')}</span>
      <span className="font-display text-2xl leading-none font-medium tabular">{date.getDate()}</span>
      <span className="text-[0.65rem] font-medium text-ink-muted">{month.format(date).replace('.', '')}</span>
    </span>
  );
}
