import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, CaretLeft, CaretRight, CheckCircle, Envelope, Receipt, Warning } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/QueryState';
import { Sprig } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import type { BookingSummary, DisplayStatus } from '@/lib/api/types';
import { daysUntil, formatLongDate, relativeDays } from '@/lib/format';
import { statusLabels, statusTones } from '@/lib/labels';
import type { Tone } from '@/components/ui/Badge';
import { useCurrentUser } from '@/features/auth/currentUser';
import { usePermissions } from '@/features/auth/permissions';
import { useBookings } from '@/features/bookings/api/bookings';
import { BookingList } from '@/features/bookings/components/BookingRow';
import { NewBookingLink } from '@/features/bookings/components/BookingListPage';
import { useCalendar } from '@/features/calendar/api/calendar';
import { addDays, iso } from '@/features/calendar/dates';

const today = new Intl.DateTimeFormat('da-DK', { weekday: 'long', day: 'numeric', month: 'long' });
const weekday = new Intl.DateTimeFormat('da-DK', { weekday: 'short' });
const time = new Intl.DateTimeFormat('da-DK', { hour: '2-digit', minute: '2-digit' });
const monthName = new Intl.DateTimeFormat('da-DK', { month: 'long' });

function greeting(hour: number) {
  if (hour < 10) return 'Godmorgen';
  if (hour < 18) return 'God dag';
  return 'God aften';
}

/** What each status asks of someone, most pressing first. Statuses that ask nothing are left out. */
const asks: { status: DisplayStatus; verb: string; icon: Icon; tone: string }[] = [
  { status: 'Requested', verb: 'Svar parret', icon: Envelope, tone: 'text-warn bg-warn-soft' },
  { status: 'PaymentOverdue', verb: 'Følg op på betalingen', icon: Warning, tone: 'text-danger bg-danger-soft' },
  { status: 'AwaitingPostEventInvoice', verb: 'Send efterfakturaen', icon: Receipt, tone: 'text-warn bg-warn-soft' },
  { status: 'Viewing', verb: 'Forbered fremvisningen', icon: CalendarCheck, tone: 'text-info bg-info-soft' },
  { status: 'Inquiry', verb: 'Send et tilbud', icon: ArrowRight, tone: 'text-neutral bg-neutral-soft' },
];

// A wedding is going ahead once the agreement is signed.
const confirmed: DisplayStatus[] = ['Signed', 'DateSecured', 'ReadyForEvent', 'PaymentOverdue'];

/**
 * The first thing in the morning: the next wedding, what needs doing, the week, and which
 * Saturdays of the season are still free. Everything is read from the bookings and the calendar.
 */
export function HomePage() {
  const me = useCurrentUser();
  const now = new Date();
  // Past weddings too: one awaiting its final invoice is still work.
  const bookings = useBookings({ includePast: true });

  return (
    <>
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2 first-letter:uppercase">{today.format(now)}</p>
          <h1 className="text-4xl leading-[1.05] font-medium tracking-tight lg:text-6xl">
            {greeting(now.getHours())}, <em className="font-normal">{me.name.split(' ')[0]}</em>
          </h1>
        </div>
        <NewBookingLink />
      </header>

      {bookings.isPending ? (
        <Skeleton rows={3} />
      ) : bookings.isError ? null : (
        <Overview bookings={bookings.data} />
      )}
    </>
  );
}

function Overview({ bookings }: { bookings: BookingSummary[] }) {
  const upcoming = bookings.filter((b) => daysUntil(b.eventDate) >= 0);
  const next = upcoming.find((b) => confirmed.includes(b.status)) ?? upcoming[0];
  const todo = asks.flatMap((ask) => bookings.filter((b) => b.status === ask.status).map((booking) => ({ ...ask, booking })));

  return (
    <div className="stagger space-y-10">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {next ? <NextWedding booking={next} /> : <NoWeddings />}
        <ToDo items={todo} />
      </div>
      <ThisWeek />
      <Season bookings={bookings} />
      {upcoming.length > 0 && (
        <section>
          <SectionTitle title="Kommende" link={{ to: '/bookinger', label: 'Alle bookinger' }} />
          <BookingList bookings={upcoming.slice(0, 6)} />
        </section>
      )}
    </div>
  );
}

