import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowSquareOut, CheckSquare, Clock } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Segmented } from '@/components/ui/Segmented';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/api/errorMessage';
import type { components } from '@/lib/api/schema';
import { formatDateTime, formatShortDate } from '@/lib/format';
import { usePermissions } from '@/features/auth/permissions';
import { useTrelloBoard, useTrelloBoards } from '@/features/trello/api/board';

type Card = components['schemas']['CardResponse'];

// Trello's label colours, with dark text on each — readable in daylight.
const labelColours: Record<string, string> = {
  green: '#4bce97', yellow: '#f5cd47', orange: '#fea362', red: '#f87168', purple: '#9f8fef',
  blue: '#579dff', sky: '#6cc3e0', lime: '#94c748', pink: '#e774bb', black: '#8590a2',
};
const labelColour = (colour: string) => labelColours[colour.split('_')[0]] ?? '#dcdfe4';

/**
 * The Trello boards as Trello shows them — lists, cards, labels, checklists, due dates — so nobody
 * has to switch to Trello. Read through our API, which reads Trello; never from the browser.
 */
export function TrelloBoardPage() {
  const { manages } = usePermissions();
  const boards = useTrelloBoards();
  const [chosen, setChosen] = useState<string>();
  const boardId = chosen ?? boards.data?.[0]?.id;
  const board = useTrelloBoard(boardId);

  return (
    <>
      <PageHeader
        title="Trello"
        description={board.data && `${board.data.name} · opdateret ${formatDateTime(board.data.fetchedAt)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {board.data?.url && (
              <a href={board.data.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-control border border-control px-4 text-sm font-medium hover:bg-neutral-soft">
                <ArrowSquareOut aria-hidden="true" className="size-4" /> Åbn i Trello
              </a>
            )}
            {manages && (
              <Link to="/trello/import" className="inline-flex min-h-11 items-center rounded-control px-4 text-sm font-medium text-primary hover:bg-neutral-soft">
                Import
              </Link>
            )}
          </div>
        }
      />

      {boards.isPending && <Spinner label="Henter boards" />}
      {boards.isError && <Alert tone="danger" title="Trello svarer ikke">{errorMessage(boards.error)}</Alert>}
      {boards.data?.length === 0 && (
        <EmptyState title="Ingen Trello-boards sat op">Sæt boardenes id i indstillingen Trello__BoardIds__0, __1 … på API'et.</EmptyState>
      )}
      {boards.data && boards.data.length > 1 && (
        <div className="mb-4 max-w-xl">
          <Segmented label="Board" value={boardId ?? ''} onChange={setChosen} options={boards.data.map((b) => ({ value: b.id, label: b.name }))} />
        </div>
      )}

      {board.isError && <Alert tone="danger">{errorMessage(board.error)}</Alert>}
      {board.data && (
        // The board scrolls sideways, the page does not — as in Trello, one list at a time on a phone.
        <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 lg:mx-0 lg:px-0">
          {board.data.lists.map((list) => (
            <section key={list.id} aria-label={list.name} className="w-[85vw] max-w-80 shrink-0 snap-start rounded-card bg-neutral-soft p-2 sm:w-72">
              <h2 className="flex items-center justify-between px-2 py-1.5 text-sm font-semibold">
                {list.name}
                <span className="font-normal text-ink-muted tabular">{list.cards.length}</span>
              </h2>
              <ul className="space-y-2">
                {list.cards.map((card) => <TrelloCard key={card.id} card={card} />)}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function TrelloCard({ card }: { card: Card }) {
  const items = card.checklists.flatMap((c) => c.items);
  const done = items.filter((i) => i.complete).length;
  return (
    <li className="rounded-control bg-surface shadow-card">
      <details className="group">
        <summary className="cursor-pointer list-none p-3 [&::-webkit-details-marker]:hidden">
          {card.labels.length > 0 && (
            <span className="mb-1.5 flex flex-wrap gap-1">
              {card.labels.map((l, i) => (
                <span key={i} className="rounded px-1.5 py-0.5 text-xs font-medium text-[#172b4d]" style={{ backgroundColor: labelColour(l.color) }}>
                  {l.name || l.color}
                </span>
              ))}
            </span>
          )}
          <span className="block text-sm font-medium [overflow-wrap:anywhere]">{card.name}</span>
          <span className="mt-1.5 flex flex-wrap gap-2 text-xs text-ink-muted">
            {card.due && (
              <span className={cn('inline-flex items-center gap-1 rounded px-1', card.dueComplete && 'bg-ok-soft text-ok')}>
                <Clock aria-hidden="true" className="size-3.5" /> {formatShortDate(card.due)}
              </span>
            )}
            {items.length > 0 && (
              <span className={cn('inline-flex items-center gap-1 rounded px-1', done === items.length && 'bg-ok-soft text-ok')}>
                <CheckSquare aria-hidden="true" className="size-3.5" /> {done}/{items.length}
              </span>
            )}
            {card.bookingId && <span className="font-medium text-primary">Booking</span>}
          </span>
        </summary>
        <div className="space-y-3 border-t border-line p-3 text-sm">
          {card.description && <p className="whitespace-pre-line text-ink-muted [overflow-wrap:anywhere]">{card.description}</p>}
          {card.checklists.map((checklist, i) => (
            <div key={i}>
              <p className="font-medium">{checklist.name}</p>
              <ul className="mt-1 space-y-0.5">
                {checklist.items.map((item, j) => (
                  <li key={j} className={cn('flex gap-2', item.complete && 'text-ink-muted line-through')}>
                    <span aria-hidden="true">{item.complete ? '☑' : '☐'}</span>
                    <span className="sr-only">{item.complete ? 'Færdig: ' : 'Ikke færdig: '}</span>
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            {card.bookingId && <Link to={`/bookinger/${card.bookingId}`} className="inline-flex min-h-11 items-center font-medium text-primary">Åbn booking</Link>}
            {card.url && (
              <a href={card.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 font-medium text-primary">
                Åbn i Trello <ArrowSquareOut aria-hidden="true" className="size-4" />
              </a>
            )}
          </div>
        </div>
      </details>
    </li>
  );
}
