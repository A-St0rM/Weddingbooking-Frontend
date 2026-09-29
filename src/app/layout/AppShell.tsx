import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { roleLabels } from '@/lib/format';
import { navItems } from '@/app/navigation';
import { useCurrentUser } from '@/features/auth/currentUser';

/**
 * Phone: content with a tab bar at the thumb. Desktop (≥1024px): a sidebar.
 * The same list of destinations feeds both.
 */
export function AppShell() {
  const me = useCurrentUser();
  const tabs = navItems.filter((item) => item.inTabBar);

  return (
    <div className="min-h-dvh lg:flex">
      <a
        href="#main"
        className="sr-only z-50 rounded-control bg-surface px-4 py-3 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Spring til indhold
      </a>

      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="px-5 py-6">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">Engestofte Gods</p>
          <p className="mt-0.5 text-lg font-semibold tracking-tight">Bryllupsbooking</p>
        </div>
        <nav aria-label="Hovedmenu" className="flex-1 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center gap-3 rounded-control px-3 font-medium transition-colors',
                  isActive ? 'bg-primary-soft text-primary' : 'text-ink-muted hover:bg-neutral-soft hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon aria-hidden="true" weight={isActive ? 'fill' : 'regular'} className="size-5" />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-line px-5 py-4 text-sm">
          <p className="font-medium">{me.name}</p>
          <p className="text-ink-muted">{roleLabels[me.role]}</p>
        </div>
      </aside>

      <main id="main" className="min-w-0 flex-1 pb-28 lg:pb-10">
        <div className="safe-x mx-auto max-w-4xl pt-6 lg:px-10 lg:pt-10">
          <Outlet />
        </div>
      </main>

      <nav
        aria-label="Hovedmenu"
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
      >
        <ul className="mx-auto flex max-w-md">
          {tabs.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium',
                    isActive ? 'text-primary' : 'text-ink-muted',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon aria-hidden="true" weight={isActive ? 'fill' : 'regular'} className="size-6" />
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
