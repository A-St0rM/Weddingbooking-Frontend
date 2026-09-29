import { Link, NavLink, Outlet, useMatches } from 'react-router-dom';
import { Plus } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';
import { roleLabels } from '@/lib/format';
import { navItemsFor, navSections } from '@/app/navigation';
import { useCurrentUser } from '@/features/auth/currentUser';
import { usePermissions } from '@/features/auth/permissions';
import { Sprig } from '@/components/ui/EmptyState';

const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

/**
 * Desktop (≥1024px): the estate's green sidebar, grouped by the kind of work.
 * Phone: content with a floating tab bar at the thumb. The same list of destinations feeds both.
 */
export function AppShell() {
  const me = useCurrentUser();
  const { manages } = usePermissions();
  const navItems = navItemsFor(me.role);
  const tabs = navItems.filter((item) => item.inTabBar);
  // Pages that need the width of a desktop screen say so with `handle: { wide: true }`; forms stay readable at 4xl.
  const wide = useMatches().some((match) => (match.handle as { wide?: boolean } | undefined)?.wide);

  return (
    <div className="min-h-dvh lg:flex">
      <a
        href="#main"
        className="sr-only z-50 rounded-control bg-surface px-4 py-3 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Spring til indhold
      </a>

      <aside className="relative hidden w-68 shrink-0 flex-col overflow-hidden bg-estate text-on-estate lg:sticky lg:top-0 lg:flex lg:h-dvh">
        {/* Light through the trees: a soft glow in the corner, nothing more. */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-20 size-72 rounded-full bg-[radial-gradient(circle,rgb(169_181_163/0.18),transparent_65%)]" />
        <Link to="/" className="relative flex items-center gap-3 px-6 pt-7 pb-6">
          <Sprig className="size-9 shrink-0 text-on-estate-muted" />
          <span>
            <span className="block font-display text-2xl leading-none font-medium tracking-tight">Engestofte</span>
            <span className="mt-1 block text-[0.7rem] font-semibold tracking-[0.18em] text-on-estate-muted uppercase">Bryllupper</span>
          </span>
        </Link>

        {manages && (
          <div className="relative px-4 pb-4">
            <Link
              to="/bookinger/ny"
              className="flex min-h-11 items-center justify-center gap-2 rounded-control bg-on-estate font-medium text-estate transition-transform duration-200 hover:-translate-y-px active:scale-[0.98]"
            >
              <Plus aria-hidden="true" weight="bold" className="size-4" />
              Ny booking
            </Link>
          </div>
        )}

        <nav aria-label="Hovedmenu" className="relative flex-1 space-y-6 overflow-y-auto px-3 py-2">
          {navSections.map((section) => {
            const items = navItems.filter((item) => item.section === section);
            if (items.length === 0) return null;
            return (
              <div key={section}>
                <p className="mb-1.5 px-3 text-[0.7rem] font-semibold tracking-[0.14em] text-on-estate-muted/80 uppercase">{section}</p>
                <ul className="space-y-0.5">
                  {items.map(({ to, label, icon: Icon }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                          cn(
                            'group relative flex min-h-10 items-center gap-3 rounded-control px-3 text-[0.95rem] font-medium transition-colors duration-200',
                            isActive ? 'bg-estate-raised text-on-estate' : 'text-on-estate-muted hover:bg-estate-raised/60 hover:text-on-estate',
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span aria-hidden="true" className={cn('absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-on-estate transition-opacity', isActive ? 'opacity-100' : 'opacity-0')} />
                            <Icon aria-hidden="true" weight={isActive ? 'fill' : 'regular'} className="size-5" />
                            {label}
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        <NavLink
          to="/mere"
          className={({ isActive }) =>
            cn('relative m-3 flex items-center gap-3 rounded-card p-3 transition-colors hover:bg-estate-raised', isActive && 'bg-estate-raised')
          }
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-on-estate/10 font-display font-medium">{initials(me.name)}</span>
          <span className="min-w-0 text-sm">
            <span className="block truncate font-medium">{me.name}</span>
            <span className="block truncate text-on-estate-muted">{roleLabels[me.role]}</span>
          </span>
        </NavLink>
      </aside>

      <main id="main" className="min-w-0 flex-1 pb-32 lg:pb-16">
        <div className={cn('safe-x mx-auto pt-8 lg:px-12 lg:pt-12', wide ? 'max-w-[88rem]' : 'max-w-4xl')}>
          <Outlet />
        </div>
      </main>

      <nav aria-label="Hovedmenu" className="pb-safe fixed inset-x-0 bottom-0 z-40 px-3 pb-3 lg:hidden">
        <ul className="mx-auto flex max-w-md rounded-2xl bg-estate p-1.5 text-on-estate shadow-lift">
          {tabs.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[0.7rem] font-medium transition-colors',
                    isActive ? 'bg-estate-raised text-on-estate' : 'text-on-estate-muted',
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
