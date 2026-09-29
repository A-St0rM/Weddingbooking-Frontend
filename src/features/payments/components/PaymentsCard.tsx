import { Link } from 'react-router-dom';
import { FilePdf } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SimulatedBadge } from '@/components/ui/SimulatedBadge';
import { Spinner } from '@/components/ui/Spinner';
import { errorMessage } from '@/lib/api/errorMessage';
import type { Booking, Instalment } from '@/lib/api/types';
import { formatKroner, formatShortDate } from '@/lib/format';
import { documentStatusLabels, instalmentLabels, instalmentStateLabels, instalmentStateTones, termsLabels } from '@/lib/labels';
import { usePermissions } from '@/features/auth/permissions';
import { usePaymentActions, usePayments } from '@/features/payments/api/payments';

/**
 * The payment plan, with each instalment's state read from the accounting
 * system. Amounts and dates are the API's; nothing is added up here.
 */
export function PaymentsCard({ booking }: { booking: Booking }) {
  const { manages } = usePermissions();
  // Only roles that see prices reach this card, and all of them may invoice.
  const invoices = true;
  const query = usePayments(booking.id);
  const actions = usePaymentActions(booking.id);
  const busy = [actions.createQuote, actions.createInvoice, actions.bookInvoice, actions.downloadPdf];
  const error = busy.find((m) => m.isError)?.error;

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Betaling</h2>
        <SimulatedBadge />
      </div>

      {query.isPending && <Spinner label="Henter fra regnskabet" />}
      {query.isError && <Alert tone="danger" title="Regnskabet svarer ikke">{errorMessage(query.error)}</Alert>}

      {query.data && (
        <>
          <p className="text-sm text-ink-muted">
            {termsLabels[query.data.terms]}
            {query.data.customerNumber && ` · Kundenr. ${query.data.customerNumber}`}
          </p>

          <div className="mt-3 rounded-control bg-neutral-soft p-3">
            {query.data.quote ? (
              <p className="text-sm">
                <span className="font-medium">Tilbud nr. {query.data.quote.number}</span> ·{' '}
                <span className="tabular">{formatKroner(query.data.quote.amount)}</span> · {documentStatusLabels[query.data.quote.status]}
              </p>
            ) : (
              <p className="text-sm text-ink-muted">Intet tilbud i regnskabet endnu.</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {manages && (
                <Button size="sm" variant="secondary" loading={actions.createQuote.isPending} onClick={() => actions.createQuote.mutate()}>
                  {query.data.quote ? 'Nyt tilbud' : 'Opret tilbud'}
                </Button>
              )}
              {query.data.quote && <PdfButton onClick={() => actions.downloadPdf.mutate(query.data.quote!.number)} />}
            </div>
          </div>

          <ul className="mt-3 divide-y divide-line">
            {query.data.instalments.map((instalment) => (
              <InstalmentRow
                key={instalment.kind}
                instalment={instalment}
                canInvoice={invoices && booking.stage !== 'Cancelled' && booking.stage !== 'Lost'}
                pending={actions.createInvoice.isPending || actions.bookInvoice.isPending}
                onInvoice={() => actions.createInvoice.mutate(instalment.kind)}
                onBook={(number) => actions.bookInvoice.mutate(number)}
                onPdf={(number) => actions.downloadPdf.mutate(number)}
              />
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t border-line pt-3 font-semibold tabular">
            <span>I alt</span>
            <span>{formatKroner(query.data.total)}</span>
          </div>

          {Boolean(error) && <Alert tone="danger" className="mt-3">{errorMessage(error)}</Alert>}

          <Link to="/regnskab" className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-primary">
            Åbn det simulerede regnskab
          </Link>
        </>
      )}
    </Card>
  );
}

function InstalmentRow({ instalment, canInvoice, pending, onInvoice, onBook, onPdf }: {
  instalment: Instalment;
  canInvoice: boolean;
  pending: boolean;
  onInvoice: () => void;
  onBook: (number: string) => void;
  onPdf: (number: string) => void;
}) {
  const invoice = instalment.invoice;
  return (
    <li className="py-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{instalmentLabels[instalment.kind]}</p>
          <p className="text-sm text-ink-muted">
            Forfald {formatShortDate(instalment.dueDate)}
            {invoice && ` · Faktura ${invoice.number}`}
            {invoice && invoice.remaining > 0 && invoice.remaining < invoice.amount && ` · mangler ${formatKroner(invoice.remaining)}`}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium tabular">{formatKroner(instalment.amount)}</p>
          <Badge tone={instalmentStateTones[instalment.state]} className="mt-1">
            {instalmentStateLabels[instalment.state]}
          </Badge>
        </div>
      </div>
      {instalment.amount < 0 && <p className="mt-1 text-sm text-warn">Negativt beløb: prisen er faldet under det, der allerede er faktureret.</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {canInvoice && !invoice && instalment.amount > 0 && (
          <Button size="sm" variant="secondary" loading={pending} onClick={onInvoice}>
            Fakturér
          </Button>
        )}
        {canInvoice && invoice?.status === 'Draft' && (
          <Button size="sm" loading={pending} onClick={() => onBook(invoice.number)}>
            Bogfør og send
          </Button>
        )}
        {invoice && <PdfButton onClick={() => onPdf(invoice.number)} />}
      </div>
    </li>
  );
}

function PdfButton({ onClick }: { onClick: () => void }) {
  return (
    <Button size="sm" variant="ghost" onClick={onClick}>
      <FilePdf aria-hidden="true" className="size-5" /> PDF
    </Button>
  );
}
