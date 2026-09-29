import { Check } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';
import type { DisplayStatus } from '@/lib/api/types';

const steps = ['Bestilling', 'Forespørgsel', 'Fremvisning', 'Tilbud', 'Underskrevet', 'Dato sikret', 'Klar', 'Afholdt'];

/** Where each status sits on the way from the website to the day. Only drawing — the status is the API's. */
const position: Partial<Record<DisplayStatus, number>> = {
  Requested: 0,
  Inquiry: 1,
  Viewing: 2,
  QuoteSent: 3,
  Signed: 4,
  DateSecured: 5,
  PaymentOverdue: 5,
  ReadyForEvent: 6,
  AwaitingPostEventInvoice: 7,
  Held: 7,
};

/** The case's road so far, as a row of stations. Cancelled and lost cases have no road. */
export function Journey({ status }: { status: DisplayStatus }) {
  const at = position[status];
  if (at === undefined) return null;
  const troubled = status === 'PaymentOverdue' || status === 'AwaitingPostEventInvoice';
  return (
    <div>
    <p className="mb-2 text-sm md:hidden">
      <span className="text-ink-muted">Trin {Math.min(at + 1, steps.length)} af {steps.length}: </span>
      <span className="font-medium">{steps[at]}</span>
    </p>
    <ol aria-label="Sagens forløb" className="grid grid-cols-8 gap-1">
      {steps.map((step, i) => {
        const done = i < at || (i === at && status === 'Held');
        const current = i === at && !done;
        return (
          <li key={step} aria-current={current ? 'step' : undefined} className="min-w-0">
            <span
              className={cn(
                'block h-1.5 rounded-full transition-colors',
                done ? 'bg-primary' : current ? (troubled ? 'bg-warn' : 'bg-primary/50') : 'bg-line',
              )}
            />
            <span
              className={cn(
                'mt-2 hidden items-center gap-1 truncate text-xs md:flex',
                current ? 'font-semibold text-ink' : done ? 'text-ink-muted' : 'text-ink-muted/60',
              )}
            >
              {done && <Check aria-hidden="true" weight="bold" className="size-3 shrink-0 text-primary" />}
              {step}
            </span>
            <span className="sr-only">{done ? ' (gennemført)' : current ? ' (nu)' : ''}</span>
          </li>
        );
      })}
    </ol>
    </div>
  );
}
