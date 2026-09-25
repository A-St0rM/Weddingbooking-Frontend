import { SignOut } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { roleLabels } from '@/lib/format';
import { useCurrentUser } from '@/features/auth/currentUser';
import { signOut } from '@/features/auth/hooks/useSession';

export function ProfilePage() {
  const me = useCurrentUser();
  return (
    <>
      <PageHeader title="Profil" />
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
