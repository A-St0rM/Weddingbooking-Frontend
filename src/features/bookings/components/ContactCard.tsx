import { Link } from 'react-router-dom';
import { Envelope, Phone } from '@phosphor-icons/react';
import { Card } from '@/components/ui/Card';
import type { Customer } from '@/lib/api/types';
import { usePermissions } from '@/features/auth/permissions';

export function ContactCard({ customer }: { customer: Customer }) {
  const { manages } = usePermissions();
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-medium">Kontakt</h2>
        {manages && (
          <Link to={`/kunder/${customer.id}`} className="inline-flex min-h-11 items-center font-medium text-primary">
            Ret kunde
          </Link>
        )}
      </div>
      {customer.contacts.length === 0 ? (
        <p className="text-ink-muted">Ingen kontaktpersoner endnu.</p>
      ) : (
        <ul className="space-y-4">
          {customer.contacts.map((contact) => (
            <li key={contact.id}>
              <p className="font-medium">
                {contact.fullName}
                {contact.isPayer && <span className="ml-2 text-sm font-normal text-ink-muted">Betaler</span>}
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {contact.phone && (
                  <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="inline-flex min-h-11 items-center gap-2 rounded-control border border-line px-3 text-sm font-medium">
                    <Phone aria-hidden="true" className="size-4" /> {contact.phone}
                  </a>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-control border border-line px-3 text-sm font-medium [overflow-wrap:anywhere]">
                    <Envelope aria-hidden="true" className="size-4 shrink-0" /> {contact.email}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {(customer.address || customer.city) && (
        <p className="mt-4 text-sm text-ink-muted">
          {[customer.address, [customer.postalCode, customer.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')}
        </p>
      )}
    </Card>
  );
}
