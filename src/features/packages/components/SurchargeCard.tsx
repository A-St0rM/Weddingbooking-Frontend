import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { errorMessage } from '@/lib/api/errorMessage';
import type { PricingSettings } from '@/lib/api/types';
import { formatKroner, kronerInput, parseKroner } from '@/lib/format';
import { usePermissions } from '@/features/auth/permissions';
import { usePricingSettings, useUpdatePricingSettings } from '@/features/packages/api/packages';

export function SurchargeCard() {
  const settings = usePricingSettings();
  if (!settings.data) return null;
  return <SurchargeForm key={settings.data.updatedAt} settings={settings.data} />;
}

function SurchargeForm({ settings }: { settings: PricingSettings }) {
  const { manages } = usePermissions();
  const update = useUpdatePricingSettings();
  const [threshold, setThreshold] = useState(String(settings.smallWeddingThreshold));
  const [amount, setAmount] = useState(kronerInput(settings.smallWeddingSurcharge));
  const parsedThreshold = Number.parseInt(threshold, 10);
  const parsedAmount = parseKroner(amount);
  const dirty = parsedThreshold !== settings.smallWeddingThreshold || parsedAmount !== settings.smallWeddingSurcharge;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (parsedAmount === null || Number.isNaN(parsedThreshold)) return;
    update.mutate({ smallWeddingThreshold: parsedThreshold, smallWeddingSurcharge: parsedAmount });
  }

  return (
    <Card>
      <h2 className="text-xl font-medium">Tillæg for små bryllupper</h2>
      <p className="mt-1 text-sm text-ink-muted">
        {formatKroner(settings.smallWeddingSurcharge)} oven i prisen under {settings.smallWeddingThreshold} gæster. Gælder nye bookinger; eksisterende beholder det tillæg, de blev oprettet med.
      </p>
      {manages && (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Under antal gæster" type="number" inputMode="numeric" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
            <Field label="Tillæg (kr.)" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          {update.isError && <Alert tone="danger">{errorMessage(update.error)}</Alert>}
          {dirty && (
            <Button type="submit" size="sm" loading={update.isPending} disabled={parsedAmount === null}>
              Gem tillæg
            </Button>
          )}
        </form>
      )}
    </Card>
  );
}
