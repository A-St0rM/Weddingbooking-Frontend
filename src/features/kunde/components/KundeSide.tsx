import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useFjernKontaktperson,
  useGørPrimær,
  useKunde,
  useRetKunde,
  useTilføjKontaktperson,
} from '@/features/kunde/hooks/useKunder';
import type { Kunde } from '@/features/kunde/types';
import { formatDato, formatGæsteantal } from '@/lib/format';

export function KundeSide() {
  const { id = '' } = useParams();
  const { data, isPending, error } = useKunde(id);

  if (isPending) return <p className="text-stone-500">Henter kunden…</p>;
  if (error || !data) return <p className="text-red-700">Kunne ikke hente kunden.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <Stamdata kunde={data.kunde} />
      <Kontaktpersoner kunde={data.kunde} />
      <Historik bookinger={data.bookinger} />
    </div>
  );
}

function Stamdata({ kunde }: { kunde: Kunde }) {
  const [redigerer, setRedigerer] = useState(false);
  const ret = useRetKunde(kunde.id);
  const [felter, setFelter] = useState({
    navn: kunde.navn,
    adresse: kunde.adresse ?? '',
    postnr: kunde.postnr ?? '',
    by: kunde.by ?? '',
  });

  if (!redigerer) {
    return (
      <section>
        <h1 className="text-xl font-semibold">{kunde.navn}</h1>
        <p className="text-sm text-stone-600">
          {[kunde.adresse, [kunde.postnr, kunde.by].filter(Boolean).join(' ')]
            .filter(Boolean)
            .join(', ') || 'Ingen adresse'}
        </p>
        <button
          type="button"
          onClick={() => setRedigerer(true)}
          className="mt-2 rounded-lg border border-stone-300 px-3 py-1.5 text-sm"
        >
          Ret oplysninger
        </button>
      </section>
    );
  }

  return (
    <form
      className="space-y-3 rounded-lg border border-stone-200 bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        ret.mutate(
          {
            navn: felter.navn,
            adresse: felter.adresse || null,
            postnr: felter.postnr || null,
            by: felter.by || null,
          },
          { onSuccess: () => setRedigerer(false) },
        );
      }}
    >
      {(['navn', 'adresse', 'postnr', 'by'] as const).map((felt) => (
        <label key={felt} className="block space-y-1">
          <span className="text-sm font-medium capitalize text-stone-700">{felt}</span>
          <input
            type="text"
            value={felter[felt]}
            onChange={(event) => setFelter({ ...felter, [felt]: event.target.value })}
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
        </label>
      ))}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={ret.isPending || !felter.navn.trim()}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Gem
        </button>
        <button
          type="button"
          onClick={() => setRedigerer(false)}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
        >
          Annullér
        </button>
      </div>
    </form>
  );
}

/**
 * Two people, each with their own email and phone — the event manager writes to
 * whichever of them actually answers. Exactly one is the default recipient.
 */
function Kontaktpersoner({ kunde }: { kunde: Kunde }) {
  const tilføj = useTilføjKontaktperson(kunde.id);
  const primær = useGørPrimær(kunde.id);
  const fjern = useFjernKontaktperson(kunde.id);
  const [ny, setNy] = useState({ navn: '', email: '', telefon: '' });

  return (
    <section className="space-y-3">
      <h2 className="font-medium">Kontaktpersoner</h2>

      {kunde.kontaktpersoner.length === 0 && (
        <p className="text-sm text-stone-500">Ingen endnu.</p>
      )}

      <ul className="space-y-2">
        {kunde.kontaktpersoner.map((kontakt) => (
          <li
            key={kontakt.id}
            className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-stone-200 bg-white p-3"
          >
            <div className="text-sm">
              <p className="font-medium">
                {kontakt.navn}
                {kontakt.erPrimær && (
                  <span className="ml-2 rounded bg-stone-900 px-1.5 py-0.5 text-xs text-white">
                    Primær
                  </span>
                )}
              </p>
              <p className="text-stone-600">
                {[kontakt.email, kontakt.telefon].filter(Boolean).join(' · ') ||
                  'Ingen kontaktoplysninger'}
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              {!kontakt.erPrimær && (
                <button
                  type="button"
                  onClick={() => primær.mutate(kontakt.id)}
                  className="rounded-lg border border-stone-300 px-2 py-1"
                >
                  Gør primær
                </button>
              )}
              <button
                type="button"
                onClick={() => fjern.mutate(kontakt.id)}
                className="rounded-lg border border-stone-300 px-2 py-1 text-stone-500"
              >
                Fjern
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form
        className="flex flex-wrap gap-2 rounded-lg border border-dashed border-stone-300 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          tilføj.mutate(
            { navn: ny.navn, email: ny.email || null, telefon: ny.telefon || null },
            { onSuccess: () => setNy({ navn: '', email: '', telefon: '' }) },
          );
        }}
      >
        <input
          type="text"
          required
          value={ny.navn}
          onChange={(event) => setNy({ ...ny, navn: event.target.value })}
          placeholder="Navn"
          className="min-w-32 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        <input
          type="email"
          value={ny.email}
          onChange={(event) => setNy({ ...ny, email: event.target.value })}
          placeholder="E-mail"
          className="min-w-40 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        <input
          type="tel"
          value={ny.telefon}
          onChange={(event) => setNy({ ...ny, telefon: event.target.value })}
          placeholder="Telefon"
          className="min-w-28 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={tilføj.isPending || !ny.navn.trim()}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Tilføj
        </button>
      </form>
    </section>
  );
}

/** Why a Kunde outlives its Bookings: a couple returning is the same customer. */
function Historik({ bookinger }: { bookinger: import('@/features/booking/types').Booking[] }) {
  return (
    <section className="space-y-2">
      <h2 className="font-medium">Bookinger</h2>
      {bookinger.length === 0 ? (
        <p className="text-sm text-stone-500">Ingen bookinger på denne kunde.</p>
      ) : (
        <ul className="space-y-2">
          {bookinger.map((booking) => (
            <li key={booking.id}>
              <Link
                to={`/bookinger/${booking.id}`}
                className="block rounded-lg border border-stone-200 bg-white p-3 text-sm hover:border-stone-400"
              >
                <span className="font-medium">
                  {booking.bryllupsdato ? formatDato(booking.bryllupsdato) : 'Dato ikke aftalt'}
                </span>
                <span className="text-stone-600"> · {formatGæsteantal(booking.gæsteantal)}</span>
                {booking.harSærskiltBetaler && (
                  <span className="text-stone-500"> · betales af {booking.betalernavn}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
