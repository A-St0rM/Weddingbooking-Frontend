import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { SimulatedBadge } from '@/components/ui/SimulatedBadge';
import { errorMessage } from '@/lib/api/errorMessage';
import type { SimDocument } from '@/lib/api/types';
import { formatKroner, formatShortDate, kronerInput, parseKroner } from '@/lib/format';
import { documentStatusLabels } from '@/lib/labels';
import { usePermissions } from '@/features/auth/permissions';
import { useSimActions, useSimDocuments } from '@/features/accounting-sim/api/accountingSim';

/**
 * Stands in for the accounting system's own screens: what the bookkeeper would
 * do in e-conomic. Here a quote is marked sent and a payment from the bank is
 * registered, so the flow can be shown from quote to full payment.
 */
export function AccountingSimPage() {
  const query = useSimDocuments();
  return (
    <>
      <PageHeader
        title="Regnskab"
        description="Et simuleret regnskabssystem, der opfører sig som e-conomic. Intet her er kundens rigtige regnskab."
        actions={<SimulatedBadge />}
      />
      <QueryState query={query}>
        {(documents) =>
          documents.length === 0 ? (
            <EmptyState title="Ingen bilag endnu">Opret et tilbud eller en faktura fra en booking.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {documents.map((document) => (
                <DocumentCard key={document.number} document={document} />
              ))}
            </ul>
          )
        }
      </QueryState>
    </>
  );
}

function DocumentCard({ document }: { document: SimDocument }) {
  const { manages } = usePermissions();
  const actions = useSimActions();
  const [paying, setPaying] = useState(false);
  const [amount, setAmount] = useState(kronerInput(document.remaining));
  const parsed = parseKroner(amount);
  const error = actions.markSent.error ?? actions.registerPayment.error;
  const isInvoice = document.type === 'Invoice';

  return (
    <li className="rounded-card bg-surface p-5 shadow-card ring-1 ring-line/60">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {isInvoice ? 'Faktura' : 'Tilbud'} {document.number}
          </p>
          <p className="text-sm text-ink-muted">{document.heading}</p>
          <p className="text-sm text-ink-muted">
            Kunde {document.customerNumber} · {document.customerName}
            {document.dueDate && ` · Forfald ${formatShortDate(document.dueDate)}`}
            {document.attachmentCount > 0 && ` · ${document.attachmentCount} bilag`}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium tabular">{formatKroner(document.amount)}</p>
          <Badge tone={document.status === 'Paid' ? 'ok' : document.status === 'Draft' ? 'warn' : 'info'} className="mt-1">
            {documentStatusLabels[document.status]}
          </Badge>
        </div>
      </div>
      {isInvoice && document.paid > 0 && document.remaining > 0 && (
        <p className="mt-1 text-sm tabular text-ink-muted">Betalt {formatKroner(document.paid)} · mangler {formatKroner(document.remaining)}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {!isInvoice && document.status === 'Draft' && manages && (
          <Button size="sm" variant="secondary" loading={actions.markSent.isPending} onClick={() => actions.markSent.mutate(document.number)}>
            Markér som sendt
          </Button>
        )}
        {isInvoice && document.status === 'Booked' && !paying && (
          <Button size="sm" variant="secondary" onClick={() => setPaying(true)}>
            Registrér betaling
          </Button>
        )}
        {isInvoice && document.status === 'Draft' && <p className="text-sm text-ink-muted">Bogføres fra bookingen, før der kan betales.</p>}
      </div>

      {paying && (
        <form
          className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (parsed) actions.registerPayment.mutate({ number: document.number, amount: parsed }, { onSuccess: () => setPaying(false) });
          }}
        >
          <Field className="flex-1" label="Indbetalt beløb (kr.)" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button type="submit" loading={actions.registerPayment.isPending} disabled={!parsed}>
            Registrér
          </Button>
          <Button variant="ghost" onClick={() => setPaying(false)}>
            Annullér
          </Button>
        </form>
      )}
      {Boolean(error) && <Alert tone="danger" className="mt-3">{errorMessage(error)}</Alert>}
    </li>
  );
}
