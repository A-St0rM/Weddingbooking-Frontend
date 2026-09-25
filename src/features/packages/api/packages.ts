import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type PackageInput = components['schemas']['PackageRequest'];

export const packageKeys = {
  all: ['packages'] as const,
  list: (includeInactive: boolean) => ['packages', 'list', includeInactive] as const,
  detail: (id: string) => ['packages', 'detail', id] as const,
  settings: ['settings', 'pricing'] as const,
};

export function usePackages(includeInactive = false, enabled = true) {
  return useQuery({
    queryKey: packageKeys.list(includeInactive),
    queryFn: () => call(api.GET('/api/packages', { params: { query: { includeInactive } } })),
    enabled,
  });
}

export function usePackage(id: string | undefined) {
  return useQuery({
    queryKey: packageKeys.detail(id ?? ''),
    queryFn: () => call(api.GET('/api/packages/{id}', { params: { path: { id: id! } } })),
    enabled: Boolean(id),
  });
}

function useRefresh() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: packageKeys.all });
}

export function useSavePackage(id: string | undefined) {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (body: PackageInput) =>
      id
        ? call(api.PUT('/api/packages/{id}', { params: { path: { id } }, body }))
        : call(api.POST('/api/packages', { body })),
    onSuccess: refresh,
  });
}

export function useSetPackageActive(id: string) {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (isActive: boolean) => call(api.PUT('/api/packages/{id}/active', { params: { path: { id } }, body: { isActive } })),
    onSuccess: refresh,
  });
}

export function useCopyPackage(id: string) {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (body: { year: number; priceChangePercent: number }) =>
      call(api.POST('/api/packages/{id}/copy', { params: { path: { id } }, body })),
    onSuccess: refresh,
  });
}

export function usePricingSettings() {
  return useQuery({ queryKey: packageKeys.settings, queryFn: () => call(api.GET('/api/settings/pricing')) });
}

export function useUpdatePricingSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { smallWeddingThreshold: number; smallWeddingSurcharge: number }) =>
      call(api.PUT('/api/settings/pricing', { body })),
    onSuccess: (settings) => queryClient.setQueryData(packageKeys.settings, settings),
  });
}
