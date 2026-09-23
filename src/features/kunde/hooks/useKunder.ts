import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fjernKontaktperson,
  gørPrimær,
  hentKunde,
  hentKunder,
  retKunde,
  tilføjKontaktperson,
} from '@/features/kunde/api/kundeApi';

export function useKunder(søg: string) {
  return useQuery({ queryKey: ['kunder', søg], queryFn: () => hentKunder(søg || undefined) });
}

export function useKunde(id: string) {
  return useQuery({ queryKey: ['kunde', id], queryFn: () => hentKunde(id) });
}

/**
 * Every mutation below invalidates the same two keys: the customer being edited
 * and the booking list, which shows customer names. Keeping that in one place
 * stops a screen quietly showing yesterday's name.
 */
function useKundeMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>, kundeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['kunde', kundeId] });
      await queryClient.invalidateQueries({ queryKey: ['kunder'] });
      await queryClient.invalidateQueries({ queryKey: ['bookinger'] });
    },
  });
}

export const useRetKunde = (id: string) =>
  useKundeMutation((felter: Parameters<typeof retKunde>[1]) => retKunde(id, felter), id);

export const useTilføjKontaktperson = (id: string) =>
  useKundeMutation(
    (felter: Parameters<typeof tilføjKontaktperson>[1]) => tilføjKontaktperson(id, felter),
    id,
  );

export const useGørPrimær = (id: string) =>
  useKundeMutation((kontaktpersonId: string) => gørPrimær(id, kontaktpersonId), id);

export const useFjernKontaktperson = (id: string) =>
  useKundeMutation((kontaktpersonId: string) => fjernKontaktperson(id, kontaktpersonId), id);
