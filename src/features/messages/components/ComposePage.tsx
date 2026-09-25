import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PaperPlaneTilt } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { SimulatedOutboxBadge } from '@/components/ui/SimulatedOutboxBadge';
import { TextArea } from '@/components/ui/TextArea';
import { errorMessage } from '@/lib/api/errorMessage';
import type { MessageDraft } from '@/lib/api/types';
import { useBooking } from '@/features/bookings/api/bookings';
import { useDraft, useSend, useTemplates } from '@/features/messages/api/messages';

const split = (value: string) => value.split(/[,;\s]+/).map((a) => a.trim()).filter(Boolean);

/**
 * A mail to the couple. The template and the booking give a suggestion; the
 * text is always shown and can be changed, and only pressing Send sends it.
 */
export function ComposePage() {
  const { id = '' } = useParams();
  const booking = useBooking(id);
  const templates = useTemplates();
  const draft = useDraft(id);
  const [templateId, setTemplateId] = useState('');

  return (
    <>
      <BackLink to={`/bookinger/${id}`}>{booking.data?.customer.name ?? 'Booking'}</BackLink>
      <PageHeader title="Skriv mail" actions={<SimulatedOutboxBadge />} />

      <Card className="space-y-3">
        <Select
          label="Tekstbid"
          value={templateId}
          onChange={(e) => {
            setTemplateId(e.target.value);
            if (e.target.value) draft.mutate(e.target.value);
          }}
          options={[{ value: '', label: 'Vælg en tekstbid' }, ...(templates.data ?? []).map((t) => ({ value: t.id, label: t.name }))]}
        />
        {draft.isError && <Alert tone="danger">{errorMessage(draft.error)}</Alert>}
      </Card>

      {draft.data && <Composer key={draft.data.templateId + draft.submittedAt} bookingId={id} draft={draft.data} />}
    </>
  );
}

function Composer({ bookingId, draft }: { bookingId: string; draft: MessageDraft }) {
  const navigate = useNavigate();
  const send = useSend(bookingId);
  const [to, setTo] = useState(draft.to.join(', '));
  const [cc, setCc] = useState(draft.cc.join(', '));
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const recipients = split(to);
  const stillMissing = draft.missing.filter((name) => body.includes(`{{${name}}}`) || subject.includes(`{{${name}}}`));

  return (
    <div className="mt-4 space-y-4">
      {stillMissing.length > 0 && (
        <Alert tone="warn" title="Der mangler noget i teksten">
          Bookingen har ingen værdi for {stillMissing.map((m) => `{{${m}}}`).join(', ')}. Skriv det ind i teksten, eller udfyld det på bookingen først.
        </Alert>
      )}
      <Card className="space-y-3">
        <Field label="Til" type="email" inputMode="email" autoCapitalize="none" multiple value={to} onChange={(e) => setTo(e.target.value)} hint="Flere adresser adskilles med komma." />
        <Field label="CC" type="email" inputMode="email" autoCapitalize="none" multiple value={cc} onChange={(e) => setCc(e.target.value)} />
        <Field label="Emne" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <TextArea
          label="Tekst"
          rows={16}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          hint="Tilføj gerne en personlig sætning. Intet sendes, før du trykker Send."
        />
      </Card>

      {send.isError && <Alert tone="danger">{errorMessage(send.error)}</Alert>}

      <div className="pb-safe space-y-2">
        <p className="text-sm text-ink-muted">
          Sendes til {recipients.join(', ') || 'ingen'}
          {split(cc).length > 0 && ` med ${split(cc).join(', ')} på CC`}.
        </p>
        <Button
          className="w-full sm:w-auto"
          loading={send.isPending}
          disabled={recipients.length === 0 || !subject.trim() || !body.trim()}
          onClick={() =>
            send.mutate({ to: recipients, cc: split(cc), subject, body }, { onSuccess: () => navigate(`/bookinger/${bookingId}`, { state: { sent: true } }) })
          }
        >
          <PaperPlaneTilt aria-hidden="true" className="size-5" /> Send
        </Button>
      </div>
    </div>
  );
}
