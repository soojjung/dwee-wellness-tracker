'use client';
import type { ReactNode } from 'react';
import { useT } from '@/i18n/useT';
import { MyPageBackLink } from './MyPageBackLink';

interface LegalArticleLayoutProps {
  title: string;
  children: ReactNode;
}

/** Shared shell for the terms / privacy screens: sticky header + white article card. */
export function LegalArticleLayout({ title, children }: LegalArticleLayoutProps) {
  const t = useT();
  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray200">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-[calc(3.5rem+env(safe-area-inset-top,0px))] items-center pt-[env(safe-area-inset-top,0px)] gap-3 bg-brand-gray200 px-4">
          <MyPageBackLink ariaLabel={t.myPage.backAriaLabel} />
          <h1 className="text-lg font-semibold leading-6 text-brand-gray900">{title}</h1>
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
