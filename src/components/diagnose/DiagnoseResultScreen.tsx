'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import type { BodyTypeReport } from '@/types';
import { ReportView } from './ReportView';
import { exportReportAsPng } from './exportReport';

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
  const r = t.magazine.diagnose.result;
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [report, setReport] = useState<BodyTypeReport | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = readStoredReport();
    if (!stored) {
      router.replace(DIAGNOSE_HREF);
      return;
    }
    setReport(stored);
    setHydrated(true);
  }, [router]);

  async function saveAsImage() {
    if (!reportRef.current || saving) return;
    setSaving(true);
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      await exportReportAsPng(reportRef.current, `dwee-body-type-${stamp}.png`);
    } finally {
      setSaving(false);
    }
  }

  function tryAgain() {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(REPORT_SESSION_KEY);
    }
    router.push(DIAGNOSE_HREF);
  }

  if (!hydrated || !report) return null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 pb-10 pt-6">
      <Link
        href={ARTICLE_HREF}
        className="-ml-1 inline-flex w-fit items-center gap-1 rounded-md px-1 py-0.5 text-sm font-medium text-brand-gray700 hover:text-brand-gray900"
      >
        ← {t.magazine.diagnose.backToArticle}
      </Link>
      <ReportView ref={reportRef} report={report} />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={tryAgain}
          className="flex-1 rounded-2xl border border-brand-gray300 px-4 py-3 text-sm font-semibold text-brand-gray800 hover:bg-brand-gray200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
        >
          {r.tryAgain}
        </button>
        <button
          type="button"
          onClick={saveAsImage}
          disabled={saving}
          className="flex-1 rounded-2xl bg-brand-pink200 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-pink800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
        >
          {saving ? r.savingImage : r.saveAsImage}
        </button>
      </div>
      <Link
        href={ARTICLE_HREF}
        className="self-center text-xs font-medium text-brand-gray700 hover:text-brand-gray900"
      >
        {r.backToArticle}
      </Link>
    </div>
  );
}
