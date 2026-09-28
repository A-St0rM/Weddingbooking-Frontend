import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CaretDown, CaretRight, CaretUp } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';
import type { BookingSummary, DisplayStatus } from '@/lib/api/types';
import { formatLongDate } from '@/lib/format';
import { StatusBadge } from '@/features/bookings/components/StatusBadge';

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
        <StatusBadge status={booking.status} />
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

type SortKey = 'eventDate' | 'customerName' | 'guestCount' | 'status';

// Most pressing first, the same order the API uses to pick the one word.
const statusOrder: DisplayStatus[] = [
  'Requested', 'PaymentOverdue', 'AwaitingPostEventInvoice', 'ReadyForEvent', 'DateSecured', 'Signed', 'QuoteSent', 'Viewing', 'Inquiry', 'Held', 'Cancelled', 'Lost',
];

const compare: Record<SortKey, (a: BookingSummary, b: BookingSummary) => number> = {
  eventDate: (a, b) => a.eventDate.localeCompare(b.eventDate),
  customerName: (a, b) => a.customerName.localeCompare(b.customerName, 'da'),
  guestCount: (a, b) => a.guestCount - b.guestCount,
  status: (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status),
};

const columns: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'eventDate', label: 'Dato' },
  { key: 'customerName', label: 'Par' },
  { key: 'guestCount', label: 'Gæster', numeric: true },
  { key: 'status', label: 'Status' },
];

/** The desktop list: a table sorted by a click on a column heading. The couple's name is the link, so Tab reaches every row. */
export function BookingTable({ bookings }: { bookings: BookingSummary[] }) {
  const navigate = useNavigate();
  const [sort, setSort] = useState<{ key: SortKey; ascending: boolean }>({ key: 'eventDate', ascending: true });
  const rows = [...bookings].sort((a, b) => compare[sort.key](a, b) * (sort.ascending ? 1 : -1));

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-neutral-soft text-sm text-ink-muted">
          <tr>
            {columns.map((column) => {
              const active = sort.key === column.key;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={active ? (sort.ascending ? 'ascending' : 'descending') : 'none'}
                  className={cn('px-4 py-2 font-medium', column.numeric && 'text-right')}
                >
                  <button
                    type="button"
                    onClick={() => setSort({ key: column.key, ascending: active ? !sort.ascending : true })}
                    className={cn('inline-flex min-h-9 cursor-pointer items-center gap-1 rounded hover:text-ink', active && 'text-ink')}
                  >
                    {column.label}
                    {active && (sort.ascending ? <CaretUp aria-hidden="true" className="size-3.5" /> : <CaretDown aria-hidden="true" className="size-3.5" />)}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((booking) => (
            <tr
              key={booking.id}
              onClick={() => navigate(`/bookinger/${booking.id}`)}
              className="cursor-pointer transition-colors hover:bg-neutral-soft"
            >
              <td className="px-4 py-3 whitespace-nowrap first-letter:uppercase">{formatLongDate(booking.eventDate)}</td>
              <td className="px-4 py-3 font-medium">
                <Link to={`/bookinger/${booking.id}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                  {booking.customerName}
                </Link>
              </td>
              <td className="px-4 py-3 text-right tabular">{booking.guestCount}</td>
              <td className="px-4 py-3">
                <StatusBadge status={booking.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
