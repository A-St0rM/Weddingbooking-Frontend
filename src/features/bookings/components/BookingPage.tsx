import { Link, useLocation, useParams } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { BackLink } from '@/components/ui/BackLink';
import { QueryState } from '@/components/ui/QueryState';
import type { Booking } from '@/lib/api/types';
import { formatKroner, formatLongDate } from '@/lib/format';
import { useBooking } from '@/features/bookings/api/bookings';
import { AgreementCard } from '@/features/agreements/components/AgreementCard';
import { ReadinessCard } from '@/features/readiness/components/ReadinessCard';
import { HistoryCard } from '@/features/notes/components/HistoryCard';
import { PaymentsCard } from '@/features/payments/components/PaymentsCard';
import { usePermissions } from '@/features/auth/permissions';
import { BookingLinesCard } from '@/features/bookings/components/BookingLinesCard';
import { BookingDetailsCard } from '@/features/bookings/components/BookingDetailsCard';
import { ContactCard } from '@/features/bookings/components/ContactCard';
import { SameDateWarning } from '@/features/bookings/components/SameDateWarning';
import { StatusBadge } from '@/features/bookings/components/StatusBadge';
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
  const { seesPrices, manages } = usePermissions();
  const sent = (useLocation().state as { sent?: boolean } | null)?.sent;
  return (
    <div className="space-y-4">
      {sent && <Alert tone="ok">Mailen er sendt og står i historikken.</Alert>}
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={booking.status} />
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance">
          <Link to={`/kunder/${booking.customer.id}`} className="hover:underline">
            {booking.customer.name}
          </Link>
        </h1>
        <p className="text-ink-muted first-letter:uppercase">
          {formatLongDate(booking.eventDate)} · <span className="tabular">{booking.guestCount}</span> gæster
          {booking.price && booking.lines.length > 0 && <> · <span className="tabular">{formatKroner(booking.price.total)}</span></>}
        </p>
      </header>

      <SameDateWarning bookings={booking.sameDateBookings} />

      {/* Keyed on the version, so a saved change or someone else's resets the form to what is stored. */}
      <BookingDetailsCard key={booking.version} booking={booking} />
      <BookingLinesCard booking={booking} />
      <ReadinessCard bookingId={booking.id} />
      {seesPrices && <PaymentsCard booking={booking} />}
      {seesPrices && <AgreementCard booking={booking} />}
      {manages && <StageCard booking={booking} />}
      <ContactCard customer={booking.customer} />
      <HistoryCard bookingId={booking.id} />
    </div>
  );
}