function SectionTitle({ title, link, children }: { title: string; link?: { to: string; label: string }; children?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <h2 className="text-2xl font-medium">{title}</h2>
      {children}
      {link && (
        <Link to={link.to} className="group inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary">
          {link.label}
          <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

function NextWedding({ booking }: { booking: BookingSummary }) {
  const days = daysUntil(booking.eventDate);
  const [first, second] = booking.customerName.split(' og ');
  return (
    <Link
      to={`/bookinger/${booking.id}`}
      className="group relative isolate flex min-h-80 flex-col justify-between overflow-hidden rounded-card bg-estate p-7 text-on-estate shadow-lift lg:p-9"
    >
      {/* A garden drawn large behind the names, and a lamp-glow in one corner. */}
      <Sprig className="absolute -right-10 -bottom-12 -z-10 size-80 text-on-estate/[0.07] transition-transform duration-700 ease-out group-hover:scale-105 group-hover:-rotate-3" />
      <div aria-hidden="true" className="absolute -top-32 -left-24 -z-10 size-96 rounded-full bg-[radial-gradient(circle,rgb(169_181_163/0.22),transparent_60%)]" />

      <div className="flex items-start justify-between gap-4">
        <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-on-estate-muted uppercase">Næste bryllup</p>
        <span className="rounded-md bg-on-estate/10 px-2 py-1 text-xs font-medium">{statusLabels[booking.status]}</span>
      </div>

      <div>
        <p className="font-display text-5xl leading-[0.95] font-medium tracking-tight text-balance lg:text-7xl">
          {first}
          {second && (
            <>
              {' '}<em className="font-normal text-on-estate-muted">&amp;</em> {second}
            </>
          )}
        </p>
        <p className="mt-4 text-on-estate-muted first-letter:uppercase">
          {formatLongDate(booking.eventDate)} · <span className="tabular">{booking.guestCount}</span> gæster
        </p>
      </div>

      <div className="flex items-end justify-between gap-4">
        <p>
          <span className="font-display text-6xl leading-none font-medium tabular lg:text-7xl">{days}</span>
          <span className="ml-2 text-on-estate-muted">{days === 1 ? 'dag tilbage' : 'dage tilbage'}</span>
        </p>
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          Åbn sagen
          <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function NoWeddings() {
  return (
    <div className="grid min-h-80 place-items-center rounded-card bg-estate p-8 text-center text-on-estate">
      <div>
        <Sprig className="mx-auto mb-4 size-14 text-on-estate-muted" />
        <p className="font-display text-3xl font-medium">Ingen bryllupper i kalenderen</p>
        <p className="mt-2 text-on-estate-muted">Nye bestillinger fra hjemmesiden lander her.</p>
      </div>
    </div>
  );
}

function ToDo({ items }: { items: ((typeof asks)[number] & { booking: BookingSummary })[] }) {
  return (
    <Card className="flex flex-col p-0 sm:p-0">
      <div className="flex items-baseline justify-between px-6 pt-6 pb-3">
        <h2 className="text-2xl font-medium">Kræver handling</h2>
        {items.length > 0 && <span className="font-display text-2xl text-ink-muted tabular">{items.length}</span>}
      </div>
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8 text-center">
          <CheckCircle aria-hidden="true" weight="duotone" className="mb-2 size-10 text-ok" />
          <p className="font-medium">Intet haster</p>
          <p className="text-sm text-ink-muted">Alle sager venter på parret eller på datoen.</p>
        </div>
      ) : (
        <ul className="max-h-[22rem] flex-1 divide-y divide-line overflow-y-auto px-2 pb-2">
          {items.map(({ booking, verb, icon: ItemIcon, tone, status }) => (
            <li key={booking.id}>
              <Link to={`/bookinger/${booking.id}`} className="group flex items-center gap-3 rounded-control px-4 py-3 transition-colors hover:bg-canvas">
                <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', tone)}>
                  <ItemIcon aria-hidden="true" weight="bold" className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{verb}</span>
                  <span className="block truncate text-sm text-ink-muted">
                    {booking.customerName} · {statusLabels[status].toLowerCase()} · {relativeDays(booking.eventDate)}
                  </span>
                </span>
                <CaretRight aria-hidden="true" className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/** Seven days from today, as columns: weddings, viewings and blocked time. */
function ThisWeek() {
  const start = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const events = useCalendar(iso(days[0]), iso(days[6]));
  const eventsOn = (day: Date) =>
    (events.data ?? []).filter((e) => {
      const from = new Date(e.start);
      const to = new Date(e.end);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      return from < addDays(dayStart, 1) && to > dayStart;
    });

  return (
    <section>
      <SectionTitle title="De næste syv dage" link={{ to: '/kalender', label: 'Kalenderen' }} />
      <ol className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-7">
        {days.map((day, i) => {
          const list = eventsOn(day);
          return (
            // Phone: only days with something on, and today. Desktop: the whole week as columns.
            <li key={i} className={cn('rounded-card p-3 ring-1 sm:min-h-32', i === 0 ? 'bg-surface ring-primary/40 shadow-card' : 'bg-surface/60 ring-line', list.length === 0 && i !== 0 && 'hidden sm:block')}>
              <p className="flex items-baseline gap-2 sm:block">
                <span className="eyebrow">{i === 0 ? 'I dag' : weekday.format(day).replace('.', '')}</span>
                <span className="font-display text-2xl font-medium tabular sm:block">{day.getDate()}</span>
              </p>
              <ul className="mt-2 space-y-1.5">
                {list.length === 0 && <li className="text-xs text-ink-muted/70">—</li>}
                {list.map((e, j) => {
                  const label = (
                    <>
                      {!e.allDay && <span className="block text-[0.7rem] opacity-80 tabular">{time.format(new Date(e.start))}</span>}
                      <span className="line-clamp-2">{e.title}</span>
                    </>
                  );
                  const style = cn(
                    'block rounded-lg px-2 py-1.5 text-xs font-medium',
                    e.kind === 'Wedding' ? 'bg-primary text-on-primary' : e.kind === 'Viewing' ? 'bg-info-soft text-info' : 'bg-neutral-soft text-neutral',
                  );
                  return (
                    <li key={j}>
                      {e.bookingId ? <Link to={`/bookinger/${e.bookingId}`} className={cn(style, 'hover:brightness-95')}>{label}</Link> : <span className={style}>{label}</span>}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const dotTones: Record<Tone, string> = { ok: 'bg-ok', warn: 'bg-warn', danger: 'bg-danger', info: 'bg-info', neutral: 'bg-control', primary: 'bg-primary' };

/** The months the estate holds weddings in. The same season the API offers dates from. */
const seasonMonths = [4, 5, 7, 8];

function saturdays(year: number) {
  return seasonMonths.map((month) => {
    const days: Date[] = [];
    for (let d = new Date(year, month, 1, 12); d.getMonth() === month; d = addDays(d, 1)) if (d.getDay() === 6) days.push(d);
    return { month, days };
  });
}

/** Every Saturday of a season: taken ones name the couple, free ones start a booking. */
function Season({ bookings }: { bookings: BookingSummary[] }) {
  const now = new Date();
  const { manages } = usePermissions();
  const [year, setYear] = useState(now.getMonth() >= 8 ? now.getFullYear() + 1 : now.getFullYear());
  const byDate = new Map<string, BookingSummary[]>();
  for (const b of bookings) byDate.set(b.eventDate, [...(byDate.get(b.eventDate) ?? []), b]);
  const months = saturdays(year);
  const all = months.flatMap((m) => m.days);
  const taken = all.filter((d) => byDate.get(iso(d))?.some((b) => confirmed.includes(b.status))).length;

  return (
    <section>
      <SectionTitle title={`Sæsonen ${year}`}>
        <div className="flex items-center gap-4">
          <p className="text-sm text-ink-muted">
            <span className="font-display text-lg text-ink tabular">{taken}</span> af <span className="tabular">{all.length}</span> lørdage er sikret
          </p>
          <div className="flex rounded-control ring-1 ring-line">
            <button type="button" aria-label="Forrige sæson" onClick={() => setYear(year - 1)} className="grid size-10 cursor-pointer place-items-center rounded-l-control hover:bg-surface">
              <CaretLeft aria-hidden="true" className="size-4" />
            </button>
            <button type="button" aria-label="Næste sæson" onClick={() => setYear(year + 1)} className="grid size-10 cursor-pointer place-items-center rounded-r-control border-l border-line hover:bg-surface">
              <CaretRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      </SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {months.map(({ month, days }) => (
          <div key={month} className="rounded-card bg-surface p-4 shadow-card ring-1 ring-line/60">
            <h3 className="mb-3 font-display text-lg font-medium first-letter:uppercase">{monthName.format(new Date(year, month, 1))}</h3>
            <ul className="space-y-1.5">
              {days.map((day) => {
                const date = iso(day);
                const here = byDate.get(date) ?? [];
                const past = daysUntil(date) < 0;
                return (
                  <li key={date}>
                    {here.length > 0 ? (
                      <Link to={`/bookinger/${here[0].id}`} className="group flex items-center gap-3 rounded-lg bg-canvas px-2.5 py-2 transition-colors hover:bg-primary-soft">
                        <span className="w-7 font-display text-lg font-medium tabular">{day.getDate()}</span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {here[0].customerName}
                          {here.length > 1 && <span className="text-ink-muted"> +{here.length - 1}</span>}
                        </span>
                        <span title={statusLabels[here[0].status]} className={cn('size-2 shrink-0 rounded-full', dotTones[statusTones[here[0].status]])} />
                        <span className="sr-only">{statusLabels[here[0].status]}</span>
                      </Link>
                    ) : past || !manages ? (
                      <span className="flex items-center gap-3 px-2.5 py-2 text-sm text-ink-muted">
                        <span className="w-7 font-display text-lg tabular">{day.getDate()}</span>
                        {past ? '—' : 'Ledig'}
                      </span>
                    ) : (
                      <Link
                        to={`/bookinger/ny?dato=${date}`}
                        className="group flex items-center gap-3 rounded-lg border border-dashed border-line px-2.5 py-2 text-sm text-ink-muted transition-colors hover:border-primary/50 hover:bg-primary-soft/50 hover:text-primary"
                      >
                        <span className="w-7 font-display text-lg tabular text-ink">{day.getDate()}</span>
                        <span className="flex-1">Ledig</span>
                        <span className="text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">Book</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
