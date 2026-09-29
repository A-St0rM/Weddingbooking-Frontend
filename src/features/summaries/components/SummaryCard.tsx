import { useState } from 'react';
import { Sparkle } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextArea } from '@/components/ui/TextArea';
import { errorMessage } from '@/lib/api/errorMessage';
import { useWriteNote } from '@/features/notes/api/notes';
import { useBookingSummary } from '@/features/summaries/api/summaries';
import { SummaryView } from '@/features/summaries/components/SummaryView';

/**
 * Where does this case stand? Built from the booking and its history each time
 * it is asked for. It is only saved if someone chooses to keep it as a note.
 */
export function SummaryCard({ bookingId }: { bookingId: string }) {
  const summary = useBookingSummary(bookingId);
  const saveNote = useWriteNote(bookingId);
  const [extra, setExtra] = useState('');
  const [showExtra, setShowExtra] = useState(false);

  const asText = () => {
    const s = summary.data!.summary;
    return [`AI-resumé: ${s.status}`, `Aftalt: ${s.agreedContent}`, `Åbne punkter: ${s.openItems.join('; ') || 'ingen'}`, `Sidste kontakt: ${s.lastContact}`].join('\n');
  };

  return (
    <Card>
      <h2 className="mb-3 text-xl font-medium">Resumé</h2>
      {showExtra ? (
        <TextArea label="Indsæt en mailtråd (gemmes ikke)" rows={5} value={extra} onChange={(e) => setExtra(e.target.value)} className="mb-3" />
      ) : (
        <button type="button" className="mb-2 min-h-11 cursor-pointer text-sm font-medium text-primary" onClick={() => setShowExtra(true)}>
          + Tag en mailtråd med
        </button>
      )}
      <Button variant="secondary" loading={summary.isPending} onClick={() => summary.mutate(extra)}>
        <Sparkle aria-hidden="true" className="size-5" /> {summary.data ? 'Lav nyt resumé' : 'Lav resumé'}
      </Button>
      {summary.isError && <Alert tone="danger" className="mt-3">{errorMessage(summary.error)}</Alert>}
      {summary.data && (
        <div className="mt-4 border-t border-line pt-4">
          <SummaryView result={summary.data} />
          <Button
            size="sm"
            variant="ghost"
            className="mt-3"
            loading={saveNote.isPending}
            disabled={saveNote.isSuccess}
            onClick={() => saveNote.mutate({ type: 'Internal', text: asText() })}
          >
            {saveNote.isSuccess ? 'Gemt i historikken' : 'Gem som note'}
          </Button>
        </div>
      )}
    </Card>
  );
}
