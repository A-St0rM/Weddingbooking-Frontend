import { createContext, useContext } from 'react';
import type { Me } from '@/features/auth/hooks/useMe';

export const CurrentUserContext = createContext<Me | null>(null);

/** The person using the app. Only available inside AccessGate. */
export function useCurrentUser(): Me {
  const me = useContext(CurrentUserContext);
  if (!me) throw new Error('useCurrentUser used outside AccessGate');
  return me;
}
