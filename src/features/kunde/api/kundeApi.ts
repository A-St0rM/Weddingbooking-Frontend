import { api } from '@/lib/apiClient';
import type { Booking } from '@/features/booking/types';
import type { Kunde, KundeFelter, KontaktpersonFelter } from '@/features/kunde/types';

export interface KundeMedHistorik {
  kunde: Kunde;
  /** Everything this customer has ever booked here, or is paying for. */
  bookinger: Booking[];
}

export const hentKunder = (søg?: string) =>
  api<Kunde[]>(`/api/kunder${søg ? `?søg=${encodeURIComponent(søg)}` : ''}`);

export const hentKunde = (id: string) => api<KundeMedHistorik>(`/api/kunder/${id}`);

export const retKunde = (id: string, felter: KundeFelter) =>
  api<Kunde>(`/api/kunder/${id}`, { method: 'PUT', body: JSON.stringify(felter) });

export const tilføjKontaktperson = (kundeId: string, felter: KontaktpersonFelter) =>
  api<Kunde>(`/api/kunder/${kundeId}/kontaktpersoner`, {
    method: 'POST',
    body: JSON.stringify(felter),
  });

export const gørPrimær = (kundeId: string, kontaktpersonId: string) =>
  api<Kunde>(`/api/kunder/${kundeId}/kontaktpersoner/${kontaktpersonId}/primaer`, {
    method: 'PUT',
  });

export const fjernKontaktperson = (kundeId: string, kontaktpersonId: string) =>
  api<Kunde>(`/api/kunder/${kundeId}/kontaktpersoner/${kontaktpersonId}`, { method: 'DELETE' });
