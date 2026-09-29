import { Badge } from '@/components/ui/Badge';
import type { SalesStage } from '@/lib/api/types';
import { stageLabels, stageTones } from '@/lib/labels';

export function StageBadge({ stage }: { stage: SalesStage }) {
  return <Badge tone={stageTones[stage]}>{stageLabels[stage]}</Badge>;
}
