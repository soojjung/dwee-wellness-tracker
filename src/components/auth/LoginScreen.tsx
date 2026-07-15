'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useAuthStore, type OAuthProvider } from '@/store/authStore';

export function LoginScreen() {
  const t = useT();
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<OAuthProvider | null>(null);
  const [guestPending, setGuestPending] = useState(false);
  const authHydrate = useAuthStore((s) => s.hydrate);
  const authHydrated = useAuthStore((s) => s.hydrated);
  const authError = useAuthStore((s) => s.error);
  const user = useAuthStore((s) => s.user);
  const signInWithOAuth = useAuthStore((s) => s.signInWithOAuth);
  const signInAnonymously = useAuthStore((s) => s.signInAnonymously);

  // (auth) 그룹은 AppShell 밖이라 여기서 직접 hydrate — 이미 살아있는 세션이면
  // 아래 useEffect 가 곧바로 `/` 로 보내줌.
  useEffect(() => {
    if (!authHydrated) authHydrate();
  }, [authHydrate, authHydrated]);

  useEffect(() => {
    if (authHydrated && user) router.replace('/');
  }, [authHydrated, user, router]);

  useEffect(() => {
    if (!authError) return;
    const e = t.auth.error;
    const messageMap: Record<typeof authError & string, string> = {
      missingConfig: e.missingConfig,
      networkOffline: e.networkOffline,
      anonFailed: e.anonFailed,
      oauthFailed: e.oauthFailed,
    };
    setNotice(messageMap[authError]);
    setPending(null);
  }, [authError, t]);

  const handleOAuth = (provider: OAuthProvider) => {
    setNotice(null);
    setPending(provider);
    void signInWithOAuth(provider);
  };

  const handleGuest = async () => {
    if (guestPending || pending) return;
    setNotice(null);
    setGuestPending(true);
    try {
      await signInAnonymously();
      router.replace('/');
    } catch {
      setGuestPending(false);
    }
  };

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-auth-bg px-5">
      <div className="flex flex-1 items-center justify-center">
        <img
          src="/brand/wordmark-dwee.svg"
          alt={t.app.name}
          width={161}
          height={46}
          className="select-none"
          draggable={false}
        />
      </div>

      <div className="flex flex-col gap-3 pb-24">
        <Button
          size="lg"
          fullWidth
          onClick={() => handleOAuth('apple')}
          disabled={pending !== null}
        >
          <AppleGlyph />
          <span>{pending === 'apple' ? t.auth.signingIn : t.auth.signInWithApple}</span>
        </Button>

        <Button
          size="lg"
          fullWidth
          onClick={() => handleOAuth('google')}
          disabled={pending !== null}
        >
          <GoogleGlyph />
          <span>{pending === 'google' ? t.auth.signingIn : t.auth.signInWithGoogle}</span>
        </Button>

        <button
          type="button"
          onClick={handleGuest}
          disabled={guestPending || pending !== null}
          data-testid="guest-sign-in"
          className="mt-5 self-center rounded-sm px-2 py-1 text-base text-auth-linkMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {guestPending ? t.auth.signingIn : t.auth.continueWithoutSignIn}
        </button>
      </div>

      <Toast message={notice} />
    </main>
  );
}

function AppleGlyph() {
  return (
    <svg
      width="14"
      height="17"
      viewBox="0 0 14 17"
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path d="M11.4 8.9c0-2 1.6-2.9 1.7-3-0.9-1.3-2.4-1.5-2.9-1.6-1.2-0.1-2.4 0.7-3 0.7-0.6 0-1.6-0.7-2.7-0.7-1.4 0-2.7 0.8-3.4 2.1-1.5 2.5-0.4 6.3 1 8.4 0.7 1 1.6 2.2 2.7 2.2 1.1 0 1.5-0.7 2.8-0.7 1.3 0 1.6 0.7 2.7 0.7 1.1 0 1.8-1 2.5-2 0.8-1.2 1.1-2.3 1.1-2.4 0 0-2.1-0.8-2.1-3.1zM9.4 3c0.6-0.7 1-1.7 0.9-2.6-0.8 0-1.8 0.5-2.4 1.2-0.5 0.6-1 1.6-0.9 2.5 0.9 0.1 1.8-0.4 2.4-1.1z" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill="#FBBC05"
        d="M5.3 14.1c-.2-.5-.3-1.1-.3-1.6 0-.7.1-1.4.3-2L2.6 7.3A11 11 0 0 0 1 12a11 11 0 0 0 1.6 5.2l2.7-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 5.5c1.6 0 3.1.6 4.2 1.6l3-3a11 11 0 0 0-7.2-2.6 11 11 0 0 0-9.4 5.7l2.7 2.5c1-2.5 3.4-4.2 6.7-4.2z"
      />
      <path
        fill="#34A853"
        d="M12 18.5c-3.3 0-5.7-1.7-6.7-4.4l-2.7 2.5A11 11 0 0 0 12 23a11 11 0 0 0 7.4-2.7l-2.6-2.4c-.9.6-2.4 1.6-4.8 1.6z"
      />
      <path
        fill="#4285F4"
        d="M22.6 9.8H12v4.4h6c-.3 1.5-1.1 2.7-2.4 3.5l2.6 2.4c2-1.8 3.4-4.7 3.4-8.1 0-.8-.1-1.5-.2-2.2z"
      />
    </svg>
  );
}
