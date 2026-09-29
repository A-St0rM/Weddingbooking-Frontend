import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';
import { noteKeys } from '@/features/notes/api/notes';

export function useTemplates(enabled = true) {
  return useQuery({ queryKey: ['templates'], queryFn: () => call(api.GET('/api/message-templates')), enabled });
}

export function usePlaceholders() {
  return useQuery({ queryKey: ['templates', 'placeholders'], queryFn: () => call(api.GET('/api/message-templates/placeholders')), staleTime: Infinity });
}

export function useTemplateActions() {
  const queryClient = useQueryClient();
  const onSuccess = () => void queryClient.invalidateQueries({ queryKey: ['templates'] });
  return {
    save: useMutation({
      mutationFn: ({ id, body }: { id?: string; body: components['schemas']['MessageTemplateRequest'] }) =>
        id ? call(api.PUT('/api/message-templates/{id}', { params: { path: { id } }, body })) : call(api.POST('/api/message-templates', { body })),
      onSuccess,
    }),
    remove: useMutation({
      mutationFn: (id: string) => call(api.DELETE('/api/message-templates/{id}', { params: { path: { id } } })),
      onSuccess,
    }),
  };
}

/** A suggestion merged from a template and the booking. Nothing is sent by asking for one. */
export function useDraft(bookingId: string) {
  return useMutation({
    mutationFn: (templateId: string) => call(api.POST('/api/bookings/{id}/messages/draft', { params: { path: { id: bookingId } }, body: { templateId } })),
  });
}

export function useSend(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: components['schemas']['SendRequest']) => call(api.POST('/api/bookings/{id}/messages/send', { params: { path: { id: bookingId } }, body })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.forBooking(bookingId) });
      void queryClient.invalidateQueries({ queryKey: ['outbox'] });
    },
  });
}

export function useOutbox() {
  return useQuery({ queryKey: ['outbox'], queryFn: () => call(api.GET('/api/outbox')), staleTime: 0 });
}

export function useViewingHosts() {
  return useQuery({ queryKey: ['viewing-hosts'], queryFn: () => call(api.GET('/api/bookings/viewing-hosts')) });
}
