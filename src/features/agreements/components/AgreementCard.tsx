import { useRef, useState } from 'react';
import { CheckCircle, FilePdf, Paperclip, UploadSimple } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { TextArea } from '@/components/ui/TextArea';
import { errorMessage } from '@/lib/api/errorMessage';
import type { Booking } from '@/lib/api/types';
import { formatDateTime, formatShortDate } from '@/lib/format';
import { usePermissions } from '@/features/auth/permissions';
import { useAgreement, useAgreementActions, type Agreement, type AgreementVersion } from '@/features/agreements/api/agreements';

/**
 * The agreement confirmation. Couple, date, guest count and every agreed line
 * come from the booking; the clarification is the only thing written here —
 * what used to be done by editing a Word document.
 */
export function AgreementCard({ booking }: { booking: Booking }) {
  const query = useAgreement(booking.id);
  return (
    <Card>
      <h2 className="mb-3 text-xl font-medium">Aftalebekræftelse</h2>
      {query.isPending && <Spinner label="Henter" />}
      {query.isError && <Alert tone="danger">{errorMessage(query.error)}</Alert>}
      {query.data && <AgreementBody key={query.data.clarification ?? ''} booking={booking} agreement={query.data} />}
    </Card>
  );
}

function AgreementBody({ booking, agreement }: { booking: Booking; agreement: Agreement }) {
  const { manages } = usePermissions();
  const actions = useAgreementActions(booking.id);
  const [clarification, setClarification] = useState(agreement.clarification ?? '');
  const error = [actions.preview, actions.generate, actions.uploadSigned, actions.attachToQuote, actions.download].find((m) => m.isError)?.error;
  const hasLines = booking.lines.length > 0;

  return (
    <div className="space-y-4">
      {manages && (
        <>
          <TextArea
            label="Præciseringer"
            value={clarification}
            onChange={(e) => setClarification(e.target.value)}
            placeholder="Fx: Morgenmad dagen efter — rundstykker, pålæg, kaffe og juice til alle overnattende gæster."
            hint="Kommer med i aftalen under navn, dato, gæsteantal og det aftalte, som hentes fra bookingen."
          />
          {!hasLines && <p className="text-sm text-warn">Læg en pakke på bookingen, så aftalen har noget indhold.</p>}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" loading={actions.preview.isPending} onClick={() => actions.preview.mutate(clarification)}>
              Forhåndsvis
            </Button>
            <Button loading={actions.generate.isPending} disabled={!hasLines} onClick={() => actions.generate.mutate(clarification)}>
              Gem som ny version
            </Button>
          </div>
        </>
      )}

      {Boolean(error) && <Alert tone="danger">{errorMessage(error)}</Alert>}
      {actions.attachToQuote.isSuccess && <Alert tone="ok">Aftalen er vedhæftet tilbuddet i regnskabet.</Alert>}

      {agreement.versions.length === 0 ? (
        <p className="text-sm text-ink-muted">Ingen versioner endnu.</p>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {agreement.versions.map((version, index) => (
            <VersionRow key={version.id} version={version} latest={index === 0} actions={actions} manages={manages} />
          ))}
        </ul>
      )}
    </div>
  );
}

function VersionRow({ version, latest, actions, manages }: {
  version: AgreementVersion;
  latest: boolean;
  actions: ReturnType<typeof useAgreementActions>;
  manages: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium">Version {version.number}</p>
        {latest && <Badge tone="neutral">Nyeste</Badge>}
        {version.signedAt && (
          <Badge tone="ok">
            <CheckCircle aria-hidden="true" weight="fill" className="mr-1 size-3.5" />
            Underskrevet {formatShortDate(version.signedAt)}
          </Badge>
        )}
      </div>
      <p className="text-sm text-ink-muted">
        {formatDateTime(version.generatedAt)} · {version.generatedBy}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={() => actions.download.mutate({ version, signed: false })}>
          <FilePdf aria-hidden="true" className="size-5" /> PDF
        </Button>
        {version.signedAt && (
          <Button size="sm" variant="ghost" onClick={() => actions.download.mutate({ version, signed: true })}>
            <FilePdf aria-hidden="true" className="size-5" /> Underskrevet
          </Button>
        )}
        {manages && !version.signedAt && (
          <>
            <input
              ref={input}
              type="file"
              accept="application/pdf"
              className="sr-only"
              aria-label={`Upload underskrevet version ${version.number}`}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) actions.uploadSigned.mutate({ versionId: version.id, file });
                e.target.value = '';
              }}
            />
            <Button size="sm" variant="secondary" loading={actions.uploadSigned.isPending} onClick={() => input.current?.click()}>
              <UploadSimple aria-hidden="true" className="size-5" /> Upload underskrevet
            </Button>
          </>
        )}
        {manages && latest && (
          <Button size="sm" variant="ghost" loading={actions.attachToQuote.isPending} onClick={() => actions.attachToQuote.mutate(version.id)}>
            <Paperclip aria-hidden="true" className="size-5" /> Vedhæft til tilbud
          </Button>
        )}
      </div>
    </li>
  );
}
