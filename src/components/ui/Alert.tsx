import type { ReactNode } from 'react';
import { Info, Warning, WarningOctagon, CheckCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';

type AlertTone = 'info' | 'warn' | 'danger' | 'ok';

const styles: Record<AlertTone, { box: string; Icon: typeof Info }> = {
  info: { box: 'bg-info-soft text-info', Icon: Info },
  warn: { box: 'bg-warn-soft text-warn', Icon: Warning },
  danger: { box: 'bg-danger-soft text-danger', Icon: WarningOctagon },
  ok: { box: 'bg-ok-soft text-ok', Icon: CheckCircle },
};

export function Alert({ tone = 'info', title, children, className }: {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const { box, Icon } = styles[tone];
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-control p-4', box, className)}>
      <Icon aria-hidden="true" weight="bold" className="mt-0.5 size-5 shrink-0" />
      <div className="space-y-1 text-sm">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}
