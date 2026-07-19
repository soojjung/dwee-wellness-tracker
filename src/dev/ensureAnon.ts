// Snapshot/test helper: ensure the app has an authenticated session so
// AuthGuard-protected screens render instead of redirecting to /login.
//
// We DO NOT call `signInAnonymously()` here — Supabase rate-limits anonymous
// sign-ups aggressively and the ~50 e2e tests all hit that endpoint back to
// back. Instead we synthesize a minimal anon user in Zustand state directly.
// AuthGuard only checks `store.user`, so this is sufficient to unblock nav.
// Anonymous users route to the local (IndexedDB) repo, which is what the
// tests want anyway.
import type { User } from '@supabase/supabase-js';
import { useAuthStore } from '@/store/authStore';

const SYNTHETIC_ANON_USER: User = {
  id: '00000000-0000-0000-0000-0000dweetestee',
  aud: 'authenticated',
  role: 'authenticated',
  email: '',
  app_metadata: {},
  user_metadata: {},
  identities: [],
  created_at: new Date(0).toISOString(),
  is_anonymous: true,
};

export async function ensureAnon(): Promise<void> {
  if (process.env.NODE_ENV === 'production') return;
  const store = useAuthStore.getState();
  if (store.user) return;
  useAuthStore.setState({
    user: SYNTHETIC_ANON_USER,
    session: null,
    hydrated: true,
    loading: false,
    error: null,
  });
}
