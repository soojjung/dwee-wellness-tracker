'use client';
import { useT } from '@/i18n/useT';
import { MyPageBackLink } from './MyPageBackLink';

interface SubPagePlaceholderProps {
  title: string;
}

/**
 * Temporary placeholder for the 공지사항 sub-route until its design lands. Provides a
 * back link so users aren't stranded when they tap through from MyPage.
 */
export function SubPagePlaceholder({ title }: SubPagePlaceholderProps) {
  const t = useT();
  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray200">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-[calc(3.5rem+env(safe-area-inset-top,0px))] items-center pt-[env(safe-area-inset-top,0px)] gap-3 bg-brand-gray200 px-4">
          <MyPageBackLink ariaLabel={t.myPage.backAriaLabel} />
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
