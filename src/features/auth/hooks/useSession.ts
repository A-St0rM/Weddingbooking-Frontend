import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export type SessionState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; session: Session };

/**
 * The Supabase session, kept current. When the signed-in person changes, every
 * cached answer is dropped: they belonged to someone else, and a cached 403
 * would otherwise greet the next person to log in on the same phone.
 */
export function useSession(): SessionState {
  const queryClient = useQueryClient();
  const [state, setState] = useState<SessionState>(() =>
    isSupabaseConfigured ? { status: 'loading' } : { status: 'signedOut' },
  );

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    let currentUserId: string | undefined;
    const apply = (session: Session | null) => {
      const userId = session?.user.id;
      if (userId !== currentUserId) {
        queryClient.clear();
        currentUserId = userId;
      }
      setState(session ? { status: 'signedIn', session } : { status: 'signedOut' });
    };

    void supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session));
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  return state;
}

export async function signOut() {
  await getSupabase()?.auth.signOut();
}
