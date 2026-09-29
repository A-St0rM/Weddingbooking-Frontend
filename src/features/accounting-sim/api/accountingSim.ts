import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';

export function useSimDocuments() {
  return useQuery({ queryKey: ['accounting-sim'], queryFn: () => call(api.GET('/api/accounting-sim/documents')), staleTime: 0 });
}

export function useSimActions() {
  const queryClient = useQueryClient();
  const onSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: ['accounting-sim'] });
    void queryClient.invalidateQueries({ queryKey: ['payments'] });
    void queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };
  return {
    markSent: useMutation({
      mutationFn: (number: string) => call(api.POST('/api/accounting-sim/documents/{number}/sent', { params: { path: { number } } })),
      onSuccess,
    }),
    registerPayment: useMutation({
      mutationFn: ({ number, amount }: { number: string; amount: number }) =>
        call(api.POST('/api/accounting-sim/documents/{number}/payments', { params: { path: { number } }, body: { amount, paidOn: null } })),
      onSuccess,
    }),
  };
}
