'use client';
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { NATIVE_AUTH_REDIRECT, toWebCallbackPath } from '@/lib/auth/nativeCallback';
import { cancelAllLocalNotifications } from '@/lib/notifications/localNotifications';
import { captureException } from '@/lib/monitoring/sentry';
import { supabase, isSupabaseConfigured } from '@/data/adapters/supabase/client';
import { getRepoMode, setRepoMode, resetAllUserData, type RepoMode } from '@/data';
import {
  deleteAccount as deleteAccountRequest,
  type DeleteAccountError,
} from '@/data/services/accountService';
import { migrateLocalToRemote } from '@/data/migration/anonToRemote';
import { rehydrateAllData } from './rehydrateAll';
import { useSettingsStore } from './settingsStore';
import { usePeriodStore } from './periodStore';
import { useConditionStore } from './conditionStore';

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
  deleteAccount: () => Promise<{ ok: true } | { ok: false; error: DeleteAccountError }>;
  /** Persists the nickname to `user_metadata`; the auth listener refreshes `user`. Throws on failure. */
  updateNickname: (nickname: string) => Promise<void>;
  /**
   * Runs on `/auth/callback` after the provider redirect. Resolves `false` when
   * no real (non-anonymous) session came back; otherwise migrates the local
   * anonymous data into the account and resolves `true`. `isCancelled` lets the
   * screen skip the migration once it has unmounted (StrictMode double-mount).
   */
  completeOAuthCallback: (isCancelled?: () => boolean) => Promise<boolean>;
}

let subscribed = false;
let nativeUrlListenerRegistered = false;
let callbackArrived = false;

/**
 * Native only: the OAuth provider hands control back through the `dwee://`
 * scheme (see lib/auth/nativeCallback). Forward that URL to the web callback
 * page so the same code path finishes the sign-in, and close the system
 * browser sheet that is still covering the app on iOS.
 */
function registerNativeAuthReturn(): void {
  if (nativeUrlListenerRegistered || !Capacitor.isNativePlatform()) return;
  nativeUrlListenerRegistered = true;
  void CapacitorApp.addListener('appUrlOpen', ({ url }) => {
    const path = toWebCallbackPath(url);
    if (!path) return;
    callbackArrived = true;
    void Browser.close().catch(() => undefined);
    window.location.replace(path);
  });
  // The user can dismiss the browser sheet without finishing. Without this the
  // login screen would sit on "Connecting..." forever.
  void Browser.addListener('browserFinished', () => {
    if (!callbackArrived) useAuthStore.setState({ loading: false });
  });
}

// The login screen only shows a generic "try again" line, so without this a
// failed sign-in leaves no trace of what Supabase actually answered (rate
// limit, disabled provider, outage). Status/code tags carry no user data.
function reportAuthFailure(step: 'anonymous' | 'oauth', e: unknown): void {
  const err = e as { status?: unknown; code?: unknown } | null;
  captureException(e, {
    tags: {
      auth_step: step,
      auth_status: typeof err?.status === 'number' ? String(err.status) : 'none',
      auth_code: typeof err?.code === 'string' ? err.code : 'none',
    },
  });
}

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

async function isSessionAlive(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return false;
    return !!data.user;
  } catch {
    return false;
  }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  hydrated: false,
  loading: false,
  error: null,

  async hydrate() {
    if (get().hydrated || get().loading) return;
    // Dev-only test bypass: e2e tests set this flag via addInitScript so every
    // navigation replays a synthetic anon user without hitting Supabase (which
    // rate-limits anonymous sign-ups). See src/dev/ensureAnon.ts.
    if (
      process.env.NODE_ENV !== 'production' &&
      typeof window !== 'undefined' &&
      (window as unknown as { __dweeTestAnon?: boolean }).__dweeTestAnon
    ) {
      const { ensureAnon } = await import('@/dev/ensureAnon');
      await ensureAnon();
      await applyRepoMode('local');
      set({ hydrated: true, loading: false });
      return;
    }
    if (!isSupabaseConfigured) {
      set({ error: 'missingConfig', hydrated: true });
      return;
    }
    set({ loading: true, error: null });
    registerNativeAuthReturn();

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
      reportAuthFailure('anonymous', e);
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
      if (Capacitor.isNativePlatform()) {
        // Google blocks OAuth inside WebViews and `capacitor://localhost` is
        // not a redirect target Supabase can send anyone back to, so the
        // flow runs in the system browser and returns via the custom scheme.
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: NATIVE_AUTH_REDIRECT, skipBrowserRedirect: true },
        });
        if (error || !data.url) throw error ?? new Error('no oauth url');
        await Browser.open({ url: data.url, windowName: '_self' });
        return;
      }
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
      reportAuthFailure('oauth', e);
      set({ error: 'oauthFailed', loading: false });
    }
  },

  async updateNickname(nickname) {
    const { error } = await supabase.auth.updateUser({ data: { nickname } });
    if (error) throw error;
  },

  async completeOAuthCallback(isCancelled) {
    // Supabase JS auto-extracts the session from the URL on import.
    // Wait briefly for it to settle, then read the resulting session.
    let session = (await supabase.auth.getSession()).data.session;
    if (!session) {
      await new Promise((r) => setTimeout(r, 300));
      session = (await supabase.auth.getSession()).data.session;
    }
    if (isCancelled?.()) return false;

    const user = session?.user ?? null;
    if (!user || user.is_anonymous) return false;

    try {
      const result = await migrateLocalToRemote();
      if (result.errors.length > 0) {
        console.warn('[migrate] partial errors', result.errors);
      }
      await Promise.all([
        useSettingsStore.getState().rehydrate(),
        usePeriodStore.getState().rehydrate(),
        useConditionStore.getState().rehydrate(),
      ]);
    } catch (e) {
      console.warn('[migrate] failed', e);
    }
    return true;
  },

  async signOut() {
    // Clear cloud session + wipe local cache. The user lands back
    // at /login via AuthGuard; anonymous re-entry is an explicit
    // "Continue without signing in" tap from there.
    await supabase.auth.signOut();
    set({ session: null, user: null });
    await resetAllUserData();
    await cancelAllLocalNotifications().catch(() => undefined);
    await applyRepoMode('local');
  },

  async deleteAccount() {
    const result = await deleteAccountRequest();
    if (!result.ok) {
      // Response may have been lost after the server-side delete succeeded.
      // If our token no longer resolves to a user, the account is already
      // gone — finish the local cleanup so we don't strand the user in an
      // "error" screen for an account that no longer exists.
      const stillAlive = await isSessionAlive();
      if (stillAlive) return result;
    }
    await supabase.auth.signOut().catch(() => undefined);
    set({ session: null, user: null });
    await resetAllUserData();
    await cancelAllLocalNotifications().catch(() => undefined);
    await applyRepoMode('local');
    return { ok: true };
  },
}));
