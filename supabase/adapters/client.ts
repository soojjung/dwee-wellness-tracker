// 초안 — 아직 src/ 에 wiring 안 됨. tsconfig 에서 supabase/* 는 exclude 됨.
// 사용 시점에 'src/data/adapters/supabase/' 로 이동 + @supabase/supabase-js 설치.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase: SupabaseClient = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('not authenticated');
  return data.user.id;
}
