import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Badge, type Tone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { errorMessage } from '@/lib/api/errorMessage';
import type { CardReport, ImportReport } from '@/lib/api/types';
import { formatShortDate } from '@/lib/format';
import { useTrelloImport, useTrelloStatus } from '@/features/trello/api/trello';

const actionLabels: Record<CardReport['action'], [string, Tone]> = {
  Import: ['Importeres', 'info'],
  Imported: ['Importeret', 'ok'],
  AlreadyImported: ['Allerede importeret', 'neutral'],
  Skip: ['Springes over', 'warn'],
};

/**
 * The one-time move from Trello. A dry run shows every card — what would be
 * imported, and why the rest cannot be — before anything is saved. Trello is
 * only read; the import can be run again and skips what it already took.
 */
export function TrelloImportPage() {
  const status = useTrelloStatus();
  const { preview, run } = useTrelloImport();
  const [files, setFiles] = useState<File[]>([]);
  const [boardIds, setBoardIds] = useState('');
  const source = { files, boardIds };
  const report = run.data ?? preview.data;
  const hasSource = files.length > 0 || boardIds.trim().length > 0;

  return (
    <>
      <PageHeader
        title="Import fra Trello"
        description="Bordene Bryllup 26, 27 og 28. Først et tørløb, der viser hvert kort — så importen."
      />
      <Card className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="trello-files" className="block text-sm font-medium">Trello-eksport (JSON)</label>
          <input
            id="trello-files"
            type="file"
            accept="application/json,.json"
            multiple
            onChange={(e) => {
              setFiles(Array.from(e.target.files ?? []));
              preview.reset();
              run.reset();
            }}
            className="block w-full text-sm file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-control file:border file:border-control file:bg-surface file:px-4 file:font-medium"
          />
          <p className="text-sm text-ink-muted">I Trello: bordets menu → Udskriv, eksportér og del → Eksportér som JSON. Ét bord pr. fil.</p>
        </div>
        <Field
          label="Eller bord-id'er fra Trello"
          value={boardIds}
          onChange={(e) => setBoardIds(e.target.value)}
          hint={status.data?.apiConfigured ? 'Adskil med komma. Trello-nøglen er sat op.' : 'Adskil med komma. Uden Trello-nøgle kan kun offentlige boards læses.'}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" loading={preview.isPending} disabled={!hasSource} onClick={() => { run.reset(); preview.mutate(source); }}>
            Tørløb
          </Button>
          {preview.data && !run.data && preview.data.importable > 0 && (
            <Button loading={run.isPending} onClick={() => run.mutate(source)}>
              Importér {preview.data.importable} kort
            </Button>
          )}
        </div>
        {(preview.isError || run.isError) && <Alert tone="danger">{errorMessage(preview.error ?? run.error)}</Alert>}
      </Card>

      {report && <Report report={report} />}
    </>
  );
}

function Report({ report }: { report: ImportReport }) {
  return (
    <div className="mt-5 space-y-5">
      <Alert tone={report.dryRun ? 'info' : 'ok'} title={report.dryRun ? 'Tørløb — intet er gemt' : 'Importen er gennemført'}>
        {report.cards} kort i alt: {report.dryRun ? `${report.importable} kan importeres` : `${report.imported} importeret`}, {report.alreadyImported} allerede importeret,{' '}
        {report.skipped} springes over.
      </Alert>
      {report.boards.map((board) => (
        <section key={board.name}>
          <h2 className="eyebrow mb-3 font-sans">{board.name}</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-card">
            {board.cards.map((card) => {
              const [label, tone] = actionLabels[card.action];
              return (
                <li key={card.cardId} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium [overflow-wrap:anywhere]">{card.cardName}</p>
                      <p className="text-sm text-ink-muted">
                        {[card.listName, card.coupleName, card.eventDate && formatShortDate(card.eventDate), card.guestCount && `${card.guestCount} gæster`,
                          card.existingCustomer && 'eksisterende kunde', card.readinessItems > 0 && `${card.readinessItems} klargøringspunkter`]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      {card.reason && <p className="mt-1 text-sm text-warn">{card.reason}</p>}
                    </div>
                    <Badge tone={tone}>{label}</Badge>
                  </div>
                  {card.bookingId && (
                    <Link to={`/bookinger/${card.bookingId}`} className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-primary">
                      Åbn booking
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
