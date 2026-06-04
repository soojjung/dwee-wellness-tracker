'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { addDaysISO, fromISO } from '@/lib/date';
import type { PeriodLog } from '@/types';
import { isPeriodDate } from '@/components/calendar/cellState';

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const PAST_DAYS = 14;
const FUTURE_DAYS = 30;
const CONTENT_PADDING_PX = 20;

interface WeekStripProps {
  today: string;
  periods: PeriodLog[];
  predictedDate: string | null;
  daysUntilNext: number | null;
  averagePeriodLength: number;
  isEmpty?: boolean;
}

type DotKind = 'today' | 'period' | 'predicted' | 'default';

export function WeekStrip({
  today,
  periods,
  predictedDate,
  daysUntilNext,
  averagePeriodLength,
  isEmpty = false,
}: WeekStripProps) {
  const t = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  const days = useMemo(
    () => buildDays(today, periods, predictedDate, averagePeriodLength),
    [today, periods, predictedDate, averagePeriodLength],
  );
  const isMenstrual = useMemo(() => isPeriodDate(today, periods), [today, periods]);
  const todayChipText = formatTodayChip({
    isMenstrual,
    daysUntilNext,
    dDayPrefix: t.home.dDayPrefix,
    dDaySuffix: t.home.dDaySuffix,
    todayLabel: t.home.todayLabel,
    menstrualLabel: t.home.phaseShortLabel.menstrual,
  });

  // Anchor today to the leftmost visible position on mount and when layout settles.
  useEffect(() => {
    const container = scrollRef.current;
    const target = todayRef.current;
    if (!container || !target) return;
    const id = requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const offset = targetRect.left - containerRect.left + container.scrollLeft;
      container.scrollLeft = offset - CONTENT_PADDING_PX;
    });
    return () => cancelAnimationFrame(id);
  }, [today]);

  return (
    <div
      ref={scrollRef}
      className="-mx-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex w-max items-end gap-2 px-5">
        {days.map((d) => {
          const weekdayKey = WEEKDAY_KEYS[fromISO(d.date).getDay()]!;
          const weekdayLabel = t.home.weekdays[weekdayKey];
          const isToday = d.kind === 'today';
          return (
            <div
              key={d.date}
              ref={isToday ? todayRef : undefined}
              className="flex shrink-0 flex-col items-center gap-1.5"
            >
              {isToday ? (
                <svg
                  aria-hidden
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  className="text-brand-gray900"
                >
                  <polygon points="0,0 12,0 6,8" fill="currentColor" />
                </svg>
              ) : null}
              <span
                className={cn(
                  'text-xs',
                  isToday ? 'font-semibold text-brand-gray900' : 'font-medium text-brand-gray600',
                )}
              >
                {weekdayLabel}
              </span>
              {isToday && !isEmpty ? (
                <span className="flex items-center justify-center whitespace-nowrap rounded-full bg-brand-gray900 px-4 py-2 text-base font-medium text-brand-white">
                  {todayChipText}
                </span>
              ) : (
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium',
                    isToday ? 'bg-brand-gray900 text-brand-white' : chipClasses(d.kind),
                  )}
                >
                  {fromISO(d.date).getDate()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface Day {
  date: string;
  kind: DotKind;
}

function buildDays(
  today: string,
  periods: PeriodLog[],
  predictedDate: string | null,
  averagePeriodLength: number,
): Day[] {
  const days: Day[] = [];
  const predicted = predictedRange(predictedDate, averagePeriodLength);
  for (let offset = -PAST_DAYS; offset <= FUTURE_DAYS; offset += 1) {
    const date = addDaysISO(today, offset);
    let kind: DotKind = 'default';
    if (offset === 0) kind = 'today';
    else if (predicted && date >= predicted.start && date <= predicted.end) kind = 'predicted';
    else if (isPeriodDate(date, periods)) kind = 'period';
    days.push({ date, kind });
  }
  return days;
}

function predictedRange(
  predictedDate: string | null,
  length: number,
): { start: string; end: string } | null {
  if (!predictedDate) return null;
  const span = Math.max(1, length);
  return { start: predictedDate, end: addDaysISO(predictedDate, span - 1) };
}

function chipClasses(kind: DotKind): string {
  switch (kind) {
    case 'today':
      return 'bg-brand-gray900 text-brand-white';
    case 'predicted':
      return 'bg-brand-pink50 text-brand-pink800';
    case 'period':
      return 'bg-brand-pink100 text-brand-pink900';
    case 'default':
      return 'bg-brand-gray300 text-brand-gray600';
  }
}

function formatTodayChip(args: {
  isMenstrual: boolean;
  daysUntilNext: number | null;
  dDayPrefix: string;
  dDaySuffix: string;
  todayLabel: string;
  menstrualLabel: string;
}): string {
  if (args.isMenstrual) return args.menstrualLabel;
  if (args.daysUntilNext === null) return args.todayLabel;
  if (args.daysUntilNext <= 0) return args.todayLabel;
  return `${args.dDayPrefix}${args.daysUntilNext}${args.dDaySuffix}`;
}
