import type { ReactNode } from 'react';
import { LockKey, PlugsConnected } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ApiError } from '@/lib/api/errors';
import { CurrentUserContext } from '@/features/auth/currentUser';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { useMe } from '@/features/auth/hooks/useMe';
import { signOut, useSession } from '@/features/auth/hooks/useSession';

/**
 * Logged in is not the same as having access. The gate asks the API who you
 * are; only a 403 means "no access". Anything else — a stopped API, a 500, a
 * wrong address — is the server not answering, and says so with its status.
 */
export function AccessGate({ children }: { children: ReactNode }) {
  const session = useSession();
  const me = useMe(session.status === 'signedIn');

  if (session.status === 'loading') return <FullScreen><Spinner label="Et øjeblik" /></FullScreen>;
  if (session.status === 'signedOut') return <LoginPage />;
  if (me.isPending) return <FullScreen><Spinner label="Henter din profil" /></FullScreen>;

  if (me.isError) {
    const error = me.error instanceof ApiError ? me.error : new ApiError(ApiError.Unreachable, String(me.error));
    return error.isForbidden ? (
      <Problem
        icon={<LockKey className="size-7" />}
        title="Ingen adgang"
        body={error.detail ?? 'Du er logget ind, men har ikke adgang til bookingsystemet. Kontakt event manageren.'}
        email={session.session.user.email}
      />
    ) : (
      <Problem
        icon={<PlugsConnected className="size-7" />}
        title="Serveren svarer ikke"
        body={error.message}
        code={error.status === ApiError.Unreachable ? 'Ingen forbindelse' : `HTTP ${error.status}`}
        onRetry={() => void me.refetch()}
        retrying={me.isFetching}
      />
    );
  }

  return <CurrentUserContext.Provider value={me.data}>{children}</CurrentUserContext.Provider>;
}

function FullScreen({ children }: { children: ReactNode }) {
  return <main className="grid min-h-dvh place-items-center p-6 text-ink-muted">{children}</main>;
}

function Problem({ icon, title, body, code, email, onRetry, retrying }: {
  icon: ReactNode;
  title: string;
  body: string;
  code?: string;
  email?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <main className="safe-x flex min-h-dvh flex-col justify-center px-5 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="grid size-14 place-items-center rounded-card bg-neutral-soft text-ink">{icon}</div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 leading-relaxed text-ink-muted">{body}</p>
        {code && <p className="mt-3 font-mono text-sm text-ink-muted">{code}</p>}
        {email && <p className="mt-3 text-sm text-ink-muted">Logget ind som {email}</p>}
        <div className="mt-8 flex flex-col gap-3">
          {onRetry && (
            <Button onClick={onRetry} loading={retrying}>
              Prøv igen
            </Button>
          )}
          <Button variant="secondary" onClick={() => void signOut()}>
            Log ud
          </Button>
        </div>
      </div>
    </main>
  );
}
