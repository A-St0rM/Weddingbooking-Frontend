import { createBrowserRouter, Link, Navigate } from 'react-router-dom';
import { AppShell } from '@/app/layout/AppShell';
import { AccessGate } from '@/features/auth/components/AccessGate';
import { ComposePage } from '@/features/messages/components/ComposePage';
import { OutboxPage } from '@/features/messages/components/OutboxPage';
import { TemplatesPage } from '@/features/messages/components/TemplatesPage';
import { StandaloneSummaryPage } from '@/features/summaries/components/StandaloneSummaryPage';
import { TrelloImportPage } from '@/features/trello/components/TrelloImportPage';
import { TrelloBoardPage } from '@/features/trello/components/TrelloBoardPage';
import { CalendarPage } from '@/features/calendar/components/CalendarPage';
import { RequestStartPage, ViewingRequestPage, WeddingRequestPage } from '@/features/public/components/RequestForms';
import { UsersPage } from '@/features/users/components/UsersPage';
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
  // Open without login: the standalone AI summary.
  { path: '/resume', element: <StandaloneSummaryPage /> },
  // Open without login: the forms the website links to.
  { path: '/bestil', element: <RequestStartPage /> },
  { path: '/bestil/fremvisning', element: <ViewingRequestPage /> },
  { path: '/bestil/bryllup', element: <WeddingRequestPage /> },
  {
    element: (
      <AccessGate>
        <AppShell />
      </AccessGate>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'bookinger', element: <BookingListPage />, handle: { wide: true } },
      { path: 'bookinger/ny', element: <NewBookingPage /> },
      { path: 'bookinger/:id', element: <BookingPage />, handle: { wide: true } },
      { path: 'bookinger/:id/mail', element: <ComposePage /> },
      { path: 'kalender', element: <CalendarPage />, handle: { wide: true } },
      { path: 'kunder', element: <CustomerListPage /> },
      { path: 'kunder/:id', element: <CustomerPage /> },
      { path: 'pakker', element: <PackageListPage /> },
      { path: 'pakker/:id', element: <PackagePage /> },
      { path: 'regnskab', element: <AccountingSimPage /> },
      { path: 'tekstbidder', element: <TemplatesPage /> },
      { path: 'udbakke', element: <OutboxPage /> },
      { path: 'trello', element: <TrelloBoardPage />, handle: { wide: true } },
      { path: 'trello/import', element: <TrelloImportPage /> },
      { path: 'brugere', element: <UsersPage /> },
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
