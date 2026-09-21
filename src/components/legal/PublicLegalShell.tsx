'use client';
import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/cn';
import { useLegalLocale } from './useLegalLocale';
import type { Locale } from '@/types';

interface PublicLegalShellProps {
  title: string;
  children: ReactNode;
}

/**
 * Shell for `/legal/*` — reachable without a session (App Store privacy URL,
 * OAuth consent screen, reviewers). Same card look as the in-app legal
 * screens, but a wordmark + language toggle instead of the MyPage back link.
 */
export function PublicLegalShell({ title, children }: PublicLegalShellProps) {
  const hydrated = useSettingsStore((s) => s.hydrated);
  const hydrate = useSettingsStore((s) => s.hydrate);
  const { locale, t } = useLegalLocale();
  const pathname = usePathname();

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray200">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-brand-gray200 px-4">
          <div className="flex items-center gap-3">
            <img
              src="/brand/wordmark-dwee.svg"
              alt={t.app.name}
              width={70}
              height={20}
              className="select-none"
              draggable={false}
            />
            <h1 className="text-lg font-semibold leading-6 text-brand-gray900">{title}</h1>
          </div>
          <nav aria-label={t.settings.language} className="flex gap-1 text-xs">
            <LangLink
              href={pathname}
              lang="en"
              active={locale === 'en'}
              label={t.settings.languageEn}
            />
            <LangLink
              href={pathname}
              lang="ko"
              active={locale === 'ko'}
              label={t.settings.languageKo}
            />
          </nav>
        </header>
        <main className="px-4 pb-10 pt-2">
          <article className="rounded-2xl bg-brand-white px-5 py-6 text-brand-gray900 shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
            {children}
          </article>
        </main>
      </div>
    </div>
  );
}

function LangLink({
  href,
  lang,
  active,
  label,
}: {
  href: string;
  lang: Locale;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={{ pathname: href, query: { lang } }}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'rounded-full px-2.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray400',
        active ? 'bg-brand-gray900 text-brand-white' : 'text-brand-gray600 hover:bg-brand-gray300',
      )}
    >
      {label}
    </Link>
  );
}
