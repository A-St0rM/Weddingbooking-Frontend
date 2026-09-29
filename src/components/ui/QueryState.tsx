import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { errorMessage } from '@/lib/api/errorMessage';

/** Loading, error with retry, or the data. */
export function QueryState<T>({ query, children }: { query: UseQueryResult<T>; children: (data: T) => ReactNode }) {
  if (query.isPending) return <div className="py-10 text-center text-ink-muted"><Spinner label="Henter" /></div>;
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
