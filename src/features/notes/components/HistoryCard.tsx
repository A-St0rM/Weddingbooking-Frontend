import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ChatText, EnvelopeSimple, PaperPlaneTilt, Phone } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Segmented } from '@/components/ui/Segmented';
import { Spinner } from '@/components/ui/Spinner';
import { TextArea } from '@/components/ui/TextArea';
import { errorMessage } from '@/lib/api/errorMessage';
import type { Note, NoteType } from '@/lib/api/types';
import { formatDateTime } from '@/lib/format';
import { usePermissions } from '@/features/auth/permissions';
import { useNotes, useWriteNote } from '@/features/notes/api/notes';

const typeLabels: Record<NoteType, string> = { Call: 'Opkald', Email: 'Mail', Internal: 'Intern' };

/**
 * Who spoke to the couple, when, about what — and every mail sent from here.
 * What Johan goes back to when a couple rings in November.
 */
export function HistoryCard({ bookingId }: { bookingId: string }) {
  const { manages } = usePermissions();
  const notes = useNotes(bookingId);
  const write = useWriteNote(bookingId);
  const [type, setType] = useState<NoteType>('Call');
  const [text, setText] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    write.mutate({ type, text }, { onSuccess: () => setText('') });
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Historik</h2>
        {manages && (
          <Link
            to={`/bookinger/${bookingId}/mail`}
            className="inline-flex min-h-11 items-center gap-2 rounded-control border border-control px-4 text-sm font-medium hover:bg-neutral-soft"
          >
            <PaperPlaneTilt aria-hidden="true" className="size-5" /> Skriv mail
          </Link>
        )}
      </div>

      <form onSubmit={submit} className="space-y-3">
        <Segmented
          label="Ny note"
          value={type}
          onChange={setType}
          options={(['Call', 'Email', 'Internal'] as const).map((value) => ({ value, label: typeLabels[value] }))}
        />
        <TextArea
          label={type === 'Email' ? 'Indsæt mailen' : 'Hvad blev der sagt?'}
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={type === 'Call' ? 'Fx Ringede — vender tilbage efter nytår om morgenmaden.' : undefined}
        />
        {write.isError && <Alert tone="danger">{errorMessage(write.error)}</Alert>}
        <Button type="submit" size="sm" loading={write.isPending} disabled={!text.trim()}>
          Gem note
        </Button>
      </form>

      <div className="mt-5 border-t border-line pt-3">
        {notes.isPending && <Spinner label="Henter" />}
        {notes.data?.length === 0 && <p className="text-sm text-ink-muted">Ingen historik endnu.</p>}
        <ol className="space-y-4">
          {notes.data?.map((note) => <NoteItem key={note.id} note={note} />)}
        </ol>
      </div>
    </Card>
  );
}

function NoteItem({ note }: { note: Note }) {
  const [open, setOpen] = useState(false);
  const Icon = note.recipients ? PaperPlaneTilt : note.type === 'Call' ? Phone : note.type === 'Email' ? EnvelopeSimple : ChatText;
  const long = note.text.length > 280;
  return (
    <li className="flex gap-3">
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-ink-muted" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink-muted">
          {formatDateTime(note.createdAt)} · {note.authorName} · {note.recipients ? 'Sendt mail' : typeLabels[note.type]}
        </p>
        {note.recipients && <p className="text-sm font-medium [overflow-wrap:anywhere]">{note.recipients}</p>}
        {note.subject && <p className="text-sm font-semibold">{note.subject}</p>}
        <p className={`mt-0.5 text-sm whitespace-pre-line [overflow-wrap:anywhere] ${long && !open ? 'line-clamp-4' : ''}`}>{note.text}</p>
        {long && (
          <button type="button" className="mt-1 min-h-11 cursor-pointer text-sm font-medium text-primary" onClick={() => setOpen(!open)}>
            {open ? 'Vis mindre' : 'Vis hele'}
          </button>
        )}
      </div>
    </li>
  );
}
