import { Link } from 'react-router-dom';
import { CaretRight, SignOut } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { roleLabels } from '@/lib/format';
import { navItemsFor } from '@/app/navigation';
import { useCurrentUser } from '@/features/auth/currentUser';
import { signOut } from '@/features/auth/hooks/useSession';

/** The destinations that do not fit in the tab bar, and who you are. */
export function MorePage() {
  const me = useCurrentUser();
  const more = navItemsFor(me.role).filter((item) => !item.inTabBar);

  return (
    <>
      <PageHeader title="Mere" />
      {more.length > 0 && (
        <ul className="mb-6 divide-y divide-line overflow-hidden rounded-card bg-surface shadow-card ring-1 ring-line/60">
          {more.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link to={to} className="flex min-h-14 items-center gap-3 px-4 hover:bg-neutral-soft">
                <Icon aria-hidden="true" className="size-6 text-ink-muted" />
                <span className="flex-1 font-medium">{label}</span>
                <CaretRight aria-hidden="true" className="size-4 text-ink-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="eyebrow mb-3 font-sans">Din profil</h2>
      <Card>
        <dl className="divide-y divide-line">
          <Row label="Navn" value={me.name} />
          <Row label="Rolle" value={roleLabels[me.role]} />
          <Row label="E-mail" value={me.email} />
          {me.phone && <Row label="Telefon" value={me.phone} />}
        </dl>
      </Card>
      {/* Kept apart from everything else so it is never tapped by accident. */}
      <div className="mt-10">
        <Button variant="secondary" onClick={() => void signOut()} className="w-full sm:w-auto">
          <SignOut aria-hidden="true" className="size-5" />
          Log ud
        </Button>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:gap-4">
      <dt className="text-sm text-ink-muted sm:w-32">{label}</dt>
      <dd className="font-medium [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}
