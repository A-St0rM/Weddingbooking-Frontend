import { Flask } from '@phosphor-icons/react';

/** Nobody may think this is the estate's real accounting. Shown wherever accounting data is. */
export function SimulatedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2.5 py-1 text-xs font-semibold text-warn">
      <Flask aria-hidden="true" weight="bold" className="size-3.5" />
      Simuleret regnskab
    </span>
  );
}
