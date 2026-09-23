import { RouterProvider } from 'react-router-dom';
import { Providers } from '@/app/providers';
import { router } from '@/app/router';
import { RequireLogin } from '@/features/auth/components/RequireLogin';

export function App() {
  return (
    <Providers>
      <RequireLogin>
        <RouterProvider router={router} />
      </RequireLogin>
    </Providers>
  );
}
