import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { QueryState } from '@/components/ui/QueryState';
import { errorMessage } from '@/lib/api/errorMessage';
import type { Customer, CustomerDetail } from '@/lib/api/types';
import { BookingList } from '@/features/bookings/components/BookingRow';
import { useCustomer, useCustomerMutations } from '@/features/customers/api/customers';
import { ContactsCard } from '@/features/customers/components/ContactsCard';
import { usePermissions } from '@/features/auth/permissions';

export function CustomerPage() {
  const { id = '' } = useParams();
  const query = useCustomer(id);
  return (
    <>
      <BackLink to="/kunder">Kunder</BackLink>
      <QueryState query={query}>{(detail) => <CustomerView detail={detail} />}</QueryState>
    </>
  );
}

function CustomerView({ detail }: { detail: CustomerDetail }) {
  const { customer, bookings } = detail;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-balance">{customer.name}</h1>
      <DetailsCard key={JSON.stringify(customer)} customer={customer} />
      <ContactsCard customer={customer} />
      <section>
        <h2 className="mb-2 text-xl font-medium">Bookinger</h2>
        {bookings.length === 0 ? <EmptyState title="Ingen bookinger" /> : <BookingList bookings={bookings} />}
      </section>
    </div>
  );
}

function DetailsCard({ customer }: { customer: Customer }) {
  const { manages } = usePermissions();
  const { update } = useCustomerMutations(customer.id);
  const [form, setForm] = useState({
    address: customer.address ?? '',
    postalCode: customer.postalCode ?? '',
    city: customer.city ?? '',
  });
  const dirty =
    form.address !== (customer.address ?? '') ||
    form.postalCode !== (customer.postalCode ?? '') ||
    form.city !== (customer.city ?? '');
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  function submit(event: FormEvent) {
    event.preventDefault();
    update.mutate({ address: form.address || null, postalCode: form.postalCode || null, city: form.city || null });
  }

  return (
    <Card>
      <h2 className="mb-4 text-xl font-medium">Betalerens adresse</h2>
      <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={!manages} className="space-y-4">
        <Field label="Adresse" autoComplete="street-address" value={form.address} onChange={set('address')} />
        <div className="grid grid-cols-[7rem_1fr] gap-3">
          <Field label="Postnr." inputMode="numeric" autoComplete="postal-code" value={form.postalCode} onChange={set('postalCode')} />
          <Field label="By" autoComplete="address-level2" value={form.city} onChange={set('city')} />
        </div>
        </fieldset>
        {update.isError && <Alert tone="danger">{errorMessage(update.error)}</Alert>}
        {dirty && manages && (
          <Button type="submit" loading={update.isPending}>
            Gem
          </Button>
        )}
      </form>
    </Card>
  );
}
