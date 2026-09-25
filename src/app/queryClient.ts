import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/errors';

/**
 * A 4xx is an answer, not a hiccup: asking again gives the same answer, only
 * later. Retry once for an unreachable or failing server, never for the rest.
 */
function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 1;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: shouldRetry, staleTime: 30_000, refetchOnWindowFocus: true },
    mutations: { retry: false },
  },
});
