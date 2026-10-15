'use client';
import { useT } from '@/i18n/useT';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import { AuthCard } from './AuthCard';
import { CycleSummaryCard } from './CycleSummaryCard';
import { MyTestsCard } from './MyTestsCard';
import { PreferencesCard } from './PreferencesCard';
import { SupportCard } from './SupportCard';
import { AccountManagementCard } from './AccountManagementCard';

/**
 * MyPage (previously `/settings`). Layout mirrors Figma 015_1 (signed-out)
 * and 015_2 (signed-in).
 */
export function MyPageScreen() {
  const t = useT();
  // 하위 항목에 들어갔다 나오면 마지막으로 보던 위치로 돌아온다.
  useScrollRestore('mypage');

  return (
    <div className="flex min-h-dvh w-full flex-col bg-brand-gray200">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* 매거진 헤더와 같은 틀(상단 12px + 40px 줄 가운데, leading-normal)이라 제목이 같은 높이에 온다. */}
        <header className="sticky top-0 z-10 bg-brand-gray200 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
          <h1 className="flex min-h-10 items-center text-2xl font-semibold leading-normal text-brand-gray900">
            {t.myPage.title}
          </h1>
        </header>

        <main className="flex flex-1 flex-col gap-5 px-4 pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
          <AuthCard />
          <CycleSummaryCard />
          <MyTestsCard />
          <PreferencesCard />
          <SupportCard />
          <AccountManagementCard />
        </main>
      </div>
    </div>
  );
}
