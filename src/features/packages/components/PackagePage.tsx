import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { Segmented } from '@/components/ui/Segmented';
import { LineFields } from '@/components/lines/LineForm';
import { emptyLine, toDraft, toRequest, type LineDraft } from '@/components/lines/lineDraft';
import { errorMessage } from '@/lib/api/errorMessage';
import type { Package, PackageKind } from '@/lib/api/types';
import { packageKindLabels } from '@/lib/labels';
import { usePermissions } from '@/features/auth/permissions';
import { useCopyPackage, usePackage, useSavePackage, useSetPackageActive } from '@/features/packages/api/packages';

export function PackagePage() {
  const { id } = useParams();
  const isNew = id === 'ny';
  const query = usePackage(isNew ? undefined : id);
  return (
    <>
      <BackLink to="/pakker">Pakker</BackLink>
      {isNew ? <PackageForm /> : <QueryState query={query}>{(pkg) => <PackageForm key={JSON.stringify(pkg)} pkg={pkg} />}</QueryState>}
    </>
  );
}

function PackageForm({ pkg }: { pkg?: Package }) {
  const navigate = useNavigate();
  const { manages } = usePermissions();
  const save = useSavePackage(pkg?.id);
  const [name, setName] = useState(pkg?.name ?? '');
  const [kind, setKind] = useState<PackageKind>(pkg?.kind ?? 'Base');
  const [year, setYear] = useState(String(pkg?.year ?? new Date().getFullYear() + 1));
  const [description, setDescription] = useState(pkg?.description ?? '');
  const [lines, setLines] = useState<LineDraft[]>(pkg ? pkg.lines.map(toDraft) : [emptyLine]);

  const requests = lines.map(toRequest);
  const complete = requests.every(Boolean) && name.trim() && Number.parseInt(year, 10) >= 2020;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!complete) return;
    save.mutate(
      { name: name.trim(), kind, year: Number.parseInt(year, 10), description: description.trim() || null, lines: requests.map((r) => r!) },
      { onSuccess: (saved) => navigate(`/pakker/${saved.id}`, { replace: true }) },
    );
  }

  return (
    <>
      <PageHeader title={pkg ? pkg.name : 'Ny pakke'} description={pkg && !pkg.isActive ? 'Udgået — tilbydes ikke på nye bookinger.' : undefined} />
      <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={!manages} className="space-y-4">
          <Card className="space-y-4">
            <Field label="Navn" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Grundpakke 2027" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="År" type="number" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} required />
              <Segmented
                label="Type"
                value={kind}
                onChange={setKind}
                options={[
                  { value: 'Base', label: packageKindLabels.Base },
                  { value: 'AddOn', label: packageKindLabels.AddOn },
                ]}
              />
            </div>
            <Field label="Beskrivelse (valgfri)" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Card>

          {lines.map((line, index) => (
            <Card key={index}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Linje {index + 1}</h2>
                {lines.length > 1 && manages && (
                  <Button size="sm" variant="ghost" aria-label={`Fjern linje ${index + 1}`} onClick={() => setLines(lines.filter((_, i) => i !== index))}>
                    <Trash aria-hidden="true" className="size-5" />
                  </Button>
                )}
              </div>
              <LineFields draft={line} onChange={(draft) => setLines(lines.map((l, i) => (i === index ? draft : l)))} />
            </Card>
          ))}
        </fieldset>

        {manages && (
          <>
            <Button variant="secondary" onClick={() => setLines([...lines, emptyLine])}>
              <Plus aria-hidden="true" className="size-5" /> Tilføj linje
            </Button>
            {save.isError && <Alert tone="danger">{errorMessage(save.error)}</Alert>}
            <div>
              <Button type="submit" loading={save.isPending} disabled={!complete} className="w-full sm:w-auto">
                {pkg ? 'Gem pakke' : 'Opret pakke'}
              </Button>
            </div>
          </>
        )}
      </form>

      {pkg && manages && <PackageActions pkg={pkg} />}
    </>
  );
}

function PackageActions({ pkg }: { pkg: Package }) {
  const navigate = useNavigate();
  const copy = useCopyPackage(pkg.id);
  const setActive = useSetPackageActive(pkg.id);
  const [year, setYear] = useState(String(pkg.year + 1));
  const [percent, setPercent] = useState('0');

  return (
    <div className="mt-8 space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">Kopiér til et nyt år</h2>
        <p className="mt-1 text-sm text-ink-muted">Samme linjer, med priserne ændret med en procentsats og rundet til hele kroner.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field label="År" type="number" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} />
          <Field label="Prisændring (%)" inputMode="decimal" value={percent} onChange={(e) => setPercent(e.target.value)} />
        </div>
        {copy.isError && <Alert tone="danger" className="mt-3">{errorMessage(copy.error)}</Alert>}
        <Button
          variant="secondary"
          className="mt-4"
          loading={copy.isPending}
          onClick={() =>
            copy.mutate(
              { year: Number.parseInt(year, 10), priceChangePercent: Number(percent.replace(',', '.')) || 0 },
              { onSuccess: (created) => navigate(`/pakker/${created.id}`) },
            )
          }
        >
          Kopiér
        </Button>
      </Card>
      <Button variant="ghost" loading={setActive.isPending} onClick={() => setActive.mutate(!pkg.isActive)}>
        {pkg.isActive ? 'Markér som udgået' : 'Tilbyd igen'}
      </Button>
    </div>
  );
}
