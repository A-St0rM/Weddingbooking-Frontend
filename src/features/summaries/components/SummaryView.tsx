import type { SummaryResult } from '@/lib/api/types';
import { formatDateTime } from '@/lib/format';

/** The four fields, and — for a booking — the facts they sit next to. */
export function SummaryView({ result }: { result: SummaryResult }) {
  const { summary, facts } = result;
  return (
    <div className="space-y-4">
      {facts && (
        <div className="rounded-control bg-neutral-soft p-3">
          <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">Fra bookingen</p>
          <ul className="mt-1 space-y-0.5 text-sm">
            {facts.map((fact) => (
              <li key={fact} className="tabular">{fact}</li>
            ))}
          </ul>
        </div>
      )}
      <Section title="Status">{summary.status}</Section>
      <Section title="Aftalt indhold">{summary.agreedContent}</Section>
      <div>
        <h3 className="text-sm font-semibold text-ink-muted">Åbne punkter</h3>
        {summary.openItems.length === 0 ? (
          <p className="mt-0.5">Ingen åbne punkter fundet.</p>
        ) : (
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {summary.openItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
      <Section title="Sidste kontakt">{summary.lastContact}</Section>
      <p className="text-xs text-ink-muted">
        {result.source} · {formatDateTime(result.generatedAt)}. Et forslag — tjek det mod historikken.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink-muted">{title}</h3>
      <p className="mt-0.5 whitespace-pre-line">{children}</p>
    </div>
  );
}
