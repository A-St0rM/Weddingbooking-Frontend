import type { ReactNode } from 'react';
import { logUd, useSession } from '@/features/auth/hooks/useSession';
import { useMig } from '@/features/auth/hooks/useMig';
import { LogIndSide } from '@/features/auth/components/LogIndSide';

/**
 * Nothing is reachable without a session. Two separate gates: Supabase says
 * whether you are who you claim, and the API says whether you are a user of
 * this system at all. Passing the first and failing the second is a real state
 * — a Supabase account exists, but no Bruger row does — and it gets its own
 * message rather than an empty page.
 */
export function RequireLogin({ children }: { children: ReactNode }) {
  const { session, loading } = useSession();
  const mig = useMig(Boolean(session));

  if (loading) {
    return <p className="p-8 text-center text-stone-500">Et øjeblik…</p>;
  }

  if (!session) {
    return <LogIndSide />;
  }

  if (mig.isPending) {
    return <p className="p-8 text-center text-stone-500">Henter din adgang…</p>;
  }

  if (mig.isError) {
    return (
      <div className="mx-auto mt-16 max-w-md space-y-4 text-center">
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Du er logget ind, men har ikke adgang til bookingsystemet. Kontakt event manageren.
        </p>
        <button
          type="button"
          onClick={logUd}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
        >
          Log ud
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
