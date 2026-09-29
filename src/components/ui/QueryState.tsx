import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { errorMessage } from '@/lib/api/errorMessage';

/** Loading, error with retry, or the data. */
export function QueryState<T>({ query, children }: { query: UseQueryResult<T>; children: (data: T) => ReactNode }) {
  if (query.isPending) return <Skeleton />;
  if (query.isError) {
    return (
      <Alert tone="danger" title="Kunne ikke hente">
        <p>{errorMessage(query.error)}</p>
        <Button size="sm" variant="secondary" className="mt-3" onClick={() => void query.refetch()}>
          Prøv igen
        </Button>
      </Alert>
    );
  }
  return <>{children(query.data)}</>;
}

/** The shape of a list arriving, instead of a spinner in empty space. */
export function Skeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Henter" className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-card bg-neutral-soft/80" style={{ opacity: 1 - i * 0.18 }} />
      ))}
    </div>
  );
}
