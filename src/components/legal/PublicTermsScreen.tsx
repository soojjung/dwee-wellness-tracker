'use client';
import { legalTerms } from '@/content/legal';
import { PublicLegalShell } from './PublicLegalShell';
import { TermsArticle } from './TermsArticle';
import { useLegalLocale } from './useLegalLocale';

export function PublicTermsScreen() {
  const { locale, t } = useLegalLocale();
  return (
    <PublicLegalShell title={t.myPage.support.terms}>
      <TermsArticle doc={legalTerms(locale)} />
    </PublicLegalShell>
  );
}
