import { useState, type FormEvent } from 'react';
import { PencilSimple, Plus, Star } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { errorMessage } from '@/lib/api/errorMessage';
import type { Contact, Customer } from '@/lib/api/types';
import { useCustomerMutations, type ContactInput } from '@/features/customers/api/customers';

/** Normally the two getting married. Exactly one is primary; mail goes to them. */
export function ContactsCard({ customer }: { customer: Customer }) {
  const mutations = useCustomerMutations(customer.id);
  const [editing, setEditing] = useState<string | 'new' | null>(customer.contacts.length === 0 ? 'new' : null);
  const error = [mutations.makePrimary, mutations.removeContact].find((m) => m.isError)?.error;

  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold">Kontaktpersoner</h2>
      <ul className="divide-y divide-line">
        {customer.contacts.map((contact) =>
          editing === contact.id ? (
            <li key={contact.id} className="py-3">
              <ContactForm
                initial={contact}
                pending={mutations.updateContact.isPending}
                error={mutations.updateContact.error}
                onCancel={() => setEditing(null)}
                onSubmit={(input) =>
                  mutations.updateContact.mutate({ contactId: contact.id, ...input }, { onSuccess: () => setEditing(null) })
                }
                onRemove={() => {
                  if (window.confirm(`Fjern ${contact.name} som kontaktperson?`)) {
                    mutations.removeContact.mutate(contact.id, { onSuccess: () => setEditing(null) });
                  }
                }}
              />
            </li>
          ) : (
            <li key={contact.id} className="flex items-start gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {contact.name}
                  {contact.isPrimary && <span className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">Primær</span>}
                </p>
                <p className="text-sm text-ink-muted [overflow-wrap:anywhere]">{[contact.email, contact.phone].filter(Boolean).join(' · ') || 'Ingen e-mail eller telefon'}</p>
              </div>
              {!contact.isPrimary && (
                <Button size="sm" variant="ghost" aria-label={`Gør ${contact.name} primær`} onClick={() => mutations.makePrimary.mutate(contact.id)}>
                  <Star aria-hidden="true" className="size-5" />
                </Button>
              )}
              <Button size="sm" variant="ghost" aria-label={`Ret ${contact.name}`} onClick={() => setEditing(contact.id)}>
                <PencilSimple aria-hidden="true" className="size-5" />
              </Button>
            </li>
          ),
        )}
      </ul>

      {error && <Alert tone="danger" className="mt-3">{errorMessage(error)}</Alert>}

      {editing === 'new' ? (
        <div className="mt-3 border-t border-line pt-4">
          <ContactForm
            pending={mutations.addContact.isPending}
            error={mutations.addContact.error}
            onCancel={customer.contacts.length > 0 ? () => setEditing(null) : undefined}
            onSubmit={(input) => mutations.addContact.mutate(input, { onSuccess: () => setEditing(null) })}
          />
        </div>
      ) : (
        <Button variant="secondary" className="mt-3 w-full sm:w-auto" onClick={() => setEditing('new')}>
          <Plus aria-hidden="true" className="size-5" /> Tilføj kontaktperson
        </Button>
      )}
    </Card>
  );
}

function ContactForm({ initial, pending, error, onSubmit, onCancel, onRemove }: {
  initial?: Contact;
  pending: boolean;
  error: unknown;
  onSubmit: (input: ContactInput) => void;
  onCancel?: () => void;
  onRemove?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');

  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ name: name.trim(), email: email.trim() || null, phone: phone.trim() || null });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Navn" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Field label="E-mail" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="Telefon" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      {Boolean(error) && <Alert tone="danger">{errorMessage(error)}</Alert>}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={pending} disabled={!name.trim()}>
          {initial ? 'Gem' : 'Tilføj'}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Annullér
          </Button>
        )}
        {onRemove && (
          <Button variant="ghost" className="ml-auto text-danger" onClick={onRemove}>
            Fjern
          </Button>
        )}
      </div>
    </form>
  );
}
