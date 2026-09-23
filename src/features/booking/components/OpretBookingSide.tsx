import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingerPaaDato, useOpretBooking } from '@/features/booking/hooks/useBookinger';
import { useKunder } from '@/features/kunde/hooks/useKunder';
import { formatDato } from '@/lib/format';

/**
 * An enquiry is recorded while the event manager is still on the phone, so
 * nothing here is required but the couple's name.
 *
 * A returning couple is the same Kunde, not a new one — otherwise their history
 * splits in two and the point of keeping it is lost. So the name field looks
 * for existing customers as it is typed.
 */
export function OpretBookingSide() {
  const navigate = useNavigate();
  const opret = useOpretBooking();

  const [navn, setNavn] = useState('');
  const [valgtKundeId, setValgtKundeId] = useState<string | null>(null);
  const [bryllupsdato, setBryllupsdato] = useState('');
  const [gæsteantal, setGæsteantal] = useState('');

  const { data: fundneKunder } = useKunder(navn.trim().length >= 2 && !valgtKundeId ? navn : '');
  const forslag = valgtKundeId ? [] : (fundneKunder ?? []).slice(0, 5);

  const gem = (event: React.FormEvent) => {
    event.preventDefault();
    opret.mutate(
      {
        kundeId: valgtKundeId,
        nytKundenavn: valgtKundeId ? null : navn.trim() || null,
        bryllupsdato: bryllupsdato || null,
        gæsteantal: gæsteantal === '' ? null : Number(gæsteantal),
      },
      { onSuccess: () => navigate('/bookinger') },
    );
  };

  return (
    <form onSubmit={gem} className="max-w-lg space-y-5">
      <h1 className="text-xl font-semibold">Ny booking</h1>

      <Felt label="Brudepar">
        <input
          type="text"
          value={navn}
          onChange={(event) => {
            setNavn(event.target.value);
            setValgtKundeId(null);
          }}
          placeholder="Anna Nielsen &amp; Mikkel Sørensen"
          className="w-full rounded-lg border border-stone-300 px-3 py-2"
        />
        {valgtKundeId && (
          <p className="text-xs text-stone-500">
            Knyttes til en kunde, I har haft før — historikken følger med.
          </p>
        )}
      </Felt>

      {forslag.length > 0 && (
        <div className="rounded-lg border border-stone-200 bg-white">
          <p className="border-b border-stone-100 px-3 py-2 text-xs text-stone-500">
            Findes allerede — vælg for at beholde historikken
          </p>
          <ul>
            {forslag.map((kunde) => (
              <li key={kunde.id}>
                <button
                  type="button"
                  onClick={() => {
                    setValgtKundeId(kunde.id);
                    setNavn(kunde.navn);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-stone-50"
                >
                  {kunde.navn}
                  {kunde.by && <span className="text-stone-400"> · {kunde.by}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Felt label="Bryllupsdato">
        <input
          type="date"
          value={bryllupsdato}
          onChange={(event) => setBryllupsdato(event.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2"
        />
      </Felt>

      <Felt label="Gæsteantal">
        <input
          type="number"
          min={0}
          value={gæsteantal}
          onChange={(event) => setGæsteantal(event.target.value)}
          placeholder="Ved ikke endnu"
          className="w-full rounded-lg border border-stone-300 px-3 py-2"
        />
      </Felt>

      <DatoAdvarsel bryllupsdato={bryllupsdato} />

      {opret.isError && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Kunne ikke gemme bookingen.
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={opret.isPending || (!navn.trim() && !valgtKundeId)}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
        >
          {opret.isPending ? 'Gemmer…' : 'Gem booking'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/bookinger')}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
        >
          Annullér
        </button>
      </div>
    </form>
  );
}

/**
 * Warns when a date already has a Booking — deliberately a warning, not a block.
 * Every outcome says something: silence would be read as "the date is free",
 * which is the wrong thing to imply when the check failed or has not finished.
 */
function DatoAdvarsel({ bryllupsdato }: { bryllupsdato: string }) {
  const { data, isPending, isError } = useBookingerPaaDato(bryllupsdato || null);

  if (!bryllupsdato) return null;
  if (isPending) return <Besked tone="neutral">Tjekker om datoen er optaget…</Besked>;

  if (isError) {
    return (
      <Besked tone="neutral">
        Kunne ikke tjekke, om datoen allerede er optaget. Gem endelig — men kontrollér det bagefter.
      </Besked>
    );
  }

  if (data.length === 0) return <Besked tone="neutral">Datoen er fri.</Besked>;

  return (
    <Besked tone="advarsel">
      Der ligger allerede {data.length === 1 ? 'en booking' : `${data.length} bookinger`} den{' '}
      {formatDato(bryllupsdato)}:{' '}
      <span className="font-medium">{data.map((booking) => booking.kundenavn).join(', ')}</span>. Du
      kan godt gemme alligevel.
    </Besked>
  );
}

function Besked({ tone, children }: { tone: 'neutral' | 'advarsel'; children: React.ReactNode }) {
  const styles =
    tone === 'advarsel'
      ? 'border-amber-300 bg-amber-50 text-amber-900'
      : 'border-stone-200 bg-stone-50 text-stone-600';

  return <p className={`rounded-lg border p-3 text-sm ${styles}`}>{children}</p>;
}

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      {children}
    </label>
  );
}
