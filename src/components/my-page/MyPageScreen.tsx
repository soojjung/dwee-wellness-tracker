'use client';
import { useT } from '@/i18n/useT';
import { APP_VERSION } from '@/constants/app';
import { AuthCard } from './AuthCard';
import { CycleSummaryCard } from './CycleSummaryCard';
import { PreferencesCard } from './PreferencesCard';
import { SupportCard } from './SupportCard';
import { AccountManagementCard } from './AccountManagementCard';

/**
 * MyPage (previously `/settings`). Layout mirrors Figma 015_1 (signed-out)
 * and 015_2 (signed-in). Sub-page routes for language / notices / Q&A /
 * terms / privacy are stubbed placeholders until the next design batch.
 */
export function MyPageScreen() {
  const t = useT();

  return (
    <div className="flex min-h-dvh w-full flex-col bg-brand-gray50">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-10 bg-brand-gray50 px-4 pb-3 pt-6">
          <h1 className="text-2xl font-semibold text-brand-gray900">
            {t.myPage.title}
          </h1>
        </header>

        <main className="flex flex-1 flex-col gap-3 px-4 pb-24">
          <AuthCard />
          <CycleSummaryCard />
          <PreferencesCard />
          <SupportCard />
          <AccountManagementCard />

          <p className="mt-4 text-center text-xs text-brand-gray600">
            {t.myPage.version.prefix}
            {APP_VERSION}
            {t.myPage.version.separator}
            {t.myPage.version.upToDate}
          </p>
        </main>
      </div>
    </div>
  );
}
