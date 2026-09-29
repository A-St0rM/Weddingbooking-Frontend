import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from '@phosphor-icons/react';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { SearchInput } from '@/components/ui/SearchInput';
import { useDebounced } from '@/lib/hooks/useDebounced';
import type { BookingSummary } from '@/lib/api/types';
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
  return [...groups].map(([key, items]) => ({ label: monthYear.format(new Date(`${key}-15T12:00:00`)), items }));
}

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
  const term = useDebounced(search.trim());
  const query = useBookings({ search: term || undefined, includePast: showAll, includeClosed: showAll });

  return (
    <>
      <PageHeader title="Bookinger" actions={<NewBookingLink />} />
      <div className="space-y-3 lg:flex lg:items-center lg:gap-6 lg:space-y-0">
        <div className="lg:w-96">
          <SearchInput label="Søg på parrets navn" value={search} onChange={setSearch} />
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="size-5 accent-primary" />
          Vis også afholdte, afbestilte og tabte
        </label>
      </div>

      <div className="mt-4">
        <QueryState query={query}>
          {(bookings) =>
            bookings.length === 0 ? (
              <EmptyState title={term ? `Ingen bookinger matcher "${term}"` : 'Ingen kommende bookinger'} action={<NewBookingLink />} />
            ) : (
              <>
                <div className="hidden lg:block">
                  <BookingTable bookings={bookings} />
                </div>
                <div className="space-y-6 lg:hidden">
                  {byMonth(bookings).map((group) => (
                    <section key={group.label}>
                      <h2 className="mb-2 text-sm font-semibold text-ink-muted first-letter:uppercase">{group.label}</h2>
                      <BookingList bookings={group.items} />
                    </section>
                  ))}
                </div>
              </>
            )
          }
        </QueryState>
      </div>
    </>
  );
}
