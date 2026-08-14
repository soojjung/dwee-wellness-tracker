'use client';
import { useT } from '@/i18n/useT';
import { SubPagePlaceholder } from '@/components/my-page/SubPagePlaceholder';

export default function TermsPage() {
  const t = useT();
  return <SubPagePlaceholder title={t.myPage.support.terms} />;
}
