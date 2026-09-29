import { Link } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';

export function BackLink({ to, children }: { to: string; children: string }) {
  return (
    <Link to={to} className="-ml-2 mb-3 inline-flex min-h-11 items-center gap-1 rounded-control px-2 font-medium text-primary">
      <CaretLeft aria-hidden="true" weight="bold" className="size-4" />
      {children}
    </Link>
  );
}
