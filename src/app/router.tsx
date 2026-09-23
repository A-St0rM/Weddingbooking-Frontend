import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/app/layout/AppLayout';
import { BookingListe } from '@/features/booking/components/BookingListe';
import { BookingSide } from '@/features/booking/components/BookingSide';
import { OpretBookingSide } from '@/features/booking/components/OpretBookingSide';
import { KundeListe } from '@/features/kunde/components/KundeListe';
import { KundeSide } from '@/features/kunde/components/KundeSide';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/bookinger" replace /> },
      { path: 'bookinger', element: <BookingListe /> },
      // Before ':id', or "ny" is read as a booking id.
      { path: 'bookinger/ny', element: <OpretBookingSide /> },
      { path: 'bookinger/:id', element: <BookingSide /> },
      { path: 'kunder', element: <KundeListe /> },
      { path: 'kunder/:id', element: <KundeSide /> },
    ],
  },
]);
