'use client';
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/data/adapters/supabase/client';

export type AuthErrorKind = 'anonFailed' | 'networkOffline' | 'missingConfig';

interface AuthState {
  user: User | null;
  session: Session | null;
  hydrated: boolean;
  loading: boolean;
  error: AuthErrorKind | null;
  hydrate: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
}

let subscribed = false;

function classifyError(e: unknown): AuthErrorKind {
  const msg = (e as Error)?.message?.toLowerCase() ?? '';
  if (msg.includes('network') || msg.includes('fetch')) return 'networkOffline';
  return 'anonFailed';
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
        set({ session, user: session?.user ?? null });
      });
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      set({ session: data.session, user: data.session?.user ?? null });
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
      set({ session: data.session, user: data.user, loading: false });
    } catch (e) {
      set({ error: classifyError(e), loading: false });
      throw e;
    }
  },

  async signOut() {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
