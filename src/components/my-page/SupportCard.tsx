'use client';
import { useT } from '@/i18n/useT';
import { MyPageCard } from './MyPageCard';
import { MyPageRow } from './MyPageRow';

/**
 * `고객 지원` card. Q&A / terms / privacy have real screens; 공지사항 still
 * renders `SubPagePlaceholder` until its design lands.
 */
export function SupportCard() {
  const t = useT();
  return (
    <MyPageCard title={t.myPage.support.title}>
      <div className="flex flex-col">
        <MyPageRow href="/settings/notices" label={t.myPage.support.notices} />
        <MyPageRow href="/settings/qna" label={t.myPage.support.qna} />
        <MyPageRow href="/settings/terms" label={t.myPage.support.terms} />
        <MyPageRow href="/settings/privacy" label={t.myPage.support.privacy} />
      </div>
    </MyPageCard>
  );
}
