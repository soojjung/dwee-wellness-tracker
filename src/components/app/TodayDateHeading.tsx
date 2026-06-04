'use client';
import Link from 'next/link';
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
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold text-brand-gray900">
        {datePart}, {t.home.todaySuffix}
      </h2>
      <Link
        href="/calendar"
        aria-label={t.home.openCalendar}
        className="flex h-6 w-6 items-center justify-center text-brand-gray900 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
      >
        <CalendarIcon />
      </Link>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden>
      <g transform="translate(2 3)">
        <path d="M20 14.7273C20 16.5347 18.5076 18 16.6667 18H3.33333C1.49238 18 0 16.5347 0 14.7273V9.59091C0 9.03862 0.447715 8.59091 1 8.59091H19C19.5523 8.59091 20 9.03862 20 9.59091V14.7273Z" />
        <path d="M15 0C15.9205 0 16.6667 0.732625 16.6667 1.63636V3.27273C18.5076 3.27273 20 4.73798 20 6.54545C20 6.99732 19.6337 7.36364 19.1818 7.36364H0.818182C0.366313 7.36364 0 6.99732 0 6.54545C0 4.73798 1.49238 3.27273 3.33333 3.27273V1.63636C3.33333 0.732625 4.07953 0 5 0C5.92047 0 6.66667 0.732625 6.66667 1.63636V3.27273H13.3333V1.63636C13.3333 0.732625 14.0795 0 15 0Z" />
      </g>
    </svg>
  );
}
