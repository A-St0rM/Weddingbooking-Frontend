import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import type { BookingSummary } from '@/lib/api/types';
import { formatLongDate } from '@/lib/format';

/** A second booking on a date is allowed — it may be a viewing or a lost cause — but never unnoticed. */
export function SameDateWarning({ bookings }: { bookings: BookingSummary[] }) {
  if (bookings.length === 0) return null;
  return (
    <Alert tone="warn" title={`Der er allerede ${bookings.length === 1 ? 'en booking' : `${bookings.length} bookinger`} ${formatLongDate(bookings[0].eventDate)}`}>
      <ul className="space-y-1">
        {bookings.map((booking) => (
          <li key={booking.id}>
            <Link to={`/bookinger/${booking.id}`} className="font-medium underline">
              {booking.customerName}
            </Link>{' '}
            · {booking.guestCount} gæster
          </li>
        ))}
      </ul>
      <p className="mt-1">Du kan godt gemme alligevel.</p>
    </Alert>
  );
}
