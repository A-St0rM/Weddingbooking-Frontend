import { api } from '@/lib/apiClient';

export interface Mig {
  id: string;
  navn: string;
  email: string;
  rolle: 'EventManager' | 'Ejer' | 'Bogholder' | 'Kok' | 'EventProducer';
}

/** Who the API thinks you are. Being signed in is not the same as being known here. */
export const hentMig = () => api<Mig>('/api/mig');
