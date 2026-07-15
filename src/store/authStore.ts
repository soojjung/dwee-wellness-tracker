'use client';
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/data/adapters/supabase/client';
import { getRepoMode, setRepoMode, resetAllUserData, type RepoMode } from '@/data';
import { rehydrateAllData } from './rehydrateAll';

export type AuthErrorKind = 'anonFailed' | 'networkOffline' | 'missingConfig' | 'oauthFailed';
export type OAuthProvider = 'apple' | 'google';

// Anonymous users keep using IndexedDB. Only fully authenticated (OAuth)
// users route through Supabase — anonymous data lives locally until the
// user explicitly signs in (STEP 2.3 migrates it on the callback).
function repoModeForUser(user: User | null): 'local' | 'remote' {
  if (!isSupabaseConfigured) return 'local';
  if (!user) return 'local';
  if (user.is_anonymous) return 'local';
  return 'remote';
}

interface AuthState {
  user: User | null;
  session: Session | null;
  hydrated: boolean;
  loading: boolean;
  error: AuthErrorKind | null;
  hydrate: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
}

let subscribed = false;

function classifyError(e: unknown): AuthErrorKind {
  const msg = (e as Error)?.message?.toLowerCase() ?? '';
  if (msg.includes('network') || msg.includes('fetch')) return 'networkOffline';
  return 'anonFailed';
}

async function applyRepoMode(nextMode: RepoMode): Promise<void> {
  const prev = getRepoMode();
  setRepoMode(nextMode);
  if (prev !== nextMode) await rehydrateAllData();
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  hydrated: false,
  loading: false,
  error: null,

  async hydrate() {
    if (get().hydrated || get().loading) return;
    if (!isSupabaseConfigured) {
      set({ error: 'missingConfig', hydrated: true });
      return;
    }
    set({ loading: true, error: null });

    if (!subscribed) {
      subscribed = true;
      supabase.auth.onAuthStateChange((_event, session) => {
        const user = session?.user ?? null;
        set({ session, user });
        void applyRepoMode(repoModeForUser(user));
      });
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      const user = data.session?.user ?? null;
      set({ session: data.session, user });
      await applyRepoMode(repoModeForUser(user));
      set({ hydrated: true, loading: false });
    } catch (e) {
      set({ error: classifyError(e), loading: false, hydrated: true });
    }
  },

  async signInAnonymously() {
    if (!isSupabaseConfigured) {
      set({ error: 'missingConfig' });
      return;
    }
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      set({ session: data.session, user: data.user, loading: false });
      await applyRepoMode(repoModeForUser(data.user));
    } catch (e) {
      set({ error: classifyError(e), loading: false });
      throw e;
    }
  },

  async signInWithOAuth(provider) {
    if (!isSupabaseConfigured) {
      set({ error: 'missingConfig' });
      return;
    }
    if (typeof window === 'undefined') return;
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // Browser is navigating to the provider — no further code runs here
      // until the redirect back to /auth/callback.
    } catch (e) {
      set({ error: 'oauthFailed', loading: false });
    }
  },

  async signOut() {
    // Clear cloud session + wipe local cache. The user lands back
    // at /login via AuthGuard; anonymous re-entry is an explicit
    // "Continue without signing in" tap from there.
    await supabase.auth.signOut();
    set({ session: null, user: null });
    await resetAllUserData();
    await applyRepoMode('local');
  },
}));
