'use client';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { fromISO } from '@/lib/date';

interface TodayDateHeadingProps {
  date: string;
}

export function TodayDateHeading({ date }: TodayDateHeadingProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const d = fromISO(date);
  const datePart = locale === 'ko' ? format(d, 'M월 d일', { locale: ko }) : format(d, 'MMM d');

  return (
    <h2 className="text-2xl font-semibold text-brand-gray900">
      {datePart}, {t.home.todaySuffix}
    </h2>
  );
}
