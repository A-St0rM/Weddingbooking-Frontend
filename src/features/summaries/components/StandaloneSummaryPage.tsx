import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkle } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextArea } from '@/components/ui/TextArea';
import { ApiError } from '@/lib/api/errors';
import { errorMessage } from '@/lib/api/errorMessage';
import { useStandaloneSummary } from '@/features/summaries/api/summaries';
import { SummaryView } from '@/features/summaries/components/SummaryView';

/**
 * The AI summary on its own: paste a mail thread, get status, agreed content,
 * open items and last contact. No login and no database behind it.
 */
export function StandaloneSummaryPage() {
  const summary = useStandaloneSummary();
  const [text, setText] = useState('');
  const limited = summary.error instanceof ApiError && summary.error.status === 429;

  return (
    <main className="safe-x mx-auto min-h-dvh max-w-2xl py-8">
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">Engestofte Gods</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Resumé af en sag</h1>
      <p className="mt-2 text-ink-muted">Indsæt mails og noter om et bryllup. Resuméet er et forslag og gemmes ingen steder.</p>

      <Card className="mt-6">
        <TextArea
          label="Mails og noter"
          rows={12}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Fx: Hej Johan, vi har snakket om det, og vi vil gerne vente med morgenmaden. Vi vender tilbage efter nytår …"
          hint="Brug opdigtede eller anonymiserede data i demoer — allergier er helbredsoplysninger."
        />
        <Button className="mt-3" loading={summary.isPending} disabled={!text.trim()} onClick={() => summary.mutate(text)}>
          <Sparkle aria-hidden="true" className="size-5" /> Lav resumé
        </Button>
        {summary.isError && (
          <Alert tone="danger" className="mt-3">
            {limited ? 'For mange resuméer på kort tid. Vent et minut, og prøv igen.' : errorMessage(summary.error)}
          </Alert>
        )}
      </Card>

      {summary.data && (
        <Card className="mt-4">
          <SummaryView result={summary.data} />
        </Card>
      )}

      <Link to="/" className="mt-6 inline-flex min-h-11 items-center font-medium text-primary">
        Til bookingsystemet
      </Link>
    </main>
  );
}
