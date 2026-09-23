import { NavLink, Outlet } from 'react-router-dom';
import { useMig, rolleNavne } from '@/features/auth/hooks/useMig';
import { logUd } from '@/features/auth/hooks/useSession';

// Kunder arrives in ticket 04, Pakker in ticket 06. Links are added when the
// pages behind them exist, not before.
const links = [{ to: '/bookinger', label: 'Bookinger' }];

export function AppLayout() {
  const { data: mig } = useMig(true);

  return (
    <div className="min-h-dvh bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <nav className="flex flex-wrap gap-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? 'font-semibold text-stone-900' : 'text-stone-500 hover:text-stone-900'
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {mig && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-stone-600">
                {mig.navn || mig.email}
                <span className="text-stone-400"> · {rolleNavne[mig.rolle] ?? mig.rolle}</span>
              </span>
              <button
                type="button"
                onClick={logUd}
                className="rounded-lg border border-stone-300 px-3 py-1 hover:bg-stone-50"
              >
                Log ud
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
