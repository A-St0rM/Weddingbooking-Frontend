import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, UserCircle } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { Segmented } from '@/components/ui/Segmented';
import { errorMessage } from '@/lib/api/errorMessage';
import type { CustomerSummary, PaymentTerms } from '@/lib/api/types';
import { useDebounced } from '@/lib/hooks/useDebounced';
import { termsDescriptions, termsLabels } from '@/lib/labels';
import { useBookingsOnDate, useCreateBooking } from '@/features/bookings/api/bookings';
import { SameDateWarning } from '@/features/bookings/components/SameDateWarning';
import { useCustomers } from '@/features/customers/api/customers';

/**
 * A booking from three things: the couple's name, the date, the guest count.
 * Everything else can wait. While the name is typed, customers who match are
 * offered, so a couple who come back get their new booking on the same customer.
 */
const emptyPerson = { firstName: '', lastName: '' };

export function NewBookingPage() {
  const navigate = useNavigate();
  const [people, setPeople] = useState([emptyPerson, emptyPerson]);
  const [customer, setCustomer] = useState<CustomerSummary | null>(null);
  const [eventDate, setEventDate] = useState('');
  const [guests, setGuests] = useState('');
  const [terms, setTerms] = useState<PaymentTerms>('New');
  const create = useCreateBooking();

  // Looks for the couple as it is typed: the first name alone, or both joined with "og".
  const typed = people.map((p) => p.firstName.trim()).filter(Boolean);
  const term = useDebounced(typed.join(' og '));
  const matches = useCustomers(term, { enabled: !customer && term.length >= 2 });
  const onDate = useBookingsOnDate(eventDate);

  const guestCount = Number.parseInt(guests, 10);
  const valid = (customer || typed.length === 2) && eventDate && guestCount >= 1 && guestCount <= 350;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    create.mutate(
      {
        customerId: customer?.id ?? null,
        partners: customer
          ? null
          : people.map((p) => ({ firstName: p.firstName.trim(), lastName: p.lastName.trim() || null, email: null, phone: null })),
        eventDate,
        guestCount,
        paymentTerms: terms,
      },
      { onSuccess: (booking) => navigate(`/bookinger/${booking.id}`, { replace: true }) },
    );
  }

  return (
    <>
      <BackLink to="/bookinger">Bookinger</BackLink>
      <PageHeader title="Ny booking" description="De to navne, dato og gæsteantal. Resten kan komme senere." />

      <form onSubmit={submit} className="space-y-5" noValidate>
        {customer ? (
          <div className="flex items-center gap-3 rounded-control border border-primary bg-primary-soft p-3">
            <CheckCircle aria-hidden="true" weight="fill" className="size-6 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{customer.name}</p>
              <p className="text-sm text-ink-muted">Eksisterende kunde · {customer.bookingCount} {customer.bookingCount === 1 ? 'booking' : 'bookinger'}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setCustomer(null)}>
              Skift
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {people.map((person, index) => (
              <fieldset key={index} className="grid grid-cols-2 gap-3">
                <legend className="mb-1.5 text-sm font-semibold">{index === 0 ? 'Første person' : 'Anden person'}</legend>
                <Field
                  label="Fornavn"
                  autoComplete="off"
                  value={person.firstName}
                  onChange={(e) => setPeople(people.map((p, i) => (i === index ? { ...p, firstName: e.target.value } : p)))}
                  required
                  autoFocus={index === 0}
                />
                <Field
                  label="Efternavn"
                  autoComplete="off"
                  value={person.lastName}
                  onChange={(e) => setPeople(people.map((p, i) => (i === index ? { ...p, lastName: e.target.value } : p)))}
                />
              </fieldset>
            ))}
            {term.length >= 2 && matches.data && matches.data.length > 0 && (
              <div aria-live="polite" className="rounded-control border border-line bg-surface">
                <p className="px-4 pt-3 text-sm font-medium text-ink-muted">Er det en af disse?</p>
                <ul className="divide-y divide-line">
                  {matches.data.slice(0, 5).map((match) => (
                    <li key={match.id}>
                      <button
                        type="button"
                        onClick={() => setCustomer(match)}
                        className="flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 py-2 text-left hover:bg-neutral-soft"
                      >
                        <UserCircle aria-hidden="true" className="size-6 shrink-0 text-ink-muted" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{match.name}</span>
                          <span className="block truncate text-sm text-ink-muted">
                            {[match.payer?.email, match.city, `${match.bookingCount} ${match.bookingCount === 1 ? 'booking' : 'bookinger'}`]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Bryllupsdato" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
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

        {onDate.data && <SameDateWarning bookings={onDate.data} />}

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

        {create.isError && <Alert tone="danger">{errorMessage(create.error)}</Alert>}

        <Button type="submit" loading={create.isPending} disabled={!valid} className="w-full sm:w-auto">
          Opret booking
        </Button>
      </form>
    </>
  );
}
