'use client';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/cn';

/**
 * Auth card at the top of MyPage. Two states:
 * - Anonymous / signed-out: "로그인/회원가입" chevron cell → `/login`.
 * - Authenticated: dark card with nickname + email → `/settings/account`.
 */
export function AuthCard() {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = !!user && !user.is_anonymous;

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className={cn(
          'flex h-14 w-full items-center justify-between rounded-2xl bg-brand-white px-4',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2',
        )}
      >
        <span className="text-base font-medium text-brand-gray900">
          {t.myPage.authCard.loggedOutCta}
        </span>
        <ChevronRightIcon className="text-brand-gray700" />
      </Link>
    );
  }

  const nickname = getNickname(user);
  const email = user.email ?? '';

  return (
    <Link
      href="/settings/account"
      aria-label={t.myPage.authCard.loggedInAriaLabel}
      className={cn(
        'flex w-full items-center justify-between rounded-2xl bg-brand-gray900 px-4 py-4',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2',
      )}
    >
      <span className="flex flex-col items-start gap-1">
        <span className="text-base font-semibold leading-tight text-brand-white">
          {nickname}
        </span>
        <span className="text-xs leading-tight text-brand-gray300">{email}</span>
      </span>
      <ChevronRightIcon className="text-brand-white" />
    </Link>
  );
}

/** Nickname source of truth: user_metadata.nickname > email local-part. */
export function getNickname(user: { email?: string | null; user_metadata?: Record<string, unknown> | null } | null): string {
  const raw = user?.user_metadata?.['nickname'];
  if (typeof raw === 'string' && raw.trim() !== '') return raw.trim();
  const email = user?.email ?? '';
  const localPart = email.split('@')[0] ?? '';
  return localPart || '';
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-5 w-5', className)}
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
