'use client';
import { useT } from '@/i18n/useT';
import { MyPageBackLink } from './MyPageBackLink';
import { SupportContactCard } from '@/components/legal/SupportContactCard';

export function QnaScreen() {
  const t = useT();
  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray200">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center px-4">
          <MyPageBackLink ariaLabel={t.myPage.qna.backAriaLabel} />
        </header>
        <main className="px-4">
          <SupportContactCard t={t} />
        </main>
      </div>
    </div>
  );
}
