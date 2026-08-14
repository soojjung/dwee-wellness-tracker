'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/data/adapters/supabase/client';
import { getNickname } from './AuthCard';

/**
 * 015_3 own-account edit screen. Fullscreen. Email is read-only; nickname
 * is editable and required (save disabled while blank). Persists via
 * `supabase.auth.updateUser({ data: { nickname } })` — the auth store's
 * onAuthStateChange listener refreshes `user_metadata` automatically.
 */
export function AccountEditScreen() {
  const t = useT();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const isAuthenticated = !!user && !user.is_anonymous;
  const email = user?.email ?? '';
  const initialNickname = getNickname(user);

  const [nickname, setNickname] = useState(initialNickname);
  const [submitting, setSubmitting] = useState(false);
  const [errorFlash, setErrorFlash] = useState<string | null>(null);

  // If the store rehydrates and reveals a nickname we hadn't seeded yet,
  // fill the input on first change. Doesn't override user typing after
  // that — see `dirty` check.
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (dirty) return;
    setNickname(initialNickname);
  }, [initialNickname, dirty]);

  // Anonymous / signed-out users can't be here — bounce them home.
  useEffect(() => {
    if (!isAuthenticated) router.replace('/settings');
  }, [isAuthenticated, router]);

  const trimmed = nickname.trim();
  const canSave =
    isAuthenticated &&
    !submitting &&
    trimmed.length > 0 &&
    trimmed !== initialNickname;

  async function handleSave() {
    if (!canSave) return;
    setSubmitting(true);
    setErrorFlash(null);
    try {
      const { error } = await supabase.auth.updateUser({ data: { nickname: trimmed } });
      if (error) throw error;
      router.push('/settings');
    } catch {
      setErrorFlash(t.myPage.account.saveFailedToast);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    router.push('/settings');
  }

  return (
    <div className="flex min-h-dvh flex-col bg-brand-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-brand-white px-4">
          <button
            type="button"
            onClick={handleClose}
            aria-label={t.myPage.account.closeAriaLabel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray200 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
          >
            <CloseIcon />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            aria-label={t.myPage.account.saveAriaLabel}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2',
              canSave
                ? 'bg-brand-pink200 text-brand-white'
                : 'cursor-default bg-brand-gray300 text-brand-gray500',
            )}
          >
            <CheckIcon />
          </button>
        </header>

        <main className="flex flex-1 flex-col gap-6 px-4 pt-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-brand-gray900">
              {t.myPage.account.emailLabel}
            </span>
            <input
              type="email"
              value={email}
              disabled
              placeholder={email}
              className="h-12 w-full rounded-xl bg-brand-gray100 px-4 text-base text-brand-gray700"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-brand-gray900">
              {t.myPage.account.nicknameLabel}
            </span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setDirty(true);
                setNickname(e.target.value);
              }}
              placeholder={t.myPage.account.nicknamePlaceholder}
              autoComplete="nickname"
              className="h-12 w-full rounded-xl bg-brand-gray100 px-4 text-base text-brand-gray900 placeholder:text-brand-gray600 focus:outline-none focus:ring-2 focus:ring-brand-gray900"
            />
          </label>

          {errorFlash ? (
            <p className="text-center text-sm text-red-600" role="status">
              {errorFlash}
            </p>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
