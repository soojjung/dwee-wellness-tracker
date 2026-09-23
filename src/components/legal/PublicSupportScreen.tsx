'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { SupportContactCard } from './SupportContactCard';
import { useLegalLocale } from './useLegalLocale';

/**
 * Public support page (App Store "Support URL"). Same email card as
 * `/settings/qna`, plus links to the two legal documents.
 */
export function PublicSupportScreen() {
  const hydrated = useSettingsStore((s) => s.hydrated);
  const hydrate = useSettingsStore((s) => s.hydrate);
  const { locale, t } = useLegalLocale();

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray200">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-[calc(3.5rem+env(safe-area-inset-top,0px))] items-center pt-[env(safe-area-inset-top,0px)] gap-3 bg-brand-gray200 px-4">
          <img
            src="/brand/wordmark-dwee.svg"
            alt={t.app.name}
            width={70}
            height={20}
            className="select-none"
            draggable={false}
          />
          <h1 className="text-lg font-semibold leading-6 text-brand-gray900">
            {t.myPage.support.title}
          </h1>
        </header>
        <main className="px-4 pb-10 pt-2">
          <SupportContactCard t={t} />
          <nav className="mt-4 flex justify-center gap-4 text-xs text-brand-gray600">
            <Link
              href={{ pathname: '/legal/terms', query: { lang: locale } }}
              className="underline-offset-2 hover:underline"
            >
              {t.myPage.support.terms}
            </Link>
            <Link
              href={{ pathname: '/legal/privacy', query: { lang: locale } }}
              className="underline-offset-2 hover:underline"
            >
              {t.myPage.support.privacy}
            </Link>
          </nav>
        </main>
      </div>
    </div>
  );
}
