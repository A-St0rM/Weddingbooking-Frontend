import { createBrowserRouter, Link } from 'react-router-dom';
import { AppShell } from '@/app/layout/AppShell';
import { AccessGate } from '@/features/auth/components/AccessGate';
import { ProfilePage } from '@/features/auth/components/ProfilePage';
import { HomePage } from '@/features/home/HomePage';
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
      { path: 'profil', element: <ProfilePage /> },
      {
        path: '*',
        element: (
          <EmptyState title="Siden findes ikke" action={<Link className="font-medium text-primary underline" to="/">Til oversigten</Link>} />
        ),
      },
    ],
  },
]);
