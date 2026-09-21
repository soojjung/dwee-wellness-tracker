'use client';
import { useT } from '@/i18n/useT';
import { LegalArticleLayout } from './LegalArticleLayout';
import { TERMS_KO } from '@/content/legal/terms-ko';

export function TermsScreen() {
  const t = useT();
  return (
    <LegalArticleLayout title={t.myPage.support.terms}>
      <h2 className="mb-6 text-base font-semibold leading-6">{TERMS_KO.title}</h2>
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
    </LegalArticleLayout>
  );
}
