import { useState, type FormEvent } from 'react';
import { CheckCircle, CircleDashed, CircleHalf, Plus, Trash } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Segmented } from '@/components/ui/Segmented';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { TextArea } from '@/components/ui/TextArea';
import { errorMessage } from '@/lib/api/errorMessage';
import type { ReadinessCategory, ReadinessItem, ReadinessStatus } from '@/lib/api/types';
import { formatDateTime } from '@/lib/format';
import { readinessCategoryLabels, readinessStatusLabels, readinessStatusTones } from '@/lib/labels';
import { usePermissions } from '@/features/auth/permissions';
import { useReadiness, useReadinessActions } from '@/features/readiness/api/readiness';

const statusIcons = { NotStarted: CircleDashed, InProgress: CircleHalf, Done: CheckCircle } as const;

/**
 * What the green fields on the Trello card do today. "Klar til afholdelse"
 * comes from the API when every item before the day is done — nobody sets it.
 */
export function ReadinessCard({ bookingId }: { bookingId: string }) {
  const query = useReadiness(bookingId);
  const { manages } = usePermissions();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <Card>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Klargøring</h2>
        {query.data &&
          (query.data.readyForEvent ? (
            <Badge tone="ok">Klar til afholdelse</Badge>
          ) : (
            <Badge tone="neutral">
              {query.data.items.filter((i) => i.category !== 'PostEventInvoicing' && i.status === 'Done').length} af{' '}
              {query.data.items.filter((i) => i.category !== 'PostEventInvoicing').length} færdige
            </Badge>
          ))}
      </div>
      {query.isPending && <Spinner label="Henter" />}
      {query.isError && <Alert tone="danger">{errorMessage(query.error)}</Alert>}
      {query.data && (
        <>
          <p className="text-sm text-ink-muted">
            Kuverter: <span className="font-semibold text-ink tabular">{query.data.guestCount}</span>
          </p>
          <ul className="mt-2 divide-y divide-line">
            {query.data.items.map((item) =>
              open === item.id && item.canEdit ? (
                <li key={item.id} className="py-3">
                  <ItemEditor bookingId={bookingId} item={item} onDone={() => setOpen(null)} canRemove={manages} />
                </li>
              ) : (
                <ItemRow key={item.id} item={item} onOpen={item.canEdit ? () => setOpen(item.id) : undefined} />
              ),
            )}
          </ul>
          {manages && <AddItem bookingId={bookingId} />}
        </>
      )}
    </Card>
  );
}

function ItemRow({ item, onOpen }: { item: ReadinessItem; onOpen?: () => void }) {
  const Icon = statusIcons[item.status];
  const content = (
    <>
      <Icon
        aria-hidden="true"
        weight={item.status === 'Done' ? 'fill' : 'bold'}
        className={`mt-0.5 size-6 shrink-0 ${item.status === 'Done' ? 'text-ok' : item.status === 'InProgress' ? 'text-warn' : 'text-ink-muted'}`}
      />
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{item.title}</span>
        {item.notes && <span className="mt-0.5 block text-sm whitespace-pre-line text-ink [overflow-wrap:anywhere]">{item.notes}</span>}
        <span className="mt-0.5 block text-xs text-ink-muted">
          {[item.responsible && `Ansvarlig: ${item.responsible}`, item.updatedBy && `${item.updatedBy}, ${formatDateTime(item.updatedAt)}`]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </span>
      <Badge tone={readinessStatusTones[item.status]}>{readinessStatusLabels[item.status]}</Badge>
    </>
  );

  return (
    <li>
      {onOpen ? (
        <button type="button" onClick={onOpen} className="flex w-full cursor-pointer items-start gap-3 py-3 text-left hover:bg-neutral-soft/60">
          {content}
        </button>
      ) : (
        <div className="flex items-start gap-3 py-3">{content}</div>
      )}
    </li>
  );
}

function ItemEditor({ bookingId, item, onDone, canRemove }: { bookingId: string; item: ReadinessItem; onDone: () => void; canRemove: boolean }) {
  const { update, remove } = useReadinessActions(bookingId);
  const [status, setStatus] = useState<ReadinessStatus>(item.status);
  const [notes, setNotes] = useState(item.notes ?? '');
  const [responsible, setResponsible] = useState(item.responsible ?? '');

  function submit(event: FormEvent) {
    event.preventDefault();
    update.mutate({ itemId: item.id, body: { status, notes: notes || null, responsible: responsible || null } }, { onSuccess: onDone });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="font-medium">{item.title}</p>
      <Segmented
        label="Status"
        value={status}
        onChange={setStatus}
        options={(['NotStarted', 'InProgress', 'Done'] as const).map((value) => ({ value, label: readinessStatusLabels[value] }))}
      />
      <TextArea
        label="Noter"
        rows={4}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={item.category === 'Food' ? 'Fx 2 vegetarer, 1 glutenfri, 1 laktosefri' : undefined}
        hint={item.category === 'PostEventInvoicing' ? '"I gang" betyder, at der er tillæg, der mangler at blive faktureret.' : undefined}
      />
      <Field label="Ansvarlig" value={responsible} onChange={(e) => setResponsible(e.target.value)} />
      {(update.isError || remove.isError) && <Alert tone="danger">{errorMessage(update.error ?? remove.error)}</Alert>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={update.isPending}>
          Gem
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Annullér
        </Button>
        {canRemove && (
          <Button
            variant="ghost"
            className="ml-auto text-danger"
            aria-label={`Fjern ${item.title}`}
            onClick={() => window.confirm(`Fjern "${item.title}"?`) && remove.mutate(item.id, { onSuccess: onDone })}
          >
            <Trash aria-hidden="true" className="size-5" />
          </Button>
        )}
      </div>
    </form>
  );
}

function AddItem({ bookingId }: { bookingId: string }) {
  const { add } = useReadinessActions(bookingId);
  const [adding, setAdding] = useState(false);
  const [category, setCategory] = useState<ReadinessCategory>('Decoration');
  const [title, setTitle] = useState('');

  if (!adding) {
    return (
      <Button variant="ghost" className="mt-2" onClick={() => setAdding(true)}>
        <Plus aria-hidden="true" className="size-5" /> Tilføj punkt
      </Button>
    );
  }
  return (
    <form
      className="mt-3 space-y-3 border-t border-line pt-4"
      onSubmit={(e) => {
        e.preventDefault();
        add.mutate({ category, title: title.trim() }, { onSuccess: () => { setAdding(false); setTitle(''); } });
      }}
    >
      <Select
        label="Kategori"
        value={category}
        onChange={(e) => setCategory(e.target.value as ReadinessCategory)}
        options={(Object.keys(readinessCategoryLabels) as ReadinessCategory[]).map((c) => ({ value: c, label: readinessCategoryLabels[c] }))}
      />
      <Field label="Titel" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Fx Vielse i haven: stole og buket" />
      {add.isError && <Alert tone="danger">{errorMessage(add.error)}</Alert>}
      <div className="flex gap-2">
        <Button type="submit" loading={add.isPending} disabled={!title.trim()}>
          Tilføj
        </Button>
        <Button variant="ghost" onClick={() => setAdding(false)}>
          Annullér
        </Button>
      </div>
    </form>
  );
}
