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
    // The payment plan follows the price; ask the accounting system again.
    void queryClient.invalidateQueries({ queryKey: ['payments', booking.id] });
    // A date or a viewing changes what the calendar shows and which times are free.
    void queryClient.invalidateQueries({ queryKey: ['calendar'] });
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

/** Adding a package, a line, changing or removing one — each answers with the whole booking and its new price. */
export function useBookingLines(id: string) {
  const store = useStoreBooking();
  const path = { id };
  return {
    addPackage: useMutation({
      mutationFn: (packageId: string) => call(api.POST('/api/bookings/{id}/packages', { params: { path }, body: { packageId } })),
      onSuccess: store,
    }),
    addLine: useMutation({
      mutationFn: (body: components['schemas']['LineRequest']) => call(api.POST('/api/bookings/{id}/lines', { params: { path }, body })),
      onSuccess: store,
    }),
    updateLine: useMutation({
      mutationFn: ({ lineId, body }: { lineId: string; body: components['schemas']['LineRequest'] }) =>
        call(api.PUT('/api/bookings/{id}/lines/{lineId}', { params: { path: { id, lineId } }, body })),
      onSuccess: store,
    }),
    removeLine: useMutation({
      mutationFn: (lineId: string) => call(api.DELETE('/api/bookings/{id}/lines/{lineId}', { params: { path: { id, lineId } } })),
      onSuccess: store,
    }),
  };
}

export function useScheduleViewing(id: string) {
  const store = useStoreBooking();
  return useMutation({
    mutationFn: (body: components['schemas']['ScheduleViewingRequest']) =>
      call(api.PUT('/api/bookings/{id}/viewing', { params: { path: { id } }, body })),
    onSuccess: store,
  });
}

export function useRequestDecision(id: string) {
  const store = useStoreBooking();
  const queryClient = useQueryClient();
  return {
    accept: useMutation({
      mutationFn: () => call(api.POST('/api/bookings/{id}/request/accept', { params: { path: { id } } })),
      onSuccess: store,
    }),
    decline: useMutation({
      mutationFn: (reason: string) => call(api.POST('/api/bookings/{id}/request/decline', { params: { path: { id } }, body: { reason: reason || null } })),
      onSuccess: (booking) => {
        store(booking);
        void queryClient.invalidateQueries({ queryKey: ['notes', id] });
      },
    }),
  };
}
