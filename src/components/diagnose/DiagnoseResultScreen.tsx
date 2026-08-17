'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { BackIcon } from '@/components/ui/icons';
import type { BodyTypeReport } from '@/types';
import { ReportView } from './ReportView';

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
  const t = useT();
  const router = useRouter();
  const [report, setReport] = useState<BodyTypeReport | null>(null);
  const [hydrated, setHydrated] = useState(false);

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
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex w-full max-w-md items-center px-4 pt-3">
        <Link
          href={ARTICLE_HREF}
          aria-label={t.magazine.diagnose.backToArticle}
          className="pointer-events-auto grid size-10 place-items-center rounded-full bg-brand-gray400/50 text-brand-gray50 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray400"
        >
          <BackIcon className="size-10" />
        </Link>
      </div>
      <ReportView report={report} onRetry={tryAgain} />
    </div>
  );
}
