import { Link, useLocation, useParams } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { BackLink } from '@/components/ui/BackLink';
import { QueryState } from '@/components/ui/QueryState';
import type { Booking } from '@/lib/api/types';
import type { ReactNode } from 'react';
import { Kanban } from '@phosphor-icons/react';
import { formatKroner, formatLongDate, relativeDays } from '@/lib/format';
import { Journey } from '@/features/bookings/components/Journey';
import { useBooking, useCreateTrelloCard } from '@/features/bookings/api/bookings';
import { Button } from '@/components/ui/Button';
import { errorMessage } from '@/lib/api/errorMessage';
import { AgreementCard } from '@/features/agreements/components/AgreementCard';
import { ReadinessCard } from '@/features/readiness/components/ReadinessCard';
import { HistoryCard } from '@/features/notes/components/HistoryCard';
import { SummaryCard } from '@/features/summaries/components/SummaryCard';
import { PaymentsCard } from '@/features/payments/components/PaymentsCard';
import { usePermissions } from '@/features/auth/permissions';
import { BookingLinesCard } from '@/features/bookings/components/BookingLinesCard';
import { BookingDetailsCard } from '@/features/bookings/components/BookingDetailsCard';
import { ContactCard } from '@/features/bookings/components/ContactCard';
import { SameDateWarning } from '@/features/bookings/components/SameDateWarning';
import { StatusBadge } from '@/features/bookings/components/StatusBadge';
import { StageCard } from '@/features/bookings/components/StageCard';
import { RequestCard } from '@/features/bookings/components/RequestCard';
import { ConfirmWeddingCard } from '@/features/bookings/components/ConfirmWeddingCard';
import { Badge } from '@/components/ui/Badge';

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
  // A viewing is not a wedding yet: no price, payments or agreement until the couple says yes.
  const isViewing = booking.kind === 'Viewing';
  const [first, second] = booking.customer.name.split(' og ');
  return (
    <div className="space-y-6">
      {sent && <Alert tone="ok">Mailen er sendt og står i historikken.</Alert>}
      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={booking.status} />
          {isViewing && <Badge tone="info">Fremvisning</Badge>}
          {booking.trelloCardId && (
            <a href={`https://trello.com/c/${booking.trelloCardId}`} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-sm font-medium text-primary hover:bg-primary-soft">
              <Kanban aria-hidden="true" className="size-4" /> Trello-kort
            </a>
          )}
          {!booking.trelloCardId && manages && !isViewing && <CreateTrelloCard id={booking.id} />}
        </div>
        <h1 className="text-5xl leading-[0.95] font-medium tracking-tight lg:text-7xl">
          <Link to={`/kunder/${booking.customer.id}`} className="decoration-line decoration-2 underline-offset-8 hover:underline">
            {first}
            {second && (
              <>
                {' '}<em className="font-normal text-ink-muted">&amp;</em> {second}
              </>
            )}
          </Link>
        </h1>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-5 sm:grid-cols-4">
          <Fact label={isViewing ? 'Ønsket dato' : 'Dato'} value={<span className="inline-block first-letter:uppercase">{formatLongDate(booking.eventDate)}</span>} small />
          <Fact label="Nedtælling" value={relativeDays(booking.eventDate)} />
          <Fact label="Gæster" value={<span className="tabular">{booking.guestCount}</span>} />
          {booking.price && booking.lines.length > 0 && <Fact label="Total" value={<span className="tabular">{formatKroner(booking.price.total)}</span>} />}
        </dl>
        <Journey status={booking.status} />
      </header>

      {manages && booking.stage === 'Requested' && <RequestCard booking={booking} />}
      <SameDateWarning bookings={booking.sameDateBookings} />

      {/* Desktop: the wedding and what it contains on the left; where it stands — money, stage, people,
          history — in a column on the right. Phone: one column, the left side first. */}
      <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-6 lg:space-y-0">
        <div className="space-y-4">
          {/* Keyed on the version, so a saved change or someone else's resets the form to what is stored. */}
          {isViewing ? (
            manages && booking.stage !== 'Requested' && booking.stage !== 'Lost' && (
              <ConfirmWeddingCard key={booking.version} booking={booking} title="Efter fremvisningen" />
            )
          ) : (
            <>
              <BookingDetailsCard key={booking.version} booking={booking} />
              <BookingLinesCard booking={booking} />
              <ReadinessCard bookingId={booking.id} />
              {seesPrices && <AgreementCard booking={booking} />}
            </>
          )}
          <SummaryCard bookingId={booking.id} />
        </div>
        <div className="space-y-4">
          {seesPrices && !isViewing && <PaymentsCard booking={booking} />}
          {manages && <StageCard booking={booking} />}
          <ContactCard customer={booking.customer} />
          <HistoryCard bookingId={booking.id} />
        </div>
      </div>
    </div>
  );
}

function CreateTrelloCard({ id }: { id: string }) {
  const create = useCreateTrelloCard(id);
  return (
    <>
      <Button size="sm" variant="ghost" loading={create.isPending} onClick={() => create.mutate()}>Opret Trello-kort</Button>
      {create.isError && <span className="text-sm text-danger">{errorMessage(create.error)}</span>}
    </>
  );
}

function Fact({ label, value, small }: { label: string; value: ReactNode; small?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow">{label}</dt>
      <dd className={small ? 'mt-1 font-medium' : 'mt-0.5 font-display text-3xl font-medium'}>{value}</dd>
    </div>
  );
}
