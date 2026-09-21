'use client';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { legalPrivacy } from '@/content/legal';
import { PrivacyArticle } from '@/components/legal/PrivacyArticle';
import { LegalArticleLayout } from './LegalArticleLayout';

export function PrivacyScreen() {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  return (
    <LegalArticleLayout title={t.myPage.support.privacy}>
      <PrivacyArticle doc={legalPrivacy(locale)} />
    </LegalArticleLayout>
  );
}
