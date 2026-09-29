import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from '@phosphor-icons/react';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { SearchInput } from '@/components/ui/SearchInput';
import { useDebounced } from '@/lib/hooks/useDebounced';
import type { BookingSummary, DisplayStatus } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { useBookings } from '@/features/bookings/api/bookings';
import { usePermissions } from '@/features/auth/permissions';
import { BookingList, BookingTable } from '@/features/bookings/components/BookingRow';

const monthYear = new Intl.DateTimeFormat('da-DK', { month: 'long', year: 'numeric' });

function byMonth(bookings: BookingSummary[]) {
  const groups = new Map<string, BookingSummary[]>();
  for (const booking of bookings) {
    const key = booking.eventDate.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), booking]);
  }
  return [...groups].map(([key, items]) => ({
    label: monthYear.format(new Date(`${key}-15T12:00:00`)),
    items,
  }));
}

/** Where a case stands, in the words the office uses. Closed cases only show with "Vis også". */
const phases: { key: string; label: string; statuses: DisplayStatus[] }[] = [
  { key: 'new', label: 'Nye', statuses: ['Requested'] },
  { key: 'sales', label: 'I salg', statuses: ['Inquiry', 'Viewing', 'QuoteSent'] },
  {
    key: 'confirmed',
    label: 'Bekræftet',
    statuses: ['Signed', 'DateSecured', 'ReadyForEvent', 'PaymentOverdue'],
  },
  { key: 'after', label: 'Efter festen', statuses: ['Held', 'AwaitingPostEventInvoice'] },
  { key: 'closed', label: 'Lukket', statuses: ['Cancelled', 'Lost'] },
];

export function NewBookingLink() {
  const { manages } = usePermissions();
  if (!manages) return null;
  return (
    <Link
      to="/bookinger/ny"
      className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 font-medium text-on-primary hover:bg-primary-hover"
    >
      <Plus aria-hidden="true" weight="bold" className="size-4" />
      Ny booking
    </Link>
  );
}

export function BookingListPage() {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [phase, setPhase] = useState<string>();
  const term = useDebounced(search.trim());
  const query = useBookings({
    search: term || undefined,
    includePast: showAll,
    includeClosed: showAll,
  });

  return (
    <>
      <PageHeader
        title="Bookinger"
        description="Alle sager fra første forespørgsel til efterfakturaen."
        actions={<NewBookingLink />}
      />
      <div className="space-y-3 lg:flex lg:items-center lg:gap-6 lg:space-y-0">
        <div className="lg:w-96">
          <SearchInput label="Søg på parrets navn" value={search} onChange={setSearch} />
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="size-5 accent-primary"
          />
          Vis også afholdte, afbestilte og tabte
        </label>
      </div>

      <div className="mt-4">
        <QueryState query={query}>
          {(all) => {
            const counts = phases.map((p) => ({
              ...p,
              count: all.filter((b) => p.statuses.includes(b.status)).length,
            }));
            const chosen = phases.find((p) => p.key === phase);
            const bookings = chosen ? all.filter((b) => chosen.statuses.includes(b.status)) : all;
            return (
              <>
                <div role="group" aria-label="Vis sager" className="mb-4 flex flex-wrap gap-2">
                  <Chip
                    active={!chosen}
                    onClick={() => setPhase(undefined)}
                    label="Alle"
                    count={all.length}
                  />
                  {counts
                    .filter((p) => p.count > 0 || p.key === phase)
                    .map((p) => (
                      <Chip
                        key={p.key}
                        active={phase === p.key}
                        onClick={() => setPhase(phase === p.key ? undefined : p.key)}
                        label={p.label}
                        count={p.count}
                      />
                    ))}
                </div>
                {bookings.length === 0 ? (
                  <EmptyState
                    title={term ? `Ingen bookinger matcher "${term}"` : 'Ingen kommende bookinger'}
                    action={<NewBookingLink />}
                  />
                ) : (
                  <>
                    <div className="hidden lg:block">
                      <BookingTable bookings={bookings} />
                    </div>
                    <div className="space-y-6 lg:hidden">
                      {byMonth(bookings).map((group) => (
                        <section key={group.label}>
                          <h2 className="eyebrow mb-3 font-sans first-letter:uppercase">
                            {group.label}
                          </h2>
                          <BookingList bookings={group.items} />
                        </section>
                      ))}
                    </div>
                  </>
                )}
              </>
            );
          }}
        </QueryState>
      </div>
    </>
  );
}

function Chip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium ring-1 transition-colors duration-200',
        active
          ? 'bg-primary text-on-primary ring-primary'
          : 'bg-surface text-ink ring-line hover:ring-control',
      )}
    >
      {label}
      <span className={cn('tabular', active ? 'text-on-primary/70' : 'text-ink-muted')}>
        {count}
      </span>
    </button>
  );
}
