import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';
import type { Booking, SalesStage } from '@/lib/api/types';

export const bookingKeys = {
  all: ['bookings'] as const,
  list: (filter: BookingFilter) => ['bookings', 'list', filter] as const,
  detail: (id: string) => ['bookings', 'detail', id] as const,
  onDate: (date: string, except?: string) => ['bookings', 'on-date', date, except] as const,
};

export interface BookingFilter {
  search?: string;
  includePast?: boolean;
  includeClosed?: boolean;
}

export function useBookings(filter: BookingFilter = {}) {
  return useQuery({
    queryKey: bookingKeys.list(filter),
    queryFn: () => call(api.GET('/api/bookings', { params: { query: filter } })),
    placeholderData: (previous) => previous,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => call(api.GET('/api/bookings/{id}', { params: { path: { id } } })),
  });
}

/** Live bookings already on a date — for the warning, never a block. */
export function useBookingsOnDate(date: string, except?: string) {
  return useQuery({
    queryKey: bookingKeys.onDate(date, except),
    queryFn: () => call(api.GET('/api/bookings/on-date', { params: { query: { date, except } } })),
    enabled: /^\d{4}-\d{2}-\d{2}$/.test(date),
  });
}

function useStoreBooking() {
  const queryClient = useQueryClient();
  return (booking: Booking) => {
    queryClient.setQueryData(bookingKeys.detail(booking.id), booking);
    void queryClient.invalidateQueries({ queryKey: ['bookings', 'list'] });
    void queryClient.invalidateQueries({ queryKey: ['bookings', 'on-date'] });
    void queryClient.invalidateQueries({ queryKey: ['customers'] });
  };
}

export type NewBooking = components['schemas']['CreateBookingRequest'];

export function useCreateBooking() {
  const store = useStoreBooking();
  return useMutation({
    mutationFn: (body: NewBooking) => call(api.POST('/api/bookings', { body })),
    onSuccess: store,
  });
}

export type BookingChange = components['schemas']['UpdateBookingRequest'];

export function useUpdateBooking(id: string) {
  const store = useStoreBooking();
  return useMutation({
    mutationFn: (body: BookingChange) => call(api.PUT('/api/bookings/{id}', { params: { path: { id } }, body })),
    onSuccess: store,
  });
}

export function useChangeStage(id: string) {
  const store = useStoreBooking();
  return useMutation({
    mutationFn: (stage: SalesStage) =>
      call(api.PUT('/api/bookings/{id}/stage', { params: { path: { id } }, body: { stage } })),
    onSuccess: store,
  });
}
