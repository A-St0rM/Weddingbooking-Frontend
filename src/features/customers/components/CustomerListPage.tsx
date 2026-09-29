import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CaretRight } from '@phosphor-icons/react';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { SearchInput } from '@/components/ui/SearchInput';
import { formatShortDate } from '@/lib/format';
import { useDebounced } from '@/lib/hooks/useDebounced';
import { useCustomers, useIncompleteCustomers } from '@/features/customers/api/customers';
import { usePermissions } from '@/features/auth/permissions';
import { Alert } from '@/components/ui/Alert';

export function CustomerListPage() {
  const [search, setSearch] = useState('');
  const term = useDebounced(search.trim());
  const query = useCustomers(term);
  const incomplete = useIncompleteCustomers(usePermissions().manages);

  return (
    <>
      <PageHeader title="Kunder" description="Et par, der kommer igen, er den samme kunde." />
      {incomplete.data && incomplete.data.length > 0 && (
        <Alert tone="warn" title={`${incomplete.data.length} kunder er ikke to personer endnu`} className="mb-4">
          <ul className="mt-1 space-y-1">
            {incomplete.data.map((c) => (
              <li key={c.id}>
                <Link to={`/kunder/${c.id}`} className="font-medium underline">{c.name || 'Uden navn'}</Link> — {c.reason}
              </li>
            ))}
          </ul>
        </Alert>
      )}
      <SearchInput label="Søg på navn eller e-mail" value={search} onChange={setSearch} />
      <div className="mt-4">
        <QueryState query={query}>
          {(customers) =>
            customers.length === 0 ? (
              <EmptyState title={term ? `Ingen kunder matcher "${term}"` : 'Ingen kunder endnu'}>
                Kunder oprettes sammen med deres første booking.
              </EmptyState>
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-card">
                {customers.map((customer) => (
                  <li key={customer.id}>
                    <Link to={`/kunder/${customer.id}`} className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-neutral-soft">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{customer.name}</p>
                        <p className="truncate text-sm text-ink-muted">
                          {[
                            customer.payer?.email ?? customer.payer?.phone,
                            customer.nextEventDate ? `Næste: ${formatShortDate(customer.nextEventDate)}` : null,
                            `${customer.bookingCount} ${customer.bookingCount === 1 ? 'booking' : 'bookinger'}`,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                      <CaretRight aria-hidden="true" className="size-4 shrink-0 text-ink-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            )
          }
        </QueryState>
      </div>
    </>
  );
}
