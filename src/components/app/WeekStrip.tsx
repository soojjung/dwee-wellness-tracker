'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { addDaysISO, fromISO } from '@/lib/date';
import type { PeriodLog, Confidence } from '@/types';
import { isPeriodDate } from '@/components/calendar/cellState';
import { predictFertileWindow } from '@/domain/cycle/fertile';

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const PAST_DAYS = 60;
const FUTURE_DAYS = 60;
const CONTENT_PADDING_PX = 20;

type CycleState = 'actualPeriod' | 'predictedPeriod' | 'predictedFertile' | null;

interface WeekStripProps {
  today: string;
  periods: PeriodLog[];
  predictedDate: string | null;
  predictionConfidence: Confidence;
  daysUntilNext: number | null;
  averagePeriodLength: number;
  isEmpty?: boolean;
}

export function WeekStrip({
  today,
  periods,
  predictedDate,
  predictionConfidence,
  daysUntilNext,
  averagePeriodLength,
  isEmpty = false,
}: WeekStripProps) {
  const t = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  const days = useMemo(
    () => buildDays(today, periods, predictedDate, averagePeriodLength, predictionConfidence),
    [today, periods, predictedDate, averagePeriodLength, predictionConfidence],
  );

  const todayState = useMemo(
    () => days.find((d) => d.date === today)?.state ?? null,
    [days, today],
  );

  const todayChipText = formatTodayChip({
    todayState,
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

  const todayLabel = isEmpty ? null : stateLabelFor(todayState, t.home.stateLabel);

  return (
    <div
      ref={scrollRef}
      className="-mx-5 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex w-max items-start gap-2 px-5">
        {days.map((d) => {
          const isToday = d.date === today;
          const weekdayKey = WEEKDAY_KEYS[fromISO(d.date).getDay()]!;
          const weekdayLabel = t.home.weekdays[weekdayKey];
          return (
            <div
              key={d.date}
              ref={isToday ? todayRef : undefined}
              className="relative flex shrink-0 flex-col items-center gap-1.5"
            >
              <div className="flex h-2 items-center justify-center">
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
              </div>
              <span
                className={cn(
                  'text-xs',
                  isToday
                    ? 'font-semibold text-brand-gray900'
                    : 'font-medium text-brand-gray600',
                )}
              >
                {weekdayLabel}
              </span>
              {isToday && !isEmpty ? (
                <span className="flex h-10 items-center justify-center whitespace-nowrap rounded-full bg-brand-gray900 px-4 text-base font-medium text-brand-white">
                  {todayChipText}
                </span>
              ) : (
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-base font-medium',
                    isToday ? todayEmptyChipClasses() : cellChipClasses(d.state),
                  )}
                >
                  {fromISO(d.date).getDate()}
                </span>
              )}
              {isToday && todayLabel ? (
                <p
                  className={cn(
                    'absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-xs font-semibold',
                    stateLabelColorClass(todayState),
                  )}
                >
                  {todayLabel}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface Day {
  date: string;
  state: CycleState;
}

function buildDays(
  today: string,
  periods: PeriodLog[],
  predictedDate: string | null,
  averagePeriodLength: number,
  predictionConfidence: Confidence,
): Day[] {
  const days: Day[] = [];
  const predictedPeriod = predictedRange(predictedDate, averagePeriodLength);
  const fertile = predictFertileWindow(predictedDate, predictionConfidence);
  for (let offset = -PAST_DAYS; offset <= FUTURE_DAYS; offset += 1) {
    const date = addDaysISO(today, offset);
    days.push({ date, state: computeState(date, periods, predictedPeriod, fertile) });
  }
  return days;
}

// Priority: actual period > predicted period > predicted fertile > default.
function computeState(
  date: string,
  periods: PeriodLog[],
  predictedPeriod: { start: string; end: string } | null,
  fertile: { start: string; end: string } | null,
): CycleState {
  if (isPeriodDate(date, periods)) return 'actualPeriod';
  if (predictedPeriod && date >= predictedPeriod.start && date <= predictedPeriod.end)
    return 'predictedPeriod';
  if (fertile && date >= fertile.start && date <= fertile.end) return 'predictedFertile';
  return null;
}

function predictedRange(
  predictedDate: string | null,
  length: number,
): { start: string; end: string } | null {
  if (!predictedDate) return null;
  const span = Math.max(1, length);
  return { start: predictedDate, end: addDaysISO(predictedDate, span - 1) };
}

// Fill for actual data, outline for predicted, subtle outline for default.
function cellChipClasses(state: CycleState): string {
  switch (state) {
    case 'actualPeriod':
      return 'bg-brand-pink100 text-brand-pink900';
    case 'predictedPeriod':
      return 'border border-brand-pink200 bg-brand-white text-brand-pink500';
    case 'predictedFertile':
      return 'border border-brand-lavender100 bg-brand-white text-brand-lavender400';
    case null:
      return 'border border-brand-gray300 bg-brand-white text-brand-gray600';
  }
}

function todayEmptyChipClasses(): string {
  return 'bg-brand-gray900 text-brand-white';
}

function stateLabelColorClass(state: CycleState): string {
  switch (state) {
    case 'actualPeriod':
    case 'predictedPeriod':
      return 'text-brand-pink500';
    case 'predictedFertile':
      return 'text-brand-lavender400';
    case null:
      return 'text-brand-gray600';
  }
}

function stateLabelFor(
  state: CycleState,
  copy: { actualPeriod: string; predictedPeriod: string; predictedFertile: string },
): string | null {
  switch (state) {
    case 'actualPeriod':
      return copy.actualPeriod;
    case 'predictedPeriod':
      return copy.predictedPeriod;
    case 'predictedFertile':
      return copy.predictedFertile;
    case null:
      return null;
  }
}

function formatTodayChip(args: {
  todayState: CycleState;
  daysUntilNext: number | null;
  dDayPrefix: string;
  dDaySuffix: string;
  todayLabel: string;
  menstrualLabel: string;
}): string {
  if (args.todayState === 'actualPeriod') return args.menstrualLabel;
  if (args.daysUntilNext === null) return args.todayLabel;
  if (args.daysUntilNext <= 0) return args.todayLabel;
  return `${args.dDayPrefix}${args.daysUntilNext}${args.dDaySuffix}`;
}
