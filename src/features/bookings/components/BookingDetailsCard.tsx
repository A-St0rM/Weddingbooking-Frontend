import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Segmented } from '@/components/ui/Segmented';
import { errorMessage, isConflict } from '@/lib/api/errorMessage';
import type { Booking, PaymentTerms } from '@/lib/api/types';
import { termsDescriptions, termsLabels } from '@/lib/labels';
import { formatLongDate } from '@/lib/format';
import { bookingKeys, useUpdateBooking } from '@/features/bookings/api/bookings';
import { usePermissions } from '@/features/auth/permissions';

/** Date, guest count and terms — the guest count is typed here and nowhere else. */
export function BookingDetailsCard({ booking }: { booking: Booking }) {
  const { manages } = usePermissions();
  if (!manages) return <BookingFacts booking={booking} />;
  return <BookingForm booking={booking} />;
}

/** For the kitchen and event production: the facts, without a form to change them. */
function BookingFacts({ booking }: { booking: Booking }) {
  return (
    <Card>
      <dl className="grid grid-cols-2 gap-4">
        <div>
          <dt className="text-sm text-ink-muted">Dato</dt>
          <dd className="font-medium first-letter:uppercase">{formatLongDate(booking.eventDate)}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-muted">Gæster</dt>
          <dd className="text-2xl font-semibold tabular">{booking.guestCount}</dd>
        </div>
      </dl>
    </Card>
  );
}

function BookingForm({ booking }: { booking: Booking }) {
  const queryClient = useQueryClient();
  const update = useUpdateBooking(booking.id);
  const [eventDate, setEventDate] = useState(booking.eventDate);
  const [guests, setGuests] = useState(String(booking.guestCount));
  const [terms, setTerms] = useState<PaymentTerms>(booking.paymentTerms);

  const guestCount = Number.parseInt(guests, 10);
  const dirty = eventDate !== booking.eventDate || guestCount !== booking.guestCount || terms !== booking.paymentTerms;
  const valid = Boolean(eventDate) && guestCount >= 1 && guestCount <= 350;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!dirty || !valid) return;
    update.mutate({ eventDate, guestCount, paymentTerms: terms, version: booking.version });
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Bryllup</h2>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Dato" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
          <Field
            label="Gæsteantal"
            type="number"
            inputMode="numeric"
            min={1}
            max={350}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            required
          />
        </div>
        <Segmented
          label="Betalingsbetingelser"
          value={terms}
          onChange={setTerms}
          options={[
            { value: 'New', label: termsLabels.New },
            { value: 'Old', label: termsLabels.Old },
          ]}
          hint={termsDescriptions[terms]}
        />

        {update.isError &&
          (isConflict(update.error) ? (
            <Alert tone="warn" title="Ændret af en anden">
              <p>{errorMessage(update.error)}</p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-3"
                onClick={() => void queryClient.invalidateQueries({ queryKey: bookingKeys.detail(booking.id) })}
              >
                Hent nyeste
              </Button>
            </Alert>
          ) : (
            <Alert tone="danger">{errorMessage(update.error)}</Alert>
          ))}

        {dirty && (
          <div className="flex gap-3">
            <Button type="submit" loading={update.isPending} disabled={!valid}>
              Gem
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setEventDate(booking.eventDate);
                setGuests(String(booking.guestCount));
                setTerms(booking.paymentTerms);
                update.reset();
              }}
            >
              Fortryd
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
}
