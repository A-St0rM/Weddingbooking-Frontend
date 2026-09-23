import { useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export function LogIndSide() {
  const [email, setEmail] = useState('');
  const [kodeord, setKodeord] = useState('');
  const [fejl, setFejl] = useState<string | null>(null);
  const [sender, setSender] = useState(false);

  const logInd = async (event: React.FormEvent) => {
    event.preventDefault();
    setFejl(null);
    setSender(true);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setFejl('Login er ikke sat op i denne udgave.');
      setSender(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password: kodeord });
    setSender(false);

    // Deliberately vague: telling someone which half was wrong tells an
    // outsider which email addresses exist.
    if (error) setFejl('Forkert e-mail eller kodeord.');
  };

  if (!isSupabaseConfigured) {
    return (
      <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        Login er ikke konfigureret. Sæt VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY.
      </p>
    );
  }

  return (
    <form onSubmit={logInd} className="mx-auto mt-16 max-w-sm space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Bryllupsbooking</h1>
        <p className="mt-1 text-sm text-stone-500">Log ind for at fortsætte.</p>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-stone-700">E-mail</span>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-stone-700">Kodeord</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={kodeord}
          onChange={(event) => setKodeord(event.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2"
        />
      </label>

      {fejl && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{fejl}</p>
      )}

      <button
        type="submit"
        disabled={sender}
        className="w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
      >
        {sender ? 'Logger ind…' : 'Log ind'}
      </button>
    </form>
  );
}
