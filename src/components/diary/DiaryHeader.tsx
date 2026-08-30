'use client';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { formatMonthLabel } from '@/lib/date';
import { ChevronDownIcon, EditStarIcon } from '@/components/ui/icons';
import { LogViewToggle, type LogView } from './LogViewToggle';

interface DiaryHeaderProps {
  year: number;
  monthIndex: number;
  currentView: LogView;
  onViewChange: (view: LogView) => void;
  onMonthClick: () => void;
  onAddClick: () => void;
}

export function DiaryHeader({
  year,
  monthIndex,
  currentView,
  onViewChange,
  onMonthClick,
  onAddClick,
}: DiaryHeaderProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const monthLabel = formatMonthLabel(new Date(year, monthIndex, 1), locale);

  return (
    <div className="sticky top-0 z-10 flex flex-col bg-brand-gray200/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2.5">
        <h1 className="text-2xl font-semibold leading-normal text-brand-gray900">
          {t.report.diary.title}
        </h1>
        <Link
          href="/log/customize"
          aria-label={t.report.diary.customizeAria}
          className="flex h-6 w-6 items-center justify-center text-brand-gray900 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
        >
          <EditStarIcon />
        </Link>
      </div>
      <div className="flex items-center justify-between px-4">
        <button
          type="button"
          onClick={onMonthClick}
          aria-label={t.report.diary.monthPickerAria}
          className="flex items-center gap-2 text-xl font-semibold leading-normal text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
        >
          <span>{monthLabel}</span>
          <ChevronDownIcon className="h-2 w-3 text-brand-gray900" />
        </button>
        <div className="flex items-center gap-3">
          <LogViewToggle
            current={currentView}
            onChange={onViewChange}
            reportAriaLabel={t.report.diary.viewToggle.report}
            diaryAriaLabel={t.report.diary.viewToggle.diary}
          />
          <button
            type="button"
            onClick={onAddClick}
            aria-label={t.report.diary.addAria}
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
    </div>
  );
}
