'use client';
import { useT } from '@/i18n/useT';
import { SubPagePlaceholder } from '@/components/my-page/SubPagePlaceholder';

export default function PrivacyPage() {
  const t = useT();
  return <SubPagePlaceholder title={t.myPage.support.privacy} />;
}
