import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';
import type { Readiness } from '@/lib/api/types';

const key = (id: string) => ['readiness', id] as const;

export function useReadiness(bookingId: string) {
  return useQuery({
    queryKey: key(bookingId),
    queryFn: () => call(api.GET('/api/bookings/{id}/readiness', { params: { path: { id: bookingId } } })),
  });
}

export function useReadinessActions(bookingId: string) {
  const queryClient = useQueryClient();
  const onSuccess = (readiness: Readiness) => {
    queryClient.setQueryData(key(bookingId), readiness);
    // "Klar til afholdelse" is part of the booking's status.
    void queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };
  const path = { id: bookingId };
  return {
    update: useMutation({
      mutationFn: ({ itemId, body }: { itemId: string; body: components['schemas']['UpdateReadinessRequest'] }) =>
        call(api.PUT('/api/bookings/{id}/readiness/{itemId}', { params: { path: { id: bookingId, itemId } }, body })),
      onSuccess,
    }),
    add: useMutation({
      mutationFn: (body: components['schemas']['AddReadinessRequest']) => call(api.POST('/api/bookings/{id}/readiness', { params: { path }, body })),
      onSuccess,
    }),
    remove: useMutation({
      mutationFn: (itemId: string) => call(api.DELETE('/api/bookings/{id}/readiness/{itemId}', { params: { path: { id: bookingId, itemId } } })),
      onSuccess,
    }),
  };
}
