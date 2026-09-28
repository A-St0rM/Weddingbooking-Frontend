import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tray } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { errorMessage } from '@/lib/api/errorMessage';
import type { Booking } from '@/lib/api/types';
import { formatDateTime, formatLongDate } from '@/lib/format';
import { useRequestDecision } from '@/features/bookings/api/bookings';

/**
 * A request from the website waits for a person. Accepting books the viewing (or takes the date
 * request on as an inquiry); declining frees the time. Neither sends a mail — the confirmation
 * is written and sent under Skriv mail.
 */
export function RequestCard({ booking }: { booking: Booking }) {
  const { accept, decline } = useRequestDecision(booking.id);
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const isViewing = Boolean(booking.viewingAt);

  return (
    <div className="rounded-card border border-warn/40 bg-warn-soft p-4">
      <div className="flex items-start gap-3">
        <Tray aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-warn" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold text-warn">Ny bestilling fra hjemmesiden</p>
          <p className="mt-1">
            {isViewing
              ? <>Parret vil gerne se godset <strong>{formatDateTime(booking.viewingAt!)}</strong>{booking.viewingHost && ` med ${booking.viewingHost.name}`}. Tiden er holdt, til du har taget stilling.</>
              : <>Parret vil gerne holde brylluppet <strong>{formatLongDate(booking.eventDate)}</strong>. Datoen er holdt i 14 dage, til du har taget stilling.</>}
          </p>
          <p className="mt-1 text-ink-muted">Intet er sendt til parret. Bekræftelsen skriver du under <Link to={`/bookinger/${booking.id}/mail`} className="underline">Skriv mail</Link>.</p>
        </div>
      </div>

      {declining ? (
        <div className="mt-3 space-y-3">
          <TextArea label="Hvorfor? (kommer i historikken)" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button variant="danger" size="sm" loading={decline.isPending} onClick={() => decline.mutate(reason)}>Afvis bestillingen</Button>
            <Button variant="ghost" size="sm" onClick={() => setDeclining(false)}>Annullér</Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" loading={accept.isPending} onClick={() => accept.mutate()}>
            {isViewing ? 'Bekræft fremvisningen' : 'Tag imod forespørgslen'}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setDeclining(true)}>Afvis</Button>
        </div>
      )}
      {(accept.isError || decline.isError) && <Alert tone="danger" className="mt-3">{errorMessage(accept.error ?? decline.error)}</Alert>}
    </div>
  );
}
