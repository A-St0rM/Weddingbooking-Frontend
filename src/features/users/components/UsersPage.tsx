import { useState, type FormEvent } from 'react';
import { PencilSimple, Plus } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { Select } from '@/components/ui/Select';
import { errorMessage } from '@/lib/api/errorMessage';
import type { Role, StaffUser } from '@/lib/api/types';
import { formatDateTime, roleLabels } from '@/lib/format';
import { useCurrentUser } from '@/features/auth/currentUser';
import { useUserActions, useUsers } from '@/features/users/api/users';

const roleOptions = (Object.keys(roleLabels) as Role[]).map((role) => ({ value: role, label: roleLabels[role] }));

/**
 * Who has access. A person is let in by a row here and signs in with the same
 * e-mail in Supabase; the account is bound to them the first time they do.
 */
export function UsersPage() {
  const query = useUsers();
  const [adding, setAdding] = useState(false);
  return (
    <>
      <PageHeader
        title="Brugere"
        description="At kunne logge ind giver ikke adgang. Adgang kræver en bruger her med samme e-mail."
        actions={
          !adding && (
            <Button size="sm" onClick={() => setAdding(true)}>
              <Plus aria-hidden="true" weight="bold" className="size-4" /> Ny bruger
            </Button>
          )
        }
      />
      {adding && <UserForm onDone={() => setAdding(false)} />}
      <QueryState query={query}>
        {(users) => (
          <ul className="mt-4 space-y-3">
            {users.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </ul>
        )}
      </QueryState>
    </>
  );
}

function UserRow({ user }: { user: StaffUser }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <li><UserForm user={user} onDone={() => setEditing(false)} /></li>;
  return (
    <li className="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{user.name}</p>
        <p className="text-sm text-ink-muted [overflow-wrap:anywhere]">{[user.email, user.phone].filter(Boolean).join(' · ')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge tone="primary">{roleLabels[user.role]}</Badge>
          {!user.isActive && <Badge tone="danger">Ingen adgang</Badge>}
          {user.isActive && !user.hasSignedIn && <Badge tone="warn">Har ikke logget ind endnu</Badge>}
          {user.lastLoginAt && <span className="text-xs text-ink-muted">Sidst logget ind {formatDateTime(user.lastLoginAt)}</span>}
        </div>
      </div>
      <Button size="sm" variant="ghost" aria-label={`Ret ${user.name}`} onClick={() => setEditing(true)}>
        <PencilSimple aria-hidden="true" className="size-5" />
      </Button>
    </li>
  );
}

function UserForm({ user, onDone }: { user?: StaffUser; onDone: () => void }) {
  const me = useCurrentUser();
  const { create, update } = useUserActions();
  const mutation = user ? update : create;
  const [email, setEmail] = useState(user?.email ?? '');
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [role, setRole] = useState<Role>(user?.role ?? 'EventProducer');
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const isMe = user?.id === me.id;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (user) update.mutate({ id: user.id, body: { name, role, phone: phone || null, isActive } }, { onSuccess: onDone });
    else create.mutate({ email, name, role, phone: phone || null }, { onSuccess: onDone });
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-3">
        {!user && <Field label="E-mail" type="email" inputMode="email" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} required hint="Den e-mail, personen logger ind med." />}
        <Field label="Navn" value={name} onChange={(e) => setName(e.target.value)} required />
        <Field label="Telefon" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} hint="Bruges fx i mødebekræftelsen, så parret kan ringe til Bryan." />
        <Select label="Rolle" value={role} onChange={(e) => setRole(e.target.value as Role)} options={roleOptions} disabled={isMe} />
        {user && !isMe && (
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-5 accent-primary" />
            Har adgang
          </label>
        )}
        {mutation.isError && <Alert tone="danger">{errorMessage(mutation.error)}</Alert>}
        <div className="flex gap-2">
          <Button type="submit" loading={mutation.isPending} disabled={!name.trim() || (!user && !email.trim())}>
            {user ? 'Gem' : 'Opret bruger'}
          </Button>
          <Button variant="ghost" onClick={onDone}>
            Annullér
          </Button>
        </div>
      </form>
    </Card>
  );
}
