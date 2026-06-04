import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(url && anonKey);

// createClient throws on empty url. Fall back to placeholder so module load succeeds
// in environments without .env.local (typecheck, accidental dev start). Actual auth/data
// calls will fail and surface via authStore error state.
export const supabase: SupabaseClient = createClient(
  url || 'http://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  { auth: { persistSession: true, autoRefreshToken: true } },
);

export async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('not authenticated');
  return data.user.id;
}
