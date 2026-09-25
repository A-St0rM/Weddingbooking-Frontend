import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { errorMessage } from '@/lib/api/errorMessage';
import type { Booking } from '@/lib/api/types';
import { useScheduleViewing } from '@/features/bookings/api/bookings';
import { useViewingHosts } from '@/features/messages/api/messages';

/** "2027-03-02T13:00:00Z" → "2027-03-02T14:00", the local time a datetime-local field shows. */
function toLocalInput(iso: string | null | undefined) {
  if (!iso) return '';
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function ViewingFields({ booking }: { booking: Booking }) {
  const hosts = useViewingHosts();
  const schedule = useScheduleViewing(booking.id);
  const [at, setAt] = useState(toLocalInput(booking.viewingAt));
  const [hostId, setHostId] = useState(booking.viewingHost?.id ?? '');
  const dirty = at !== toLocalInput(booking.viewingAt) || hostId !== (booking.viewingHost?.id ?? '');

  return (
    <div className="space-y-3 border-t border-line pt-4">
      <h3 className="font-semibold">Fremvisning</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Tidspunkt" type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} />
        <Select
          label="Viser rundt"
          value={hostId}
          onChange={(e) => setHostId(e.target.value)}
          options={[{ value: '', label: 'Event produceren' }, ...(hosts.data ?? []).map((h) => ({ value: h.id, label: h.phone ? `${h.name} · ${h.phone}` : h.name }))]}
        />
      </div>
      {schedule.isError && <Alert tone="danger">{errorMessage(schedule.error)}</Alert>}
      {dirty && (
        <Button size="sm" loading={schedule.isPending} onClick={() => schedule.mutate({ at: at ? new Date(at).toISOString() : null, hostId: hostId || null })}>
          Gem fremvisning
        </Button>
      )}
    </div>
  );
}
