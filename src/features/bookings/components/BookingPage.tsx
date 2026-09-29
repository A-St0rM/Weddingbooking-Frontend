import { Link, useParams } from 'react-router-dom';
import { BackLink } from '@/components/ui/BackLink';
import { QueryState } from '@/components/ui/QueryState';
import type { Booking } from '@/lib/api/types';
import { formatLongDate } from '@/lib/format';
import { useBooking } from '@/features/bookings/api/bookings';
import { BookingDetailsCard } from '@/features/bookings/components/BookingDetailsCard';
import { ContactCard } from '@/features/bookings/components/ContactCard';
import { SameDateWarning } from '@/features/bookings/components/SameDateWarning';
import { StageBadge } from '@/features/bookings/components/StageBadge';
import { StageCard } from '@/features/bookings/components/StageCard';

export function BookingPage() {
  const { id = '' } = useParams();
  const query = useBooking(id);
  return (
    <>
      <BackLink to="/bookinger">Bookinger</BackLink>
      <QueryState query={query}>{(booking) => <BookingView booking={booking} />}</QueryState>
    </>
  );
}

function BookingView({ booking }: { booking: Booking }) {
  return (
    <div className="space-y-4">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <StageBadge stage={booking.stage} />
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance">
          <Link to={`/kunder/${booking.customer.id}`} className="hover:underline">
            {booking.customer.name}
          </Link>
        </h1>
        <p className="text-ink-muted first-letter:uppercase">
          {formatLongDate(booking.eventDate)} · <span className="tabular">{booking.guestCount}</span> gæster
        </p>
      </header>

      <SameDateWarning bookings={booking.sameDateBookings} />

      {/* Keyed on the version, so a saved change or someone else's resets the form to what is stored. */}
      <BookingDetailsCard key={booking.version} booking={booking} />
      <StageCard booking={booking} />
      <ContactCard customer={booking.customer} />
    </div>
  );
}
