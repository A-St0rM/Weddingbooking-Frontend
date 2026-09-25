import { Link } from 'react-router-dom';
import { CaretRight } from '@phosphor-icons/react';
import type { BookingSummary } from '@/lib/api/types';
import { formatLongDate } from '@/lib/format';
import { StageBadge } from '@/features/bookings/components/StageBadge';

export function BookingRow({ booking }: { booking: BookingSummary }) {
  return (
    <li>
      <Link
        to={`/bookinger/${booking.id}`}
        className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-soft active:bg-neutral-soft"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{booking.customerName}</p>
          <p className="text-sm text-ink-muted first-letter:uppercase">
            {formatLongDate(booking.eventDate)} · <span className="tabular">{booking.guestCount}</span> gæster
          </p>
        </div>
        <StageBadge stage={booking.stage} />
        <CaretRight aria-hidden="true" className="size-4 shrink-0 text-ink-muted" />
      </Link>
    </li>
  );
}

export function BookingList({ bookings }: { bookings: BookingSummary[] }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-card">
      {bookings.map((booking) => (
        <BookingRow key={booking.id} booking={booking} />
      ))}
    </ul>
  );
}
