'use client';
import { useEffect } from 'react';
import { useT } from '@/i18n/useT';
import { useBodyTypeReportStore } from '@/store/bodyTypeReportStore';
import { MyPageCard } from './MyPageCard';
import { MyPageRow } from './MyPageRow';

const BODY_TYPE_INTRO_HREF = '/magazine/personal-body-type';
const BODY_TYPE_RESULT_HREF = '/magazine/personal-body-type/diagnose/result';

/**
 * `나의 테스트` card. Renders one row per test the user can take.
 * For 체형 분석: shows "결과" row (→ result page) once a report is stored;
 * otherwise shows a CTA row (→ magazine article intro) so a user who hasn't
 * taken the test can still discover and start it from MyPage.
 * 결과는 Repository 를 거쳐 보관된다 — 로그인 상태면 Supabase 라 다른 기기에서도
 * 같은 결과가 보인다. 지워지는 건 결과 화면에서 [다른 사진으로 다시하기] 를
 * 누를 때뿐이다.
 */
export function MyTestsCard() {
  const t = useT();
  const report = useBodyTypeReportStore((s) => s.report);
  const hydrated = useBodyTypeReportStore((s) => s.hydrated);
  const hydrate = useBodyTypeReportStore((s) => s.hydrate);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  // Skip render during hydration to avoid a flash between CTA and result copy.
  if (!hydrated) return null;
  const hasReport = report !== null;

  return (
    <MyPageCard title={t.myPage.tests.title}>
      <div className="flex flex-col">
        <MyPageRow
          href={hasReport ? BODY_TYPE_RESULT_HREF : BODY_TYPE_INTRO_HREF}
          label={
            hasReport ? t.myPage.tests.bodyTypeResult : t.myPage.tests.bodyTypeCta
          }
        />
      </div>
    </MyPageCard>
  );
}
