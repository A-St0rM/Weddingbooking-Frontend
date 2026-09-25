import { Flask } from '@phosphor-icons/react';

/** Mail "sent" here goes to a simulated outbox and never leaves the system. */
export function SimulatedOutboxBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2.5 py-1 text-xs font-semibold text-warn">
      <Flask aria-hidden="true" weight="bold" className="size-3.5" />
      Simuleret udbakke
    </span>
  );
}
