'use client';
import { useMemo } from 'react';
import { useT } from '@/i18n/useT';
import { calendarGrid, type WeekStartsOn } from '@/lib/date';
import type { PeriodLog, EventLog, EventCategory, DailyConditionLog } from '@/types';
import { deriveCellMarkers } from '@/components/calendar/cellState';
import { pickBadgesForDay } from '@/domain/event/badges';
import { DiaryDayCell } from './DiaryDayCell';

interface DiaryMonthGridProps {
  year: number;
  monthIndex: number;
  weekStartsOn: WeekStartsOn;
  today: string;
  periods: PeriodLog[];
  events: EventLog[];
  categories: EventCategory[];
  conditionByDate?: Record<string, DailyConditionLog>;
  predictedDate?: string | null;
  onSelect: (date: string) => void;
  onSelectEvent?: (event: EventLog) => void;
}

const WEEKDAY_ORDER_SUN_START = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export function DiaryMonthGrid({
  year,
  monthIndex,
  weekStartsOn,
  today,
  periods,
  events,
  categories,
  conditionByDate,
  predictedDate,
  onSelect,
  onSelectEvent,
}: DiaryMonthGridProps) {
  const t = useT();
  const cells = useMemo(
    () => calendarGrid(year, monthIndex, weekStartsOn),
    [year, monthIndex, weekStartsOn],
  );
  const weekdays = useMemo(() => {
    const rotated = [...WEEKDAY_ORDER_SUN_START];
    for (let i = 0; i < weekStartsOn; i += 1) rotated.push(rotated.shift()!);
    return rotated.map((k) => t.calendar.weekdays[k]);
  }, [t, weekStartsOn]);
  const categoriesById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );
  const rows = useMemo(() => {
    const list: (typeof cells)[] = [];
    for (let r = 0; r < cells.length; r += 7) {
      list.push(cells.slice(r, r + 7));
    }
    return list;
  }, [cells]);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-7 py-2 text-center text-xs text-brand-gray700">
        {weekdays.map((label, i) => (
          <span
            key={i}
            className={
              i === 0 || i === 6 ? 'text-brand-gray500' : 'text-brand-gray700'
            }
          >
            {label}
          </span>
        ))}
      </div>
      {rows.map((row, ri) => (
        <div
          key={ri}
          className={
            'grid grid-cols-7' +
            (ri > 0 ? ' border-t-[0.75px] border-brand-gray400' : '')
          }
        >
          {row.map((cell) => (
            <DiaryDayCell
              key={cell.date}
              date={cell.date}
              inCurrentMonth={cell.inCurrentMonth}
              markers={deriveCellMarkers({
                date: cell.date,
                today,
                periods,
                conditionByDate: conditionByDate ?? {},
                predictedDate: predictedDate ?? null,
              })}
              events={cell.inCurrentMonth ? pickBadgesForDay(events, cell.date) : []}
              categoriesById={categoriesById}
              onSelect={onSelect}
              onSelectEvent={onSelectEvent}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
