'use client';
import { useT } from '@/i18n/useT';
import { MyPageBackLink } from './MyPageBackLink';
import { TERMS_KO } from '@/content/legal/terms-ko';

export function TermsScreen() {
  const t = useT();
  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray200">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 bg-brand-gray200 px-4">
          <MyPageBackLink ariaLabel={t.myPage.account.closeAriaLabel} />
          <h1 className="text-lg font-semibold leading-6 text-brand-gray900">
            {t.myPage.support.terms}
          </h1>
        </header>
        <main className="px-4 pb-10 pt-2">
          <article className="rounded-2xl bg-brand-white px-5 py-6 text-brand-gray900 shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
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
