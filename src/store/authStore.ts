'use client';
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/data/adapters/supabase/client';
import { setRepoMode, resetAllUserData } from '@/data';

export type AuthErrorKind =
  | 'anonFailed'
  | 'networkOffline'
  | 'missingConfig'
  | 'invalidCredentials'
  | 'emailInUse'
  | 'weakPassword'
  | 'invalidEmail';

// Anonymous users keep using IndexedDB. Only fully authenticated (email/oauth)
// users route through Supabase — anonymous data lives locally until the user
// explicitly signs in (STEP 2.3 migrates it).
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
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

let subscribed = false;

function classifyError(e: unknown): AuthErrorKind {
  const msg = (e as Error)?.message?.toLowerCase() ?? '';
  if (msg.includes('network') || msg.includes('fetch')) return 'networkOffline';
  return 'anonFailed';
}

function classifyEmailError(e: unknown): AuthErrorKind {
  const msg = (e as Error)?.message?.toLowerCase() ?? '';
  if (msg.includes('network') || msg.includes('fetch')) return 'networkOffline';
  if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already'))
    return 'emailInUse';
  if (msg.includes('password') && (msg.includes('short') || msg.includes('6') || msg.includes('weak')))
    return 'weakPassword';
  if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('invalid email or password'))
    return 'invalidCredentials';
  if (msg.includes('invalid email')) return 'invalidEmail';
  return 'invalidCredentials';
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
        setRepoMode(repoModeForUser(user));
        set({ session, user });
      });
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      const user = data.session?.user ?? null;
      setRepoMode(repoModeForUser(user));
      set({ session: data.session, user });
      if (!data.session) await get().signInAnonymously();
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
      setRepoMode(repoModeForUser(data.user));
      set({ session: data.session, user: data.user, loading: false });
    } catch (e) {
      set({ error: classifyError(e), loading: false });
      throw e;
    }
  },

  async signInWithEmail(email, password) {
    if (!isSupabaseConfigured) {
      set({ error: 'missingConfig' });
      return false;
    }
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setRepoMode(repoModeForUser(data.user));
      set({ session: data.session, user: data.user, loading: false });
      return true;
    } catch (e) {
      set({ error: classifyEmailError(e), loading: false });
      return false;
    }
  },

  async signUpWithEmail(email, password) {
    if (!isSupabaseConfigured) {
      set({ error: 'missingConfig' });
      return false;
    }
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // Supabase may return a user without a session when email confirmation is on.
      // For MVP we expect confirmation-off; treat the session as the success signal.
      if (data.session) {
        setRepoMode(repoModeForUser(data.user));
        set({ session: data.session, user: data.user, loading: false });
        return true;
      }
      // No session means confirmation flow — surface a soft error so the user knows.
      set({ loading: false });
      return false;
    } catch (e) {
      set({ error: classifyEmailError(e), loading: false });
      return false;
    }
  },

  async signOut() {
    // C2: clear local cache and immediately mint a fresh anonymous
    // session so the next user (or the same user, anonymously)
    // starts from a clean slate. Cloud data stays untouched.
    await supabase.auth.signOut();
    setRepoMode('local');
    set({ session: null, user: null });
    await resetAllUserData();
    if (isSupabaseConfigured) {
      try {
        await get().signInAnonymously();
      } catch {
        // Network or provider hiccup — leave the user signed-out;
        // the next app launch will retry via hydrate().
      }
    }
  },

  clearError() {
    set({ error: null });
  },
}));
