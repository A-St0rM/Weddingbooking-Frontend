import { useState, type FormEvent } from 'react';
import { PencilSimple } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { errorMessage } from '@/lib/api/errorMessage';
import type { Contact, Customer } from '@/lib/api/types';
import { usePermissions } from '@/features/auth/permissions';
import { useCustomerMutations } from '@/features/customers/api/customers';

/** The two people. One is the payer — the one on the quote and the invoice. */
export function ContactsCard({ customer }: { customer: Customer }) {
  const { manages } = usePermissions();
  const { updatePartner, makePayer, addMissingPartner } = useCustomerMutations(customer.id);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <Card>
      <h2 className="mb-3 text-xl font-medium">Parret</h2>
      <ul className="divide-y divide-line">
        {customer.contacts.map((person) =>
          editing === person.id ? (
            <li key={person.id} className="py-3">
              <PartnerForm
                person={person}
                pending={updatePartner.isPending}
                error={updatePartner.error}
                onCancel={() => setEditing(null)}
                onSubmit={(input) => updatePartner.mutate({ contactId: person.id, ...input }, { onSuccess: () => setEditing(null) })}
              />
            </li>
          ) : (
            <li key={person.id} className="flex items-start gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {person.fullName}
                  {person.isPayer && <Badge tone="primary" className="ml-2">Betaler</Badge>}
                </p>
                <p className="text-sm text-ink-muted [overflow-wrap:anywhere]">
                  {[person.email, person.phone].filter(Boolean).join(' · ') || 'Ingen e-mail eller telefon'}
                </p>
              </div>
              {manages && !person.isPayer && (
                <Button size="sm" variant="ghost" loading={makePayer.isPending} onClick={() => makePayer.mutate(person.id)}>
                  Gør til betaler
                </Button>
              )}
              {manages && (
                <Button size="sm" variant="ghost" aria-label={`Ret ${person.fullName}`} onClick={() => setEditing(person.id)}>
                  <PencilSimple aria-hidden="true" className="size-5" />
                </Button>
              )}
            </li>
          ),
        )}
      </ul>
      {makePayer.isError && <Alert tone="danger" className="mt-3">{errorMessage(makePayer.error)}</Alert>}
      {/* Only a customer from before the couple was two people can be missing one. */}
      {manages && customer.contacts.length < 2 && (
        <div className="mt-3 border-t border-line pt-4">
          <p className="mb-3 text-sm font-medium">Tilføj {customer.contacts.length === 0 ? 'første' : 'anden'} person</p>
          <PartnerForm
            pending={addMissingPartner.isPending}
            error={addMissingPartner.error}
            onSubmit={(input) => addMissingPartner.mutate(input)}
          />
        </div>
      )}
    </Card>
  );
}

function PartnerForm({ person, pending, error, onSubmit, onCancel }: {
  person?: Contact;
  pending: boolean;
  error: unknown;
  onSubmit: (input: { firstName: string; lastName: string | null; email: string | null; phone: string | null }) => void;
  onCancel?: () => void;
}) {
  const [firstName, setFirstName] = useState(person?.firstName ?? '');
  const [lastName, setLastName] = useState(person?.lastName ?? '');
  const [email, setEmail] = useState(person?.email ?? '');
  const [phone, setPhone] = useState(person?.phone ?? '');

  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ firstName: firstName.trim(), lastName: lastName.trim() || null, email: email.trim() || null, phone: phone.trim() || null });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Fornavn" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <Field label="Efternavn" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <Field label="E-mail" type="email" inputMode="email" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Telefon" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      {Boolean(error) && <Alert tone="danger">{errorMessage(error)}</Alert>}
      <div className="flex gap-3">
        <Button type="submit" loading={pending} disabled={!firstName.trim()}>Gem</Button>
        {onCancel && <Button variant="ghost" onClick={onCancel}>Annullér</Button>}
      </div>
    </form>
  );
}
