'use client';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { fromISO } from '@/lib/date';
import { CalendarAddIcon } from './CalendarAddIcon';

interface TodayDateHeadingProps {
  date: string;
  onCalendarClick: () => void;
}

export function TodayDateHeading({ date, onCalendarClick }: TodayDateHeadingProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const d = fromISO(date);
  const datePart = locale === 'ko' ? format(d, 'M월 d일', { locale: ko }) : format(d, 'MMM d');

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold text-brand-gray900">
        {datePart}, {t.home.todaySuffix}
      </h2>
      <button
        type="button"
        onClick={onCalendarClick}
        aria-label={t.home.startPeriodButton}
        className="flex h-6 w-6 items-center justify-center text-brand-gray900 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
      >
        <CalendarAddIcon />
      </button>
    </div>
  );
}
