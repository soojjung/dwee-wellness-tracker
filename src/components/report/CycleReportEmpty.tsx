'use client';
import { useT } from '@/i18n/useT';

interface CycleReportEmptyProps {
  onLogClick: () => void;
}

export function CycleReportEmpty({ onLogClick }: CycleReportEmptyProps) {
  const t = useT();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-8 text-center">
      <div className="flex flex-col items-center gap-1">
        <p className="text-xl font-semibold leading-normal text-brand-gray900">
          {t.report.empty.title}
        </p>
        <p className="text-base leading-normal text-brand-gray800">
          {t.report.empty.body}
        </p>
      </div>
      <button
        type="button"
        onClick={onLogClick}
        className="rounded-full bg-brand-pink50 px-7 py-4 text-base font-medium text-brand-gray900 transition-colors hover:bg-brand-pink100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
      >
        {t.report.empty.cta}
      </button>
    </div>
  );
}
