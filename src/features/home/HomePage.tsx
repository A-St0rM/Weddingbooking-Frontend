import { PageHeader } from '@/components/ui/PageHeader';
import { roleLabels } from '@/lib/format';
import { useCurrentUser } from '@/features/auth/currentUser';

export function HomePage() {
  const me = useCurrentUser();
  return <PageHeader title={`Velkommen, ${me.name}`} description={roleLabels[me.role]} />;
}
