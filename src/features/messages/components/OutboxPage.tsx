import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { SimulatedOutboxBadge } from '@/components/ui/SimulatedOutboxBadge';
import { formatDateTime } from '@/lib/format';
import { useOutbox } from '@/features/messages/api/messages';

/** Every mail "sent", exactly as it would have gone out. */
export function OutboxPage() {
  const query = useOutbox();
  return (
    <>
      <PageHeader title="Udbakke" description="Mails sendt fra systemet. Udbakken er simuleret: intet forlader systemet." actions={<SimulatedOutboxBadge />} />
      <QueryState query={query}>
        {(messages) =>
          messages.length === 0 ? (
            <EmptyState title="Ingen mails sendt endnu" />
          ) : (
            <ul className="space-y-3">
              {messages.map((m) => (
                <li key={m.id} className="rounded-card bg-surface p-5 shadow-card ring-1 ring-line/60">
                  <p className="text-xs text-ink-muted">{formatDateTime(m.sentAt)} · fra {m.fromName}{m.replyTo && ` <${m.replyTo}>`}</p>
                  <p className="text-sm [overflow-wrap:anywhere]">Til: {m.to}{m.cc && ` · CC: ${m.cc}`}</p>
                  <p className="mt-1 font-semibold">{m.subject}</p>
                  <p className="mt-1 text-sm whitespace-pre-line">{m.body}</p>
                </li>
              ))}
            </ul>
          )
        }
      </QueryState>
    </>
  );
}
