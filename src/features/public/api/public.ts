import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type PublicPerson = components['schemas']['PublicPerson'];

export function useViewingTimes() {
  return useQuery({ queryKey: ['public', 'viewing-times'], queryFn: () => call(api.GET('/api/public/viewing-times')), staleTime: 0 });
}

export function useWeddingDates() {
  return useQuery({ queryKey: ['public', 'wedding-dates'], queryFn: () => call(api.GET('/api/public/wedding-dates')) });
}

/** A taken time or date refreshes the lists, so the couple can pick again straight away. */
export function usePublicRequests() {
  const queryClient = useQueryClient();
  const onError = () => void queryClient.invalidateQueries({ queryKey: ['public'] });
  return {
    viewing: useMutation({
      mutationFn: (body: components['schemas']['ViewingRequest']) => call(api.POST('/api/public/requests/viewing', { body })),
      onError,
    }),
    wedding: useMutation({
      mutationFn: (body: components['schemas']['WeddingRequest']) => call(api.POST('/api/public/requests/wedding', { body })),
      onError,
    }),
  };
}
