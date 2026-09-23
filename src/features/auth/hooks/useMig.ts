import { useQuery } from '@tanstack/react-query';
import { hentMig } from '@/features/auth/api/authApi';

export function useMig(enabled: boolean) {
  return useQuery({
    queryKey: ['mig'],
    queryFn: hentMig,
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export const rolleNavne: Record<string, string> = {
  EventManager: 'Event manager',
  Ejer: 'Ejer',
  Bogholder: 'Bogholder',
  Kok: 'Kok',
  EventProducer: 'Event producer',
};
