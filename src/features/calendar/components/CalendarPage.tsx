import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';
import type { CalendarEvent } from '@/lib/api/types';
import { usePermissions } from '@/features/auth/permissions';
import { addDays, iso, monthGrid, onDay, startOfWeek, weekdayNames } from '@/features/calendar/dates';
import { AvailabilityCard, BlockCard, SlotsCard } from '@/features/calendar/components/CalendarTools';
import { useCalendar, useCalendarActions } from '@/features/calendar/api/calendar';

type View = 'month' | 'week';

const monthTitle = new Intl.DateTimeFormat('da-DK', { month: 'long', year: 'numeric' });
const dayTitle = new Intl.DateTimeFormat('da-DK', { weekday: 'long', day: 'numeric', month: 'long' });
const time = new Intl.DateTimeFormat('da-DK', { hour: '2-digit', minute: '2-digit' });

const kindStyle: Record<CalendarEvent['kind'], string> = {
  Wedding: 'bg-primary text-on-primary',
  Viewing: 'bg-info-soft text-info',
  Block: 'bg-neutral-soft text-neutral bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(77_71_62/0.07)_6px_12px)]',
};

const legend: { kind: CalendarEvent['kind']; label: string }[] = [
  { kind: 'Wedding', label: 'Bryllup' },
  { kind: 'Viewing', label: 'Fremvisning' },
  { kind: 'Block', label: 'Blokeret' },
];

/**
 * The estate's calendar: weddings, viewings and blocked time. The month shows
 * where things are; the week and the chosen day show what they are.
 */
export function CalendarPage() {
  const { manages } = usePermissions();
  const [view, setView] = useState<View>('month');
  const [anchor, setAnchor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());

  const days = view === 'month' ? monthGrid(anchor) : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(anchor), i));
  const events = useCalendar(iso(days[0]), iso(days[days.length - 1]));
  const on = (day: Date) => (events.data ?? []).filter((e) => onDay(e, day));

  const step = (direction: number) => {
    const next = view === 'month' ? new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1, 12) : addDays(anchor, 7 * direction);
    setAnchor(next);
    setSelected(next);
  };
  const title = view === 'month' ? monthTitle.format(anchor) : `Uge med ${dayTitle.format(days[0])}`;

  return (
    <>
      <PageHeader eyebrow="Kalender" title={title.charAt(0).toUpperCase() + title.slice(1)} actions={
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Visning" className="flex rounded-control bg-neutral-soft p-1">
            {(['month', 'week'] as const).map((v) => (
              <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}
                className={cn('min-h-9 cursor-pointer rounded-lg px-4 text-sm font-medium transition-colors', view === v ? 'bg-surface text-ink shadow-card' : 'text-ink-muted hover:text-ink')}>
                {v === 'month' ? 'Måned' : 'Uge'}
              </button>
            ))}
          </div>
          <div className="flex items-center rounded-control ring-1 ring-line">
            <button type="button" aria-label="Forrige" onClick={() => step(-1)} className="grid size-11 cursor-pointer place-items-center rounded-l-control hover:bg-surface"><CaretLeft aria-hidden="true" className="size-4" /></button>
            <button type="button" onClick={() => { setAnchor(new Date()); setSelected(new Date()); }} className="min-h-11 cursor-pointer border-x border-line px-4 text-sm font-medium hover:bg-surface">I dag</button>
            <button type="button" aria-label="Næste" onClick={() => step(1)} className="grid size-11 cursor-pointer place-items-center rounded-r-control hover:bg-surface"><CaretRight aria-hidden="true" className="size-4" /></button>
          </div>
        </div>
      } />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] lg:items-start lg:gap-8">
        <section aria-label="Kalender" className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted" aria-live="polite">
            {legend.map((l) => (
              <span key={l.kind} className="inline-flex items-center gap-2">
                <span aria-hidden="true" className={cn('size-3 rounded ring-1 ring-ink/15', kindStyle[l.kind])} /> {l.label}
              </span>
            ))}
            {events.isFetching && <Spinner className="ml-auto" label="Henter" />}
          </div>

          {view === 'month' ? (
            <MonthGrid days={days} month={anchor.getMonth()} selected={selected} onSelect={setSelected} eventsOn={on} />
          ) : (
            <ol className="divide-y divide-line overflow-hidden rounded-card bg-surface shadow-card ring-1 ring-line/60">
              {days.map((day) => (
                <li key={iso(day)} className="px-4 py-3">
                  <DayEvents day={day} events={on(day)} />
                </li>
              ))}
            </ol>
          )}

          {view === 'month' && (
            <div className="rounded-card bg-surface p-5 shadow-card ring-1 ring-line/60">
              <DayEvents day={selected} events={on(selected)} />
            </div>
          )}
        </section>

        {manages && (
          <aside className="mt-4 space-y-4 lg:mt-0">
            <SlotsCard />
            <BlockCard />
            <AvailabilityCard />
          </aside>
        )}
      </div>
    </>
  );
}

