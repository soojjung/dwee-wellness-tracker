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
  const clearReport = useBodyTypeReportStore((s) => s.clear);
  const [stuck, setStuck] = useState(false);
  const handleStuckChange = useCallback((next: boolean) => setStuck(next), []);

  useEffect(() => {
    if (!hydrated) void hydrateReport();
  }, [hydrated, hydrateReport]);

  // 보관된 결과가 없으면 볼 게 없으니 진단 화면으로 되돌린다.
  useEffect(() => {
    if (hydrated && !report) router.replace(DIAGNOSE_HREF);
  }, [hydrated, report, router]);

  // 결과를 비우면 위 효과가 진단 화면으로 되돌린다. 여기서 push 까지 하면
  // 같은 경로로 두 번 이동해 히스토리에 죽은 결과 화면이 남는다.
  function tryAgain() {
    void clearReport();
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
