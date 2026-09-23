import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

/**
 * The Supabase session, kept in step with the browser. supabase-js persists it,
 * so a refresh does not sign anyone out.
 */
export function useSession() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);

      // Everything cached was fetched as the previous person. On a shared
      // laptop, leaving it there shows one colleague another's data.
      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
        queryClient.clear();
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [queryClient]);

  return { session, loading, configured: isSupabaseConfigured };
}

export async function logUd() {
  await getSupabaseClient()?.auth.signOut();
}
