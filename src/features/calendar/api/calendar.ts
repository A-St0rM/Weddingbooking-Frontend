import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export function useCalendar(from: string, to: string) {
  return useQuery({
    queryKey: ['calendar', 'events', from, to],
    queryFn: () => call(api.GET('/api/calendar', { params: { query: { from, to } } })),
    placeholderData: (previous) => previous,
  });
}

export function useSlots(hostId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['calendar', 'slots', hostId ?? 'all'],
    queryFn: () => call(api.GET('/api/calendar/slots', { params: { query: { hostId, count: 5 } } })),
    staleTime: 0,
    enabled,
  });
}

export function useAvailability() {
  return useQuery({ queryKey: ['calendar', 'availability'], queryFn: () => call(api.GET('/api/calendar/availability')) });
}

/** Anything that changes the calendar refreshes all of it: events, free times, the weeks. */
export function useCalendarActions() {
  const queryClient = useQueryClient();
  const onSuccess = () => void queryClient.invalidateQueries({ queryKey: ['calendar'] });
  return {
    setAvailability: useMutation({
      mutationFn: ({ hostId, windows }: { hostId: string; windows: components['schemas']['WindowDto'][] }) =>
        call(api.PUT('/api/calendar/availability/{hostId}', { params: { path: { hostId } }, body: windows })),
      onSuccess,
    }),
    block: useMutation({
      mutationFn: (body: components['schemas']['BlockRequest']) => call(api.POST('/api/calendar/blocks', { body })),
      onSuccess,
    }),
    unblock: useMutation({
      mutationFn: (id: string) => call(api.DELETE('/api/calendar/blocks/{id}', { params: { path: { id } } })),
      onSuccess,
    }),
  };
}
