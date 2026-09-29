import { useState } from 'react';
import { PencilSimple, Plus } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { LineForm } from '@/components/lines/LineForm';
import { toDraft } from '@/components/lines/lineDraft';
import { errorMessage } from '@/lib/api/errorMessage';
import type { Booking, BookingLine, Price } from '@/lib/api/types';
import { formatKroner } from '@/lib/format';
import { productGroupLabels } from '@/lib/labels';
import { usePermissions } from '@/features/auth/permissions';
import { useBookingLines } from '@/features/bookings/api/bookings';
import { usePackages } from '@/features/packages/api/packages';

/**
 * What the couple has chosen and what it costs. Every amount shown is the API's:
 * change the guest count and the per-guest lines and the total follow on the
 * next read, with nothing worked out here.
 */
export function BookingLinesCard({ booking }: { booking: Booking }) {
  const { manages } = usePermissions();
  const mutations = useBookingLines(booking.id);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const price = booking.price;

  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold">{price ? 'Indhold og pris' : 'Indhold'}</h2>

      {booking.lines.length === 0 ? (
        <p className="text-ink-muted">Ingen pakker eller linjer endnu.</p>
      ) : (
        <ul className="divide-y divide-line">
          {booking.lines.map((line) =>
            editing === line.id && price ? (
              <li key={line.id} className="py-3">
                <LineForm
                  initial={toDraft({ ...line, unitPrice: priced(price, line.id)?.unitPrice ?? 0 })}
                  submitLabel="Gem linje"
                  pending={mutations.updateLine.isPending}
                  error={mutations.updateLine.error}
                  onCancel={() => setEditing(null)}
                  onSubmit={(body) => mutations.updateLine.mutate({ lineId: line.id, body }, { onSuccess: () => setEditing(null) })}
                  onRemove={() => {
                    if (window.confirm(`Fjern "${line.description}" fra bookingen?`)) {
                      mutations.removeLine.mutate(line.id, { onSuccess: () => setEditing(null) });
                    }
                  }}
                />
              </li>
            ) : (
              <LineRow key={line.id} line={line} price={price} onEdit={manages && price ? () => setEditing(line.id) : undefined} />
            ),
          )}
        </ul>
      )}

      {price && booking.lines.length > 0 && <Totals price={price} />}

      {manages && editing === 'new' && (
        <div className="mt-4 border-t border-line pt-4">
          <LineForm
            submitLabel="Tilføj linje"
            pending={mutations.addLine.isPending}
            error={mutations.addLine.error}
            onCancel={() => setEditing(null)}
            onSubmit={(body) => mutations.addLine.mutate(body, { onSuccess: () => setEditing(null) })}
          />
        </div>
      )}

      {manages && editing === null && (
        <div className="mt-4 space-y-3 border-t border-line pt-4">
          <AddPackage booking={booking} />
          <Button variant="ghost" onClick={() => setEditing('new')}>
            <Plus aria-hidden="true" className="size-5" /> Tilføj linje i hånden
          </Button>
        </div>
      )}
    </Card>
  );
}

const priced = (price: Price, lineId: string) => price.lines.find((line) => line.lineId === lineId);

function LineRow({ line, price, onEdit }: { line: BookingLine; price: Price | null; onEdit?: () => void }) {
  const amounts = price ? priced(price, line.id) : undefined;
  return (
    <li className="flex items-start gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{line.description}</p>
        <p className="text-sm text-ink-muted">
          {productGroupLabels[line.group]}
          {amounts && (
            <span className="tabular">
              {' · '}
              {formatKroner(amounts.unitPrice)} × {amounts.units} {line.pricing === 'PerGuest' ? 'gæster' : 'stk.'}
            </span>
          )}
          {!amounts && line.pricing === 'Fixed' && ` · ${line.quantity} stk.`}
        </p>
      </div>
      {amounts && <p className="shrink-0 font-medium tabular">{formatKroner(amounts.total)}</p>}
      {onEdit && (
        <Button size="sm" variant="ghost" aria-label={`Ret ${line.description}`} onClick={onEdit}>
          <PencilSimple aria-hidden="true" className="size-5" />
        </Button>
      )}
    </li>
  );
}

function Totals({ price }: { price: Price }) {
  return (
    <dl className="mt-2 space-y-1 border-t border-line pt-3 tabular">
      {price.surcharge.applies && (
        <>
          <div className="flex justify-between text-ink-muted">
            <dt>Linjer i alt</dt>
            <dd>{formatKroner(price.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-ink-muted">
            <dt>Tillæg under {price.surcharge.threshold} gæster</dt>
            <dd>{formatKroner(price.surcharge.amount)}</dd>
          </div>
        </>
      )}
      <div className="flex justify-between text-lg font-semibold">
        <dt>Total</dt>
        <dd>{formatKroner(price.total)}</dd>
      </div>
    </dl>
  );
}

function AddPackage({ booking }: { booking: Booking }) {
  const packages = usePackages();
  const { addPackage } = useBookingLines(booking.id);
  const year = Number(booking.eventDate.slice(0, 4));
  // Nearest year first, the base package before the add-ons.
  const available = (packages.data ?? [])
    .slice()
    .sort((a, b) => Math.abs(a.year - year) - Math.abs(b.year - year) || (a.kind === b.kind ? a.name.localeCompare(b.name, 'da') : a.kind === 'Base' ? -1 : 1));
  const [chosen, setChosen] = useState('');
  const selected = chosen || available[0]?.id || '';

  if (available.length === 0) return null;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <Select
        className="flex-1"
        label="Læg en pakke på"
        value={selected}
        onChange={(e) => setChosen(e.target.value)}
        options={available.map((pkg) => ({ value: pkg.id, label: pkg.name }))}
        hint={available[0] && available[0].year !== year ? `Der er ingen pakker for ${year} endnu.` : undefined}
      />
      <Button variant="secondary" loading={addPackage.isPending} onClick={() => addPackage.mutate(selected)}>
        Tilføj pakke
      </Button>
      {addPackage.isError && <Alert tone="danger">{errorMessage(addPackage.error)}</Alert>}
    </div>
  );
}