function MonthGrid({ days, month, selected, onSelect, eventsOn }: {
  days: Date[];
  month: number;
  selected: Date;
  onSelect: (day: Date) => void;
  eventsOn: (day: Date) => CalendarEvent[];
}) {
  const today = iso(new Date());
  return (
    <div className="overflow-hidden rounded-card bg-surface shadow-card ring-1 ring-line/60">
      <div className="grid grid-cols-7 border-b border-line text-center text-[0.7rem] font-semibold tracking-wider text-ink-muted uppercase">
        {weekdayNames.map((name) => <div key={name} className={cn('py-3', name === 'Lør' && 'text-primary')}>{name}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const list = eventsOn(day);
          const isSelected = iso(day) === iso(selected);
          return (
            <button
              key={iso(day)}
              type="button"
              onClick={() => onSelect(day)}
              aria-pressed={isSelected}
              aria-label={`${dayTitle.format(day)}: ${list.length === 0 ? 'intet' : list.map((e) => e.title).join(', ')}`}
              className={cn(
                'flex min-h-16 cursor-pointer flex-col items-stretch gap-1 border-r border-b border-line p-1.5 text-left transition-colors duration-150 [&:nth-child(7n)]:border-r-0 hover:bg-canvas lg:min-h-28 lg:p-2',
                day.getDay() === 6 && 'bg-primary-soft/25',
                day.getMonth() !== month && 'text-ink-muted/50',
                isSelected && 'bg-primary-soft/70 ring-2 ring-primary/40 ring-inset',
              )}
            >
              <span className={cn('grid size-7 place-items-center self-start rounded-full font-display text-sm font-medium tabular lg:text-base', iso(day) === today && 'bg-estate text-on-estate')}>
                {day.getDate()}
              </span>
              {/* Phone: a mark per event. Desktop: the first titles. */}
              <span className="flex flex-wrap gap-0.5 lg:hidden">
                {list.slice(0, 4).map((e, i) => (
                  <span key={i} aria-hidden="true" className={cn('size-2 rounded-full', e.kind === 'Wedding' ? 'bg-primary' : e.kind === 'Viewing' ? 'bg-info' : 'bg-control')} />
                ))}
              </span>
              <span className="hidden space-y-0.5 lg:block">
                {list.slice(0, 3).map((e, i) => (
                  <span key={i} className={cn('block truncate rounded-md px-1.5 py-0.5 text-xs font-medium', kindStyle[e.kind], e.kind === 'Wedding' && !e.confirmed && 'opacity-60')}>
                    {e.title}
                  </span>
                ))}
                {list.length > 3 && <span className="block px-1 text-xs text-ink-muted">+{list.length - 3} mere</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DayEvents({ day, events }: { day: Date; events: CalendarEvent[] }) {
  const { manages } = usePermissions();
  const { unblock } = useCalendarActions();
  return (
    <div>
      <h3 className="font-display text-lg font-medium first-letter:uppercase">{dayTitle.format(day)}</h3>
      {events.length === 0 ? (
        <p className="text-sm text-ink-muted">Intet i kalenderen.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {events.map((e, i) => (
            <li key={i} className={cn('rounded-control px-3 py-2 text-sm', kindStyle[e.kind])}>
              <p className="font-medium">
                {e.bookingId ? <Link to={`/bookinger/${e.bookingId}`} className="hover:underline">{e.title}</Link> : e.title}
              </p>
              <p className="text-xs">
                {e.allDay ? 'Hele dagen' : `${time.format(new Date(e.start))}–${time.format(new Date(e.end))}`}
                {e.hostName && ` · ${e.hostName}`}
                {e.kind === 'Wedding' && (e.confirmed ? ' · Dagen er sikret' : ' · Forespørgsel')}
              </p>
              {manages && e.blockId && (
                <button type="button" className="mt-1 min-h-9 cursor-pointer text-xs font-medium underline" onClick={() => unblock.mutate(e.blockId!)}>
                  Fjern blokering
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
