'use client';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { legalTerms } from '@/content/legal';
import { TermsArticle } from '@/components/legal/TermsArticle';
import { LegalArticleLayout } from './LegalArticleLayout';

export function TermsScreen() {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  return (
    <LegalArticleLayout title={t.myPage.support.terms}>
      <TermsArticle doc={legalTerms(locale)} />
    </LegalArticleLayout>
  );
}
