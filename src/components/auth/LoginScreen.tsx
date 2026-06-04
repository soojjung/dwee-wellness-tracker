'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';

const NOTICE_DURATION_MS = 2400;

export function LoginScreen() {
  const t = useT();
  const [notice, setNotice] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const authHydrate = useAuthStore((s) => s.hydrate);
  const authHydrated = useAuthStore((s) => s.hydrated);
  const authError = useAuthStore((s) => s.error);

  // (auth) 라우트 그룹은 AppShell이 없어 hydrate가 안 됨 — 여기서 직접 트리거.
  // 사용자가 화면을 보는 동안 백그라운드에서 익명 세션을 미리 만들어둠.
  useEffect(() => {
    if (!authHydrated) authHydrate();
  }, [authHydrate, authHydrated]);

  useEffect(() => {
    if (!authError) return;
    const message =
      authError === 'missingConfig'
        ? t.auth.error.missingConfig
        : authError === 'networkOffline'
          ? t.auth.error.networkOffline
          : t.auth.error.anonFailed;
    setNotice(message);
  }, [authError, t]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const showComingSoon = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    setNotice(t.auth.comingSoon);
    timerRef.current = setTimeout(() => {
      setNotice(null);
      timerRef.current = null;
    }, NOTICE_DURATION_MS);
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

      <div className="flex flex-col pb-24">
        <Button size="lg" fullWidth onClick={showComingSoon}>
          <AppleGlyph />
          <span>{t.auth.signInWithApple}</span>
        </Button>

        <Button size="lg" fullWidth className="mt-4" onClick={showComingSoon}>
          <GoogleGlyph />
          <span>{t.auth.signInWithGoogle}</span>
        </Button>

        <Link
          href="/"
          className="mt-8 self-center rounded-sm px-2 py-1 text-base text-auth-linkMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-2"
        >
          {t.auth.continueWithoutSignIn}
        </Link>
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
