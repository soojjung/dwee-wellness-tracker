'use client';
import { useT } from '@/i18n/useT';

interface ReportHeaderProps {
  year: number;
  onAddClick: () => void;
}

export function ReportHeader({ year, onAddClick }: ReportHeaderProps) {
  const t = useT();
  return (
    <div className="sticky top-0 z-10 flex flex-col bg-brand-gray200/95 backdrop-blur-sm">
      <div className="flex items-center px-4 py-2.5">
        <h1 className="text-2xl font-semibold leading-normal text-brand-gray900">
          {t.report.title}
        </h1>
      </div>
      <div className="flex items-center justify-between px-4 pb-3 pt-2">
        <span className="text-xl font-semibold leading-normal text-brand-gray900">
          {year}
          {t.report.yearSuffix}
        </span>
        <button
          type="button"
          onClick={onAddClick}
          aria-label={t.log.addEntryFabAriaLabel}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gray400/40 text-brand-gray900 transition-colors hover:bg-brand-gray400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path
              d="M7 1.5v11M1.5 7h11"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

