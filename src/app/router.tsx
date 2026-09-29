import { createBrowserRouter, Link, Navigate } from 'react-router-dom';
import { AppShell } from '@/app/layout/AppShell';
import { AccessGate } from '@/features/auth/components/AccessGate';
import { MorePage } from '@/features/auth/components/MorePage';
import { AccountingSimPage } from '@/features/accounting-sim/components/AccountingSimPage';
import { HomePage } from '@/features/home/HomePage';
import { BookingListPage } from '@/features/bookings/components/BookingListPage';
import { BookingPage } from '@/features/bookings/components/BookingPage';
import { NewBookingPage } from '@/features/bookings/components/NewBookingPage';
import { CustomerListPage } from '@/features/customers/components/CustomerListPage';
import { PackageListPage } from '@/features/packages/components/PackageListPage';
import { PackagePage } from '@/features/packages/components/PackagePage';
import { CustomerPage } from '@/features/customers/components/CustomerPage';
import { EmptyState } from '@/components/ui/EmptyState';

export const router = createBrowserRouter([
  {
    element: (
      <AccessGate>
        <AppShell />
      </AccessGate>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'bookinger', element: <BookingListPage /> },
      { path: 'bookinger/ny', element: <NewBookingPage /> },
      { path: 'bookinger/:id', element: <BookingPage /> },
      { path: 'kunder', element: <CustomerListPage /> },
      { path: 'kunder/:id', element: <CustomerPage /> },
      { path: 'pakker', element: <PackageListPage /> },
      { path: 'pakker/:id', element: <PackagePage /> },
      { path: 'regnskab', element: <AccountingSimPage /> },
      { path: 'mere', element: <MorePage /> },
      { path: 'profil', element: <Navigate to="/mere" replace /> },
      {
        path: '*',
        element: (
          <EmptyState title="Siden findes ikke" action={<Link className="font-medium text-primary underline" to="/">Til oversigten</Link>} />
        ),
      },
    ],
  },
]);
