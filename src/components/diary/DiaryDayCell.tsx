'use client';
import { useT } from '@/i18n/useT';
import { fromISO } from '@/lib/date';
import type { EventLog, EventCategory } from '@/types';
import { paletteFor } from '@/domain/event/palette';
import { truncateTitle } from '@/domain/event/badges';
import type { CellMarkers } from '@/components/calendar/cellState';

interface DiaryDayCellProps {
  date: string;
  inCurrentMonth: boolean;
  markers: CellMarkers;
  events: EventLog[];
  categoriesById: Map<string, EventCategory>;
  // When defined and `isToday`, the cell replays its pulse-ring + "오늘"
  // bubble animation. Keying children off the number makes React remount
  // the animated nodes on each tap so the CSS animation restarts cleanly.
  todayPulseKey?: number;
  onSelect: (date: string) => void;
  onSelectEvent?: (event: EventLog) => void;
}

export function DiaryDayCell({
  date,
  inCurrentMonth,
  markers,
  events,
  categoriesById,
  todayPulseKey,
  onSelect,
  onSelectEvent,
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
    <div
      className="relative flex min-h-[92px] flex-col items-stretch gap-1 pb-4 pt-2"
      onClick={() => onSelect(date)}
      role="presentation"
    >
      <div className="relative flex justify-center">
        {pulsing ? (
          <span
            key={`ring-${todayPulseKey}`}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gray900/25 animate-diaryTodayRing"
          />
        ) : null}
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
      <div className="flex flex-col items-stretch gap-0.5 px-1">
        {events.map((ev) => {
          const cat = categoriesById.get(ev.categoryId);
          const p = paletteFor(cat?.colorId ?? 'gray');
          return (
            <button
              key={ev.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectEvent?.(ev);
              }}
              className="block w-full truncate rounded px-1 py-[2px] text-left text-[12px] font-medium leading-none text-brand-gray900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-pink800"
              style={{ backgroundColor: p.bg }}
            >
              {truncateTitle(ev.title)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
