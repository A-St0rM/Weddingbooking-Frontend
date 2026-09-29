import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase is used for login and nothing else. Every read and write goes through
 * the API (lib/api/client.ts); the API decides who may see what.
 *
 * Created lazily: building it while the module loads turns a missing
 * environment variable into a blank page, because the error is thrown before
 * React has rendered anything that could show it.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  client ??= createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}
