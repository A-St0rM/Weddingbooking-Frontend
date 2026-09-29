import { useQuery } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type Me = components['schemas']['MeResponse'];

export const meQueryKey = ['me'] as const;

export function useMe(enabled: boolean) {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: () => call(api.GET('/api/me')),
    enabled,
  });
}
