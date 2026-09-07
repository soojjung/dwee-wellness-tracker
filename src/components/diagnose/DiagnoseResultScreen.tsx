'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BodyTypeReport } from '@/types';
import { DiagnoseResultTopBar } from './DiagnoseResultTopBar';
import { ReportView } from './ReportView';
import { ShareTestBar } from './ShareTestBar';

const ARTICLE_HREF = '/magazine/personal-body-type';
const DIAGNOSE_HREF = '/magazine/personal-body-type/diagnose';
export const REPORT_SESSION_KEY = 'dwee:body-type-report';

interface StoredReport {
  report: BodyTypeReport;
  savedAt: string;
}

function readStoredReport(): BodyTypeReport | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(REPORT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredReport;
    return parsed.report ?? null;
  } catch {
    return null;
  }
}

export function DiagnoseResultScreen() {
  const router = useRouter();
  const [report, setReport] = useState<BodyTypeReport | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [stuck, setStuck] = useState(false);
  const handleStuckChange = useCallback((next: boolean) => setStuck(next), []);

  useEffect(() => {
    const stored = readStoredReport();
    if (!stored) {
      router.replace(DIAGNOSE_HREF);
      return;
    }
    setReport(stored);
    setHydrated(true);
  }, [router]);

  function tryAgain() {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(REPORT_SESSION_KEY);
    }
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
