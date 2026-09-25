import { Badge } from '@/components/ui/Badge';
import type { DisplayStatus } from '@/lib/api/types';
import { statusLabels, statusTones } from '@/lib/labels';

export function StatusBadge({ status }: { status: DisplayStatus }) {
  return <Badge tone={statusTones[status]}>{statusLabels[status]}</Badge>;
}
