'use client';
import Link from 'next/link';
import { useT } from '@/i18n/useT';

interface SubPagePlaceholderProps {
  title: string;
}

/**
 * Temporary placeholder for MyPage sub-routes whose designs will arrive in
 * the next batch (language / notices / Q&A / terms / privacy). Provides a
 * back link so users aren't stranded when they tap through from MyPage.
 */
export function SubPagePlaceholder({ title }: SubPagePlaceholderProps) {
  const t = useT();
  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray50">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 bg-brand-gray50 px-4">
          <Link
            href="/settings"
            aria-label={t.myPage.account.closeAriaLabel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray200 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
          >
            <BackIcon />
          </Link>
          <h1 className="text-lg font-semibold leading-6 text-brand-gray900">
            {title}
          </h1>
        </header>
        <main className="flex flex-1 items-center justify-center px-8">
          <p className="text-center text-sm leading-[1.5] text-brand-gray700">
            {t.myPage.comingSoon}
          </p>
        </main>
      </div>
    </div>
  );
}

function BackIcon() {
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
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}
