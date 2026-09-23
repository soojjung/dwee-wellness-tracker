'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBodyTypeReportStore } from '@/store/bodyTypeReportStore';
import { DiagnoseResultTopBar } from './DiagnoseResultTopBar';
import { ReportView } from './ReportView';
import { ShareTestBar } from './ShareTestBar';

const ARTICLE_HREF = '/magazine/personal-body-type';
const DIAGNOSE_HREF = '/magazine/personal-body-type/diagnose';

export function DiagnoseResultScreen() {
  const router = useRouter();
  const report = useBodyTypeReportStore((s) => s.report);
  const hydrated = useBodyTypeReportStore((s) => s.hydrated);
  const hydrateReport = useBodyTypeReportStore((s) => s.hydrate);
  const [stuck, setStuck] = useState(false);
  const handleStuckChange = useCallback((next: boolean) => setStuck(next), []);

  useEffect(() => {
    if (!hydrated) void hydrateReport();
  }, [hydrated, hydrateReport]);

  // 보관된 결과가 없으면 볼 게 없으니 진단 화면으로 되돌린다.
  useEffect(() => {
    if (hydrated && !report) router.replace(DIAGNOSE_HREF);
  }, [hydrated, report, router]);

  // 기존 결과는 지우지 않는다. 진단을 마치면 새 결과가 덮어쓰고, 도중에 나오면
  // 이전 결과가 그대로 남아 마이페이지에서 다시 열 수 있다 (실기기 QA 2026-09-24).
  function tryAgain() {
    router.push(DIAGNOSE_HREF);
  }

  if (!hydrated || !report) return null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-brand-gray50">
      <DiagnoseResultTopBar articleHref={ARTICLE_HREF} onRetry={tryAgain} stuck={stuck} />
      <ReportView report={report} onStuckChange={handleStuckChange} />
      <ShareTestBar type={report.summary.primaryType} />
    </div>
  );
}
