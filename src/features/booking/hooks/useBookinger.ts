import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  hentBooking,
  hentBookinger,
  hentBookingerPaaDato,
  opretBooking,
  sætBetaler,
} from '@/features/booking/api/bookingApi';

export function useBookinger(søg = '') {
  return useQuery({
    queryKey: ['bookinger', { søg }],
    queryFn: () => hentBookinger(søg || undefined),
  });
}

export function useBooking(id: string) {
  return useQuery({ queryKey: ['booking', id], queryFn: () => hentBooking(id) });
}

/**
 * Looks for Bookings already on a date. Deliberately a warning, not a block:
 * the manor house does occasionally run two events on one day, and the system
 * should not decide that for them.
 */
export function useBookingerPaaDato(bryllupsdato: string | null) {
  return useQuery({
    queryKey: ['bookinger', 'dato', bryllupsdato],
    queryFn: () => hentBookingerPaaDato(bryllupsdato!),
    enabled: Boolean(bryllupsdato),
  });
}

export function useOpretBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: opretBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookinger'] }),
  });
}

export function useSætBetaler(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (betalerKundeId: string | null) => sætBetaler(bookingId, betalerKundeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      await queryClient.invalidateQueries({ queryKey: ['bookinger'] });
    },
  });
}
