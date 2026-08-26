'use client';
import { useEffect, useState } from 'react';
import { useT } from '@/i18n/useT';
import { REPORT_SESSION_KEY } from '@/components/diagnose/DiagnoseResultScreen';
import { MyPageCard } from './MyPageCard';
import { MyPageRow } from './MyPageRow';

const BODY_TYPE_INTRO_HREF = '/magazine/personal-body-type';
const BODY_TYPE_RESULT_HREF = '/magazine/personal-body-type/diagnose/result';

/**
 * `나의 테스트` card. Renders one row per test the user can take.
 * For 체형 분석: shows "결과" row (→ result page) once sessionStorage has a
 * stored report; otherwise shows a CTA row (→ magazine article intro) so a
 * user who hasn't taken the test can still discover and start it from MyPage.
 * Body-type reports live in sessionStorage today, so the CTA state is what
 * users see after a tab close/reopen — that's fine given the test itself is
 * quick to re-run.
 */
export function MyTestsCard() {
  const t = useT();
  const [hasReport, setHasReport] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setHasReport(!!window.sessionStorage.getItem(REPORT_SESSION_KEY));
    } catch {
      setHasReport(false);
    }
  }, []);

  // Skip render during hydration to avoid a flash between CTA and result copy.
  if (hasReport === null) return null;

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
