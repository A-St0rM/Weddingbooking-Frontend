import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { errorMessage } from '@/lib/api/errorMessage';
import type { Booking, SalesStage } from '@/lib/api/types';
import { manualStages, stageLabels } from '@/lib/labels';
import { useChangeStage } from '@/features/bookings/api/bookings';
import { ViewingFields } from '@/features/bookings/components/ViewingFields';

export function StageCard({ booking }: { booking: Booking }) {
  const change = useChangeStage(booking.id);
  const signed = booking.stage === 'Signed';
  const options = (signed ? ['Signed' as SalesStage, ...manualStages] : manualStages).map((stage) => ({
    value: stage,
    label: stageLabels[stage],
  }));

  return (
    <Card>
      <Select
        label="Salgstrin"
        value={booking.stage}
        options={options}
        disabled={change.isPending}
        onChange={(e) => {
          const stage = e.target.value as SalesStage;
          if (stage === 'Cancelled' && !window.confirm('Afbestil bookingen? Reservationsgebyret refunderes ikke.')) return;
          change.mutate(stage);
        }}
        hint={signed ? 'Sat af den underskrevne aftale.' : '"Underskrevet" sættes, når den underskrevne aftale uploades.'}
      />
      {change.isError && <Alert tone="danger" className="mt-3">{errorMessage(change.error)}</Alert>}
      <div className="mt-4">
        <ViewingFields key={booking.version} booking={booking} />
      </div>
    </Card>
  );
}
