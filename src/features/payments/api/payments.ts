import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';
import { fileFrom, saveBlob } from '@/lib/api/download';
import type { InstalmentKind, Payments } from '@/lib/api/types';

export const paymentKeys = {
  forBooking: (id: string) => ['payments', id] as const,
};

/** Read fresh from the accounting system — status is asked for, never pushed. */
export function usePayments(bookingId: string) {
  return useQuery({
    queryKey: paymentKeys.forBooking(bookingId),
    queryFn: () => call(api.GET('/api/bookings/{id}/payments', { params: { path: { id: bookingId } } })),
    staleTime: 0,
  });
}

export function usePaymentActions(bookingId: string) {
  const queryClient = useQueryClient();
  const onSuccess = (payments: Payments) => {
    queryClient.setQueryData(paymentKeys.forBooking(bookingId), payments);
    // The status word depends on the payments; refresh what shows it.
    void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    void queryClient.invalidateQueries({ queryKey: ['accounting-sim'] });
  };
  const path = { id: bookingId };

  return {
    createQuote: useMutation({
      mutationFn: () => call(api.POST('/api/bookings/{id}/payments/quote', { params: { path } })),
      onSuccess,
    }),
    createInvoice: useMutation({
      mutationFn: (kind: InstalmentKind) => call(api.POST('/api/bookings/{id}/payments/invoices', { params: { path }, body: { kind } })),
      onSuccess,
    }),
    bookInvoice: useMutation({
      mutationFn: (number: string) =>
        call(api.POST('/api/bookings/{id}/payments/invoices/{number}/book', { params: { path: { id: bookingId, number } } })),
      onSuccess,
    }),
    downloadPdf: useMutation({
      mutationFn: async (number: string) => {
        const blob = await fileFrom(
          api.GET('/api/bookings/{id}/payments/documents/{number}/pdf', { params: { path: { id: bookingId, number } }, parseAs: 'blob' }),
        );
        saveBlob(blob, `bilag-${number}.pdf`);
      },
    }),
  };
}
