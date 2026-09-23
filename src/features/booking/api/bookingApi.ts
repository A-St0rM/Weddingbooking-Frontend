import { api } from '@/lib/apiClient';
import type { Booking, OpretBooking } from '@/features/booking/types';

export const hentBookinger = (søg?: string) =>
  api<Booking[]>(`/api/bookinger${søg ? `?søg=${encodeURIComponent(søg)}` : ''}`);

export const hentBooking = (id: string) => api<Booking>(`/api/bookinger/${id}`);

/** Used to warn before two weddings land on the same Saturday. */
export const hentBookingerPaaDato = (bryllupsdato: string) =>
  api<Booking[]>(`/api/bookinger?bryllupsdato=${encodeURIComponent(bryllupsdato)}`);

export const opretBooking = (booking: OpretBooking) =>
  api<Booking>('/api/bookinger', { method: 'POST', body: JSON.stringify(booking) });

/** Null hands the bill back to the couple. */
export const sætBetaler = (id: string, betalerKundeId: string | null) =>
  api<Booking>(`/api/bookinger/${id}/betaler`, {
    method: 'PUT',
    body: JSON.stringify({ betalerKundeId }),
  });
