import { useState, type FormEvent } from 'react';
import type { ReactNode } from 'react';
import { CaretDown, Plus, Trash } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { errorMessage } from '@/lib/api/errorMessage';
import type { HostWeek, Window } from '@/lib/api/types';
import { useAvailability, useCalendarActions, useSlots } from '@/features/calendar/api/calendar';

const slotFormat = new Intl.DateTimeFormat('da-DK', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const days: { value: Window['day']; label: string }[] = [
  { value: 'Monday', label: 'Mandag' },
  { value: 'Tuesday', label: 'Tirsdag' },
  { value: 'Wednesday', label: 'Onsdag' },
  { value: 'Thursday', label: 'Torsdag' },
  { value: 'Friday', label: 'Fredag' },
  { value: 'Saturday', label: 'Lørdag' },
  { value: 'Sunday', label: 'Søndag' },
];

/** The next free viewing times, worked out by the API from the host's week and what is taken. */
export function SlotsCard() {
  const hosts = useAvailability();
  const [hostId, setHostId] = useState('');
  const slots = useSlots(hostId || undefined);

  return (
    <Card>
      <h2 className="text-xl font-medium">Næste ledige fremvisninger</h2>
      <Select
        className="mt-3"
        label="Vært"
        value={hostId}
        onChange={(e) => setHostId(e.target.value)}
        options={[{ value: '', label: 'Alle med en ugeplan' }, ...(hosts.data ?? []).map((h) => ({ value: h.hostId, label: h.hostName }))]}
      />
      <div className="mt-3">
        {slots.isPending && <Spinner label="Finder tider" />}
        {slots.isError && <Alert tone="danger">{errorMessage(slots.error)}</Alert>}
        {slots.data?.length === 0 && <p className="text-sm text-ink-muted">Ingen ledige tider. Sæt en ugeplan nedenfor.</p>}
        <ol className="space-y-1">
          {slots.data?.map((s) => (
            <li key={s.start + s.hostId} className="flex justify-between gap-3 text-sm">
              <span className="first-letter:uppercase">{slotFormat.format(new Date(s.start))}</span>
              <span className="text-ink-muted">{s.hostName}</span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}

export function BlockCard() {
  const { block } = useCalendarActions();
  const hosts = useAvailability();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');
  const [hostId, setHostId] = useState('');
  const valid = start && end && end > start && reason.trim();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    block.mutate(
      { start: new Date(start).toISOString(), end: new Date(end).toISOString(), reason: reason.trim(), hostId: hostId || null },
      { onSuccess: () => { setStart(''); setEnd(''); setReason(''); } },
    );
  }

  return (
    <Foldout title="Blokér tid" hint="Ferie, julemarked, en vært der er væk.">
      <form onSubmit={submit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Field label="Fra" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required />
          <Field label="Til" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required />
        </div>
        <Field label="Årsag" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Fx Ferie, julemarked" required />
        <Select
          label="Gælder"
          value={hostId}
          onChange={(e) => setHostId(e.target.value)}
          options={[{ value: '', label: 'Hele godset' }, ...(hosts.data ?? []).map((h) => ({ value: h.hostId, label: h.hostName }))]}
        />
        {block.isError && <Alert tone="danger">{errorMessage(block.error)}</Alert>}
        <Button type="submit" size="sm" loading={block.isPending} disabled={!valid}>Blokér</Button>
      </form>
    </Foldout>
  );
}

/** Each host's week: the windows in which they can show a couple round. */
export function AvailabilityCard() {
  const weeks = useAvailability();
  return (
    <Foldout title="Ugeplan for fremvisninger" hint="En fremvisning tager en time. Ledige tider findes i hele timer inden for tidsrummene.">
      {weeks.isPending && <Spinner label="Henter" />}
      <div className="mt-3 space-y-5">
        {weeks.data?.map((week) => <HostWeekForm key={week.hostId + JSON.stringify(week.windows)} week={week} />)}
      </div>
    </Foldout>
  );
}

function HostWeekForm({ week }: { week: HostWeek }) {
  const { setAvailability } = useCalendarActions();
  const [windows, setWindows] = useState<Window[]>(week.windows.map((w) => ({ ...w, from: w.from.slice(0, 5), to: w.to.slice(0, 5) })));
  const set = (index: number, patch: Partial<Window>) => setWindows(windows.map((w, i) => (i === index ? { ...w, ...patch } : w)));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setAvailability.mutate({ hostId: week.hostId, windows: windows.map((w) => ({ ...w, from: `${w.from}:00`, to: `${w.to}:00` })) });
      }}
      className="space-y-2"
    >
      <h3 className="font-medium">{week.hostName}</h3>
      {windows.length === 0 && <p className="text-sm text-ink-muted">Ingen tider — viser ikke rundt.</p>}
      {windows.map((w, i) => (
        <div key={i} className="grid grid-cols-[1fr_5.5rem_5.5rem_auto] items-end gap-2">
          <Select label="Dag" value={w.day} onChange={(e) => set(i, { day: e.target.value as Window['day'] })} options={days} />
          <Field label="Fra" type="time" value={w.from} onChange={(e) => set(i, { from: e.target.value })} />
          <Field label="Til" type="time" value={w.to} onChange={(e) => set(i, { to: e.target.value })} />
          <Button size="sm" variant="ghost" aria-label="Fjern tidsrum" onClick={() => setWindows(windows.filter((_, j) => j !== i))}>
            <Trash aria-hidden="true" className="size-5" />
          </Button>
        </div>
      ))}
      {setAvailability.isError && <Alert tone="danger">{errorMessage(setAvailability.error)}</Alert>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={() => setWindows([...windows, { day: 'Tuesday', from: '10:00', to: '16:00' }])}>
          <Plus aria-hidden="true" className="size-4" /> Tidsrum
        </Button>
        <Button type="submit" size="sm" variant="secondary" loading={setAvailability.isPending}>Gem ugeplan</Button>
      </div>
    </form>
  );
}

/** A tool you reach for now and then: folded until you need it, on the same page. */
function Foldout({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <details className="group rounded-card bg-surface shadow-card ring-1 ring-line/60">
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="flex-1">
          <span className="block font-display text-xl font-medium">{title}</span>
          <span className="block text-sm text-ink-muted">{hint}</span>
        </span>
        <CaretDown aria-hidden="true" className="size-4 shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  );
}
