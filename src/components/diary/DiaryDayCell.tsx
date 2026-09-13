'use client';
import { useT } from '@/i18n/useT';
import { fromISO } from '@/lib/date';
import type { CellMarkers } from '@/components/calendar/cellState';

interface DiaryDayCellProps {
  date: string;
  inCurrentMonth: boolean;
  markers: CellMarkers;
  // When defined and `isToday`, the cell replays its "오늘" bubble
  // animation. Keying the bubble off the number makes React remount it on
  // each tap so the CSS animation restarts cleanly.
  todayPulseKey?: number;
  onSelect: (date: string) => void;
}

export function DiaryDayCell({
  date,
  inCurrentMonth,
  markers,
  todayPulseKey,
  onSelect,
}: DiaryDayCellProps) {
  const t = useT();
  const day = fromISO(date).getDate();
  const { background, isToday } = markers;

  const numberBg = isToday
    ? 'bg-brand-gray900 text-brand-white'
    : background === 'menstrual'
      ? 'bg-brand-pink50 text-brand-pink800'
      : inCurrentMonth
        ? 'text-brand-gray900'
        : 'text-brand-gray400';

  const isMarked = isToday || background === 'menstrual';
  const pulsing = isToday && todayPulseKey !== undefined && todayPulseKey > 0;

  return (
    // Event bars are drawn by DiaryWeekEventLayer over the whole row so a
    // multi-day event reads as one continuous strip; keep the top padding /
    // number height in sync with that layer's offset.
    <div
      className="relative flex min-h-[92px] flex-col items-stretch gap-1 pb-4 pt-2"
      onClick={() => onSelect(date)}
      role="presentation"
    >
      <div className="relative flex justify-center">
        <span
          className={
            'relative inline-flex h-[19px] w-8 items-center justify-center text-base font-medium leading-none ' +
            (isMarked ? 'rounded-2xl ' : '') +
            numberBg
          }
        >
          {day}
        </span>
        {pulsing ? (
          <span
            key={`bubble-${todayPulseKey}`}
            aria-hidden
            className="pointer-events-none absolute -top-7 left-1/2 z-20 whitespace-nowrap rounded-full bg-brand-gray900 px-2 py-0.5 text-[11px] font-medium leading-none text-brand-white shadow-md animate-diaryTodayBubble after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-4 after:border-x-transparent after:border-b-transparent after:border-t-brand-gray900 after:content-['']"
          >
            {t.calendar.todayLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
