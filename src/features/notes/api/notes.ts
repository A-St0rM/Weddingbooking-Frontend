import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';
import type { NoteType } from '@/lib/api/types';

export const noteKeys = { forBooking: (id: string) => ['notes', id] as const };

export function useNotes(bookingId: string) {
  return useQuery({
    queryKey: noteKeys.forBooking(bookingId),
    queryFn: () => call(api.GET('/api/bookings/{id}/notes', { params: { path: { id: bookingId } } })),
  });
}

export function useWriteNote(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { type: NoteType; text: string }) => call(api.POST('/api/bookings/{id}/notes', { params: { path: { id: bookingId } }, body })),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: noteKeys.forBooking(bookingId) }),
  });
}
