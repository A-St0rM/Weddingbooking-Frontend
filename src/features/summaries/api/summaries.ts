import { useMutation } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';

/** Made fresh each time and never stored by itself. */
export function useBookingSummary(bookingId: string) {
  return useMutation({
    mutationFn: (extraText: string) =>
      call(api.POST('/api/bookings/{id}/summary', { params: { path: { id: bookingId } }, body: { extraText: extraText || null } })),
  });
}

export function useStandaloneSummary() {
  return useMutation({
    mutationFn: (text: string) => call(api.POST('/api/summary/standalone', { body: { text } })),
  });
}
