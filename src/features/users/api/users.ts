import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: () => call(api.GET('/api/users')) });
}

export function useUserActions() {
  const queryClient = useQueryClient();
  const onSuccess = () => void queryClient.invalidateQueries({ queryKey: ['users'] });
  return {
    create: useMutation({
      mutationFn: (body: components['schemas']['CreateUserRequest']) => call(api.POST('/api/users', { body })),
      onSuccess,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: components['schemas']['UpdateUserRequest'] }) =>
        call(api.PUT('/api/users/{id}', { params: { path: { id } }, body })),
      onSuccess,
    }),
  };
}
