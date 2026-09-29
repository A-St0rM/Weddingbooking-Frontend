import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Segmented } from '@/components/ui/Segmented';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { errorMessage } from '@/lib/api/errorMessage';
import type { Booking, PaymentTerms } from '@/lib/api/types';
import { termsDescriptions, termsLabels } from '@/lib/labels';
import { useRequestDecision } from '@/features/bookings/api/bookings';

/**
 * The couple's answer after a viewing — or to a date request. Yes makes the case a wedding on the
 * same row: same customer, same two people, same history. No closes it as lost, with the reason.
 */
export function ConfirmWeddingCard({ booking, title }: { booking: Booking; title: string }) {
  const { confirmAsWedding, decline } = useRequestDecision(booking.id);
  const [answer, setAnswer] = useState<'yes' | 'no'>('yes');
  const [eventDate, setEventDate] = useState(booking.eventDate);
  const [guests, setGuests] = useState(String(booking.guestCount));
  const [terms, setTerms] = useState<PaymentTerms>(booking.paymentTerms);
  const [payerId, setPayerId] = useState(booking.customer.contacts.find((c) => c.isPayer)?.id ?? booking.customer.contacts[0]?.id ?? '');
  const [reason, setReason] = useState('');
  const guestCount = Number.parseInt(guests, 10);
  const valid = Boolean(eventDate) && guestCount >= 1 && guestCount <= 350 && Boolean(payerId);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (answer === 'no') decline.mutate(reason);
    else if (valid) confirmAsWedding.mutate({ eventDate, guestCount, paymentTerms: terms, payerId });
  }

  return (
    <Card className="border-primary/40">
      <h2 className="text-xl font-medium">{title}</h2>
      <form onSubmit={submit} className="mt-3 space-y-4">
        <Segmented label="Hvad siger parret?" value={answer} onChange={setAnswer} options={[{ value: 'yes', label: 'Ja — book brylluppet' }, { value: 'no', label: 'Nej tak' }]} />
        {answer === 'yes' ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bryllupsdato" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
              <Field label="Gæsteantal" type="number" inputMode="numeric" min={1} max={350} value={guests} onChange={(e) => setGuests(e.target.value)} required />
            </div>
            <Segmented
              label="Betalingsbetingelser"
              value={terms}
              onChange={setTerms}
              options={[{ value: 'New', label: termsLabels.New }, { value: 'Old', label: termsLabels.Old }]}
              hint={termsDescriptions[terms]}
            />
            <Select
              label="Hvem betaler?"
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
              options={booking.customer.contacts.map((c) => ({ value: c.id, label: c.fullName }))}
              hint="Betaleren står på tilbud og faktura."
            />
            <Button type="submit" loading={confirmAsWedding.isPending} disabled={!valid}>Bekræft som booking</Button>
          </>
        ) : (
          <>
            <TextArea label="Hvorfor? (kommer i historikken)" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
            <Button type="submit" variant="danger" loading={decline.isPending}>Luk sagen som tabt</Button>
          </>
        )}
        {(confirmAsWedding.isError || decline.isError) && <Alert tone="danger">{errorMessage(confirmAsWedding.error ?? decline.error)}</Alert>}
      </form>
    </Card>
  );
}
