import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Segmented } from '@/components/ui/Segmented';
import { Select } from '@/components/ui/Select';
import { errorMessage } from '@/lib/api/errorMessage';
import type { LineRequest, ProductGroup } from '@/lib/api/types';
import { parseKroner } from '@/lib/format';
import { emptyLine, toRequest, type LineDraft } from '@/components/lines/lineDraft';
import { productGroupLabels } from '@/lib/labels';

const groupOptions = (Object.keys(productGroupLabels) as ProductGroup[]).map((group) => ({ value: group, label: productGroupLabels[group] }));

export function LineFields({ draft, onChange }: { draft: LineDraft; onChange: (draft: LineDraft) => void }) {
  const set = <K extends keyof LineDraft>(key: K, value: LineDraft[K]) => onChange({ ...draft, [key]: value });
  return (
    <div className="space-y-3">
      <Field label="Beskrivelse" value={draft.description} onChange={(e) => set('description', e.target.value)} required />
      <Select label="Varegruppe" value={draft.group} options={groupOptions} onChange={(e) => set('group', e.target.value as ProductGroup)} />
      <Segmented
        label="Pris"
        value={draft.pricing}
        onChange={(value) => set('pricing', value)}
        options={[
          { value: 'PerGuest', label: 'Pr. gæst' },
          { value: 'Fixed', label: 'Fast antal' },
        ]}
        hint={draft.pricing === 'PerGuest' ? 'Ganges med bookingens gæsteantal og følger det af sig selv.' : 'Ganges med linjens eget antal.'}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label={draft.pricing === 'PerGuest' ? 'Pris pr. gæst (kr.)' : 'Stykpris (kr.)'}
          inputMode="decimal"
          value={draft.unitPrice}
          onChange={(e) => set('unitPrice', e.target.value)}
          error={draft.unitPrice && parseKroner(draft.unitPrice) === null ? 'Skriv et beløb, fx 1495' : undefined}
          required
        />
        {draft.pricing === 'Fixed' && (
          <Field label="Antal" type="number" inputMode="numeric" min={1} value={draft.quantity} onChange={(e) => set('quantity', e.target.value)} required />
        )}
      </div>
      {draft.pricing === 'Fixed' && (
        <Field
          label="Minimum (valgfrit)"
          type="number"
          inputMode="numeric"
          min={1}
          value={draft.minimumQuantity}
          onChange={(e) => set('minimumQuantity', e.target.value)}
          hint="Fx 30 for fredagsarrangementet."
        />
      )}
    </div>
  );
}

/** A line on its own, saved on submit — for adding or changing one line on a booking. */
export function LineForm({ initial, pending, error, submitLabel, onSubmit, onCancel, onRemove }: {
  initial?: LineDraft;
  pending: boolean;
  error: unknown;
  submitLabel: string;
  onSubmit: (request: LineRequest) => void;
  onCancel: () => void;
  onRemove?: () => void;
}) {
  const [draft, setDraft] = useState(initial ?? emptyLine);
  const request = toRequest(draft);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (request) onSubmit(request);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <LineFields draft={draft} onChange={setDraft} />
      {Boolean(error) && <Alert tone="danger">{errorMessage(error)}</Alert>}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={pending} disabled={!request}>
          {submitLabel}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Annullér
        </Button>
        {onRemove && (
          <Button variant="ghost" className="ml-auto text-danger" onClick={onRemove}>
            Fjern
          </Button>
        )}
      </div>
    </form>
  );
}
