'use client';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { TERMS_KO } from '@/content/legal/terms-ko';

export function TermsScreen() {
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
            {t.myPage.support.terms}
          </h1>
        </header>
        <main className="px-5 pb-10 pt-2">
          <article className="text-brand-gray900">
            <h2 className="mb-6 text-base font-semibold leading-6">
              {TERMS_KO.title}
            </h2>
            {TERMS_KO.sections.map((section) => (
              <section key={section.heading} className="mb-6">
                <h3 className="mb-2 text-sm font-semibold leading-5 text-brand-gray900">
                  {section.heading}
                </h3>
                <p className="whitespace-pre-line text-[13px] leading-[1.7] text-brand-gray700">
                  {section.body}
                </p>
              </section>
            ))}
            <section className="mt-8 border-t border-brand-gray200 pt-6">
              <h3 className="mb-2 text-sm font-semibold leading-5 text-brand-gray900">
                {TERMS_KO.appendix.heading}
              </h3>
              <p className="whitespace-pre-line text-[13px] leading-[1.7] text-brand-gray700">
                {TERMS_KO.appendix.body}
              </p>
            </section>
          </article>
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
