import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';
import type { CustomerDetail } from '@/lib/api/types';

export const customerKeys = {
  list: (search: string) => ['customers', 'list', search] as const,
  detail: (id: string) => ['customers', 'detail', id] as const,
};

export function useCustomers(search: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: customerKeys.list(search),
    queryFn: () => call(api.GET('/api/customers', { params: { query: { search: search || undefined } } })),
    placeholderData: (previous) => previous,
    enabled: options.enabled ?? true,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => call(api.GET('/api/customers/{id}', { params: { path: { id } } })),
  });
}

export type CustomerDetails = components['schemas']['UpdateCustomerRequest'];
export type PartnerInput = components['schemas']['PartnerRequest'];

/** Every change to a customer answers with the whole customer; store it and refresh what shows it. */
export function useCustomerMutations(id: string) {
  const queryClient = useQueryClient();
  const onSuccess = (detail: CustomerDetail) => {
    queryClient.setQueryData(customerKeys.detail(id), detail);
    void queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
    void queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };
  const path = { id };

  return {
    update: useMutation({
      mutationFn: (body: CustomerDetails) => call(api.PUT('/api/customers/{id}', { params: { path }, body })),
      onSuccess,
    }),
    updatePartner: useMutation({
      mutationFn: ({ contactId, ...body }: PartnerInput & { contactId: string }) =>
        call(api.PUT('/api/customers/{id}/contacts/{contactId}', { params: { path: { id, contactId } }, body })),
      onSuccess,
    }),
    addMissingPartner: useMutation({
      mutationFn: (body: PartnerInput) => call(api.POST('/api/customers/{id}/contacts', { params: { path }, body })),
      onSuccess,
    }),
    makePayer: useMutation({
      mutationFn: (contactId: string) =>
        call(api.POST('/api/customers/{id}/contacts/{contactId}/payer', { params: { path: { id, contactId } } })),
      onSuccess,
    }),
  };
}

/** Customers left from before the couple was two people — the migration's report. Empty when all is well. */
export function useIncompleteCustomers(enabled: boolean) {
  return useQuery({ queryKey: ['customers', 'incomplete'], queryFn: () => call(api.GET('/api/customers/incomplete')), enabled });
}
