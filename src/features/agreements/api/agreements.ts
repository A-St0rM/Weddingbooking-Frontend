import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';
import { fileFrom, saveBlob } from '@/lib/api/download';
import type { components } from '@/lib/api/schema';

export type Agreement = components['schemas']['AgreementResponse'];
export type AgreementVersion = components['schemas']['AgreementVersionResponse'];

export const agreementKeys = { forBooking: (id: string) => ['agreement', id] as const };

export function useAgreement(bookingId: string) {
  return useQuery({
    queryKey: agreementKeys.forBooking(bookingId),
    queryFn: () => call(api.GET('/api/bookings/{id}/agreement', { params: { path: { id: bookingId } } })),
  });
}

export function useAgreementActions(bookingId: string) {
  const queryClient = useQueryClient();
  const path = { id: bookingId };
  const onSuccess = (agreement: Agreement) => {
    queryClient.setQueryData(agreementKeys.forBooking(bookingId), agreement);
    // Generating saves the clarification and signing moves the stage: the booking and its plan change too.
    void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    void queryClient.invalidateQueries({ queryKey: ['payments', bookingId] });
  };

  return {
    preview: useMutation({
      mutationFn: async (clarification: string) =>
        saveBlob(
          await fileFrom(api.POST('/api/bookings/{id}/agreement/preview', { params: { path }, body: { clarification }, parseAs: 'blob' })),
          'aftale-forhaandsvisning.pdf',
        ),
    }),
    generate: useMutation({
      mutationFn: (clarification: string) => call(api.POST('/api/bookings/{id}/agreement/versions', { params: { path }, body: { clarification } })),
      onSuccess,
    }),
    uploadSigned: useMutation({
      mutationFn: ({ versionId, file }: { versionId: string; file: File }) => {
        const form = new FormData();
        form.append('file', file);
        return call(
          api.POST('/api/bookings/{id}/agreement/versions/{versionId}/signed', {
            params: { path: { id: bookingId, versionId } },
            // The generated type describes the field; the browser builds the multipart body.
            body: form as unknown as { file: string },
            bodySerializer: (body) => body as unknown as FormData,
          }),
        );
      },
      onSuccess,
    }),
    attachToQuote: useMutation({
      mutationFn: (versionId: string) =>
        call(api.POST('/api/bookings/{id}/agreement/versions/{versionId}/attach-to-quote', { params: { path: { id: bookingId, versionId } } })),
      onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['accounting-sim'] }),
    }),
    download: useMutation({
      mutationFn: async ({ version, signed }: { version: AgreementVersion; signed: boolean }) => {
        const params = { path: { id: bookingId, versionId: version.id } };
        const blob = await fileFrom(
          signed
            ? api.GET('/api/bookings/{id}/agreement/versions/{versionId}/signed', { params, parseAs: 'blob' })
            : api.GET('/api/bookings/{id}/agreement/versions/{versionId}/pdf', { params, parseAs: 'blob' }),
        );
        saveBlob(blob, `${signed ? 'underskrevet-' : ''}aftale-v${version.number}.pdf`);
      },
    }),
  };
}
