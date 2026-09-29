import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Segmented } from '@/components/ui/Segmented';
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
  Wedding: 'bg-primary-soft text-primary',
  Viewing: 'bg-info-soft text-info',
  Block: 'bg-neutral-soft text-neutral',
};

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
      <PageHeader title="Kalender" />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start lg:gap-6">
        <section aria-label="Kalender" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-48">
              <Segmented label="Visning" value={view} onChange={setView} options={[{ value: 'month', label: 'Måned' }, { value: 'week', label: 'Uge' }]} />
            </div>
            <div className="ml-auto flex items-center gap-1 self-end">
              <Button size="sm" variant="ghost" aria-label="Forrige" onClick={() => step(-1)}><CaretLeft aria-hidden="true" className="size-5" /></Button>
              <Button size="sm" variant="secondary" onClick={() => { setAnchor(new Date()); setSelected(new Date()); }}>I dag</Button>
              <Button size="sm" variant="ghost" aria-label="Næste" onClick={() => step(1)}><CaretRight aria-hidden="true" className="size-5" /></Button>
            </div>
          </div>
          <h2 className="text-lg font-semibold first-letter:uppercase" aria-live="polite">
            {title} {events.isFetching && <Spinner className="ml-2 align-middle" />}
          </h2>

          {view === 'month' ? (
            <MonthGrid days={days} month={anchor.getMonth()} selected={selected} onSelect={setSelected} eventsOn={on} />
          ) : (
            <ol className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-card">
              {days.map((day) => (
                <li key={iso(day)} className="px-4 py-3">
                  <DayEvents day={day} events={on(day)} />
                </li>
              ))}
            </ol>
          )}

          {view === 'month' && (
            <div className="rounded-card border border-line bg-surface p-4 shadow-card">
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
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className="grid grid-cols-7 border-b border-line bg-neutral-soft text-center text-xs font-medium text-ink-muted">
        {weekdayNames.map((name) => <div key={name} className="py-2">{name}</div>)}
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
                'flex min-h-14 cursor-pointer flex-col items-stretch gap-0.5 border-r border-b border-line p-1 text-left last:border-r-0 hover:bg-neutral-soft lg:min-h-24',
                day.getMonth() !== month && 'text-ink-muted/60',
                isSelected && 'bg-primary-soft/60',
              )}
            >
              <span className={cn('self-start rounded px-1 text-xs font-medium tabular', iso(day) === today && 'bg-primary text-on-primary')}>
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
                  <span key={i} className={cn('block truncate rounded px-1 text-xs', kindStyle[e.kind], e.kind === 'Wedding' && !e.confirmed && 'opacity-70')}>
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
      <h3 className="font-semibold first-letter:uppercase">{dayTitle.format(day)}</h3>
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
