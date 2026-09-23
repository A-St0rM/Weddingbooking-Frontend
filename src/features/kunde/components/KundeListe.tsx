import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useKunder } from '@/features/kunde/hooks/useKunder';

export function KundeListe() {
  const [søg, setSøg] = useState('');
  const { data: kunder, isPending, error } = useKunder(søg);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Kunder</h1>

      <input
        type="search"
        value={søg}
        onChange={(event) => setSøg(event.target.value)}
        placeholder="Søg på navn"
        className="w-full rounded-lg border border-stone-300 px-3 py-2"
      />

      {isPending && <p className="text-stone-500">Henter kunder…</p>}
      {error && <p className="text-red-700">Kunne ikke hente kunder.</p>}

      {kunder?.length === 0 && (
        <p className="rounded-lg border border-dashed border-stone-300 p-8 text-center text-stone-500">
          {søg ? `Ingen kunder matcher "${søg}".` : 'Ingen kunder endnu. De oprettes med en booking.'}
        </p>
      )}

      {kunder && kunder.length > 0 && (
        <ul className="space-y-2">
          {kunder.map((kunde) => (
            <li key={kunde.id}>
              <Link
                to={`/kunder/${kunde.id}`}
                className="block rounded-lg border border-stone-200 bg-white p-4 hover:border-stone-400"
              >
                <p className="font-semibold">{kunde.navn}</p>
                <p className="text-sm text-stone-600">
                  {[kunde.adresse, [kunde.postnr, kunde.by].filter(Boolean).join(' ')]
                    .filter(Boolean)
                    .join(', ') || 'Ingen adresse'}
                </p>
                {kunde.kontaktpersoner.length > 0 && (
                  <p className="mt-1 text-xs text-stone-500">
                    {kunde.kontaktpersoner.map((k) => k.navn).join(' · ')}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
