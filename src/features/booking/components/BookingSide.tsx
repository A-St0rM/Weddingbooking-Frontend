import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBooking, useSætBetaler } from '@/features/booking/hooks/useBookinger';
import { useKunder } from '@/features/kunde/hooks/useKunder';
import { formatDato, formatGæsteantal } from '@/lib/format';

export function BookingSide() {
  const { id = '' } = useParams();
  const { data: booking, isPending, error } = useBooking(id);

  if (isPending) return <p className="text-stone-500">Henter bookingen…</p>;
  if (error || !booking) {
    return <p className="text-red-700">Kunne ikke hente bookingen.</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{booking.kundenavn}</h1>
        <p className="text-sm text-stone-600">
          {booking.bryllupsdato ? formatDato(booking.bryllupsdato) : 'Dato ikke aftalt'}
          {' · '}
          {formatGæsteantal(booking.gæsteantal)}
        </p>
        <Link
          to={`/kunder/${booking.kundeId}`}
          className="mt-1 inline-block text-sm text-stone-500 underline hover:text-stone-900"
        >
          Se kunden og dens historik
        </Link>
      </div>

      <BetalerFelt
        bookingId={booking.id}
        kundeId={booking.kundeId}
        kundenavn={booking.kundenavn}
        betalerKundeId={booking.betalerKundeId}
        betalernavn={booking.betalernavn}
        harSærskiltBetaler={booking.harSærskiltBetaler}
      />
    </div>
  );
}

/**
 * Who gets the invoice. Defaults to the couple and usually stays there, so the
 * normal case costs no thought — changing it is deliberately a second step.
 */
function BetalerFelt({
  bookingId,
  kundeId,
  kundenavn,
  betalernavn,
  harSærskiltBetaler,
}: {
  bookingId: string;
  kundeId: string;
  kundenavn: string;
  betalerKundeId: string;
  betalernavn: string;
  harSærskiltBetaler: boolean;
}) {
  const [åben, setÅben] = useState(false);
  const [søg, setSøg] = useState('');
  const sæt = useSætBetaler(bookingId);
  const { data: kunder } = useKunder(åben && søg.trim().length >= 2 ? søg : '');

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4">
      <h2 className="font-medium">Betaler</h2>
      <p className="mt-1 text-sm text-stone-600">
        {harSærskiltBetaler ? (
          <>
            <span className="font-medium">{betalernavn}</span> betaler for brudeparret.
          </>
        ) : (
          <>Brudeparret betaler selv.</>
        )}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setÅben((v) => !v)}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm"
        >
          {åben ? 'Fortryd' : 'Vælg en anden betaler'}
        </button>
        {harSærskiltBetaler && (
          <button
            type="button"
            onClick={() => sæt.mutate(null)}
            disabled={sæt.isPending}
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Lad {kundenavn} betale igen
          </button>
        )}
      </div>

      {åben && (
        <div className="mt-3 space-y-2">
          <input
            type="search"
            value={søg}
            onChange={(event) => setSøg(event.target.value)}
            placeholder="Søg efter den, der betaler — fx forældrene"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
            {(kunder ?? [])
              .filter((kunde) => kunde.id !== kundeId)
              .slice(0, 6)
              .map((kunde) => (
                <li key={kunde.id}>
                  <button
                    type="button"
                    onClick={() => {
                      sæt.mutate(kunde.id);
                      setÅben(false);
                      setSøg('');
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-stone-50"
                  >
                    {kunde.navn}
                    {kunde.by && <span className="text-stone-400"> · {kunde.by}</span>}
                  </button>
                </li>
              ))}
            {søg.trim().length >= 2 && (kunder ?? []).length === 0 && (
              <li className="px-3 py-2 text-sm text-stone-500">
                Ingen kunder matcher. Betaleren skal findes som kunde først.
              </li>
            )}
          </ul>
        </div>
      )}

      {sæt.isError && (
        <p className="mt-2 text-sm text-red-700">Kunne ikke skifte betaler.</p>
      )}
    </section>
  );
}
