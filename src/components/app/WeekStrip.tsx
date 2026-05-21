'use client';
import { useMemo } from 'react';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { addDaysISO, fromISO } from '@/lib/date';
import type { PeriodLog } from '@/types';
import { isPeriodDate } from '@/components/calendar/cellState';

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

interface WeekStripProps {
  today: string;
  periods: PeriodLog[];
  predictedDate: string | null;
}

type DotKind = 'today' | 'period' | 'predicted' | 'default';

export function WeekStrip({ today, periods, predictedDate }: WeekStripProps) {
  const t = useT();
  const days = useMemo(() => buildDays(today, periods, predictedDate), [today, periods, predictedDate]);

  return (
    <div className="flex justify-between gap-1">
      {days.map((d) => {
        const weekdayKey = WEEKDAY_KEYS[fromISO(d.date).getDay()]!;
        const weekdayLabel = d.isToday ? t.home.todayLabel : t.home.weekdays[weekdayKey];
        return (
          <div key={d.date} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                'text-xs',
                d.isToday ? 'font-semibold text-brand-gray900' : 'font-medium text-brand-gray600',
              )}
            >
              {weekdayLabel}
            </span>
            <span className={cn('flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold', dotClasses(d.kind))}>
              {fromISO(d.date).getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface Day {
  date: string;
  isToday: boolean;
  kind: DotKind;
}

function buildDays(today: string, periods: PeriodLog[], predictedDate: string | null): Day[] {
  const days: Day[] = [];
  for (let offset = -3; offset <= 3; offset += 1) {
    const date = addDaysISO(today, offset);
    const isToday = offset === 0;
    let kind: DotKind = 'default';
    if (isToday) kind = 'today';
    else if (predictedDate === date) kind = 'predicted';
    else if (isPeriodDate(date, periods)) kind = 'period';
    days.push({ date, isToday, kind });
  }
  return days;
}

function dotClasses(kind: DotKind): string {
  switch (kind) {
    case 'today':
      return 'bg-brand-gray900 text-brand-white';
    case 'predicted':
      return 'bg-brand-pink200 text-brand-pink900';
    case 'period':
      return 'bg-brand-pink100 text-brand-pink900';
    case 'default':
      return 'bg-brand-gray300 text-brand-gray600';
  }
}
