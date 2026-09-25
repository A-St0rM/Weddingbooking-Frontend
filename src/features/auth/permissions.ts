import type { Role } from '@/lib/api/types';
import { useCurrentUser } from '@/features/auth/currentUser';

/**
 * What to show. This hides buttons a role cannot use, so nobody taps into a
 * refusal — it is not access control. The API decides, and leaves price fields
 * out of its answers for the roles that may not see them.
 */
export function permissionsFor(role: Role) {
  return {
    manages: role === 'EventManager' || role === 'Owner',
    seesPrices: role === 'EventManager' || role === 'Owner' || role === 'Bookkeeper',
  };
}

export function usePermissions() {
  return permissionsFor(useCurrentUser().role);
}
