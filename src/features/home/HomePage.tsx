import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { roleLabels } from '@/lib/format';
import { useCurrentUser } from '@/features/auth/currentUser';
import { useBookings } from '@/features/bookings/api/bookings';
import { BookingList } from '@/features/bookings/components/BookingRow';
import { NewBookingLink } from '@/features/bookings/components/BookingListPage';

export function HomePage() {
  const me = useCurrentUser();
  const upcoming = useBookings();
  return (
    <>
      <PageHeader title={`Velkommen, ${me.name}`} description={roleLabels[me.role]} actions={<NewBookingLink />} />
      <QueryState query={upcoming}>
        {(bookings) => {
          const requests = bookings.filter((b) => b.status === 'Requested');
          return requests.length === 0 ? null : (
            <section className="mb-6">
              <h2 className="mb-2 text-lg font-semibold">Nye bestillinger fra hjemmesiden</h2>
              <BookingList bookings={requests} />
            </section>
          );
        }}
      </QueryState>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Kommende bryllupper</h2>
        <QueryState query={upcoming}>
          {(bookings) =>
            bookings.length === 0 ? <EmptyState title="Ingen kommende bryllupper" /> : <BookingList bookings={bookings.slice(0, 6)} />
          }
        </QueryState>
      </section>
    </>
  );
}
