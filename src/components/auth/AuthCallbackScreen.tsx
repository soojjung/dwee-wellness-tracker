'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/authStore';

export function AuthCallbackScreen() {
  const t = useT();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const signedIn = await useAuthStore.getState().completeOAuthCallback(() => cancelled);
      if (cancelled) return;
      router.replace(signedIn ? '/' : '/login');
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center bg-auth-bg px-5">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-brand-pink50 border-t-brand-pink200"
          aria-hidden
        />
        <p className="text-sm text-auth-linkMuted">{t.auth.callback.busy}</p>
      </div>
    </main>
  );
}
