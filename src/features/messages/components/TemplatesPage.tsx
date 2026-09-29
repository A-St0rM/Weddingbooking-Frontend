import { useState, type FormEvent } from 'react';
import { PencilSimple, Plus } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { TextArea } from '@/components/ui/TextArea';
import { errorMessage } from '@/lib/api/errorMessage';
import type { MessageTemplate } from '@/lib/api/types';
import { usePlaceholders, useTemplateActions, useTemplates } from '@/features/messages/api/messages';

export function TemplatesPage() {
  const query = useTemplates();
  const placeholders = usePlaceholders();
  const [editing, setEditing] = useState<string | 'new' | null>(null);

  return (
    <>
      <PageHeader
        title="Tekstbidder"
        description="De faste mails. Pladsholderne udfyldes fra bookingen, og teksten kan altid rettes, før den sendes."
        actions={editing === null && <Button size="sm" onClick={() => setEditing('new')}><Plus aria-hidden="true" weight="bold" className="size-4" /> Ny</Button>}
      />
      {editing === 'new' && <TemplateForm onDone={() => setEditing(null)} />}
      <QueryState query={query}>
        {(templates) => (
          <ul className="mt-4 space-y-3">
            {templates.map((template) =>
              editing === template.id ? (
                <li key={template.id}><TemplateForm template={template} onDone={() => setEditing(null)} /></li>
              ) : (
                <li key={template.id} className="rounded-card bg-surface p-5 shadow-card ring-1 ring-line/60">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-ink-muted">{template.subject}</p>
                      {template.ccViewingHost && <Badge tone="info" className="mt-2">Værten på CC</Badge>}
                    </div>
                    <Button size="sm" variant="ghost" aria-label={`Ret ${template.name}`} onClick={() => setEditing(template.id)}>
                      <PencilSimple aria-hidden="true" className="size-5" />
                    </Button>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm whitespace-pre-line text-ink-muted">{template.body}</p>
                </li>
              ),
            )}
          </ul>
        )}
      </QueryState>

      {placeholders.data && (
        <Card className="mt-6">
          <h2 className="font-semibold">Pladsholdere</h2>
          <dl className="mt-2 space-y-1 text-sm">
            {placeholders.data.map((p) => (
              <div key={p.name} className="flex flex-wrap gap-x-3">
                <dt className="font-mono">{`{{${p.name}}}`}</dt>
                <dd className="text-ink-muted">{p.description}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}
    </>
  );
}

function TemplateForm({ template, onDone }: { template?: MessageTemplate; onDone: () => void }) {
  const { save, remove } = useTemplateActions();
  const [name, setName] = useState(template?.name ?? '');
  const [subject, setSubject] = useState(template?.subject ?? '');
  const [body, setBody] = useState(template?.body ?? '');
  const [cc, setCc] = useState(template?.ccViewingHost ?? false);

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate({ id: template?.id, body: { name, subject, body, ccViewingHost: cc } }, { onSuccess: onDone });
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Navn" value={name} onChange={(e) => setName(e.target.value)} required />
        <Field label="Emne" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        <TextArea label="Tekst" rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" checked={cc} onChange={(e) => setCc(e.target.checked)} className="size-5 accent-primary" />
          Sæt værten for fremvisningen på CC
        </label>
        {(save.isError || remove.isError) && <Alert tone="danger">{errorMessage(save.error ?? remove.error)}</Alert>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={save.isPending} disabled={!name.trim() || !subject.trim() || !body.trim()}>Gem</Button>
          <Button variant="ghost" onClick={onDone}>Annullér</Button>
          {template && (
            <Button variant="ghost" className="ml-auto text-danger" onClick={() => window.confirm(`Slet "${template.name}"?`) && remove.mutate(template.id, { onSuccess: onDone })}>
              Slet
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
