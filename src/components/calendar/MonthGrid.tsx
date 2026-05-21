'use client';
import { useMemo } from 'react';
import { useT } from '@/i18n/useT';
import { calendarGrid, type WeekStartsOn } from '@/lib/date';
import type { PeriodLog, DailyConditionLog } from '@/types';
import { DayCell } from './DayCell';
import { deriveCellMarkers } from './cellState';

interface MonthGridProps {
  year: number;
  monthIndex: number;
  weekStartsOn: WeekStartsOn;
  today: string;
  periods: PeriodLog[];
  conditionByDate: Record<string, DailyConditionLog>;
  predictedDate: string | null;
  onSelect: (date: string) => void;
}

const WEEKDAY_ORDER_SUN_START = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export function MonthGrid({
  year,
  monthIndex,
  weekStartsOn,
  today,
  periods,
  conditionByDate,
  predictedDate,
  onSelect,
}: MonthGridProps) {
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

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 text-center text-xs text-neutral-500">
        {weekdays.map((label, i) => (
          <span key={i} className="py-1">
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => (
          <DayCell
            key={cell.date}
            date={cell.date}
            inCurrentMonth={cell.inCurrentMonth}
            markers={deriveCellMarkers({
              date: cell.date,
              today,
              periods,
              conditionByDate,
              predictedDate,
            })}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
