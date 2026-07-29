'use client';
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
  onSelect: (date: string) => void;
  onSelectEvent?: (event: EventLog) => void;
}

export function DiaryDayCell({
  date,
  inCurrentMonth,
  markers,
  events,
  categoriesById,
  onSelect,
  onSelectEvent,
}: DiaryDayCellProps) {
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

  return (
    <div
      className="flex min-h-[64px] flex-col items-stretch gap-1 py-1"
      onClick={() => onSelect(date)}
      role="presentation"
    >
      <div className="flex justify-center">
        <span
          className={
            'inline-flex h-[19px] w-8 items-center justify-center text-sm font-medium leading-none ' +
            (isMarked ? 'rounded-2xl ' : '') +
            numberBg
          }
        >
          {day}
        </span>
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
              className="block w-full truncate rounded-sm px-1 text-left text-[11px] font-medium leading-tight focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-pink800"
              style={{ backgroundColor: p.bg, color: p.fg }}
            >
              {truncateTitle(ev.title)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
