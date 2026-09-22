'use client';
import { legalPrivacy } from '@/content/legal';
import { PublicLegalShell } from './PublicLegalShell';
import { PrivacyArticle } from './PrivacyArticle';
import { useLegalLocale } from './useLegalLocale';

export function PublicPrivacyScreen() {
  const { locale, t } = useLegalLocale();
  return (
    <PublicLegalShell title={t.myPage.support.privacy}>
      <PrivacyArticle doc={legalPrivacy(locale)} />
    </PublicLegalShell>
  );
}
