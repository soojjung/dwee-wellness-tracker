import type { PeriodLog, DailyConditionLog, Confidence } from '@/types';
import { addDaysISO, type ISODate } from '@/lib/date';
import { predictFertileWindow } from './fertile';

export type CycleState = 'actualPeriod' | 'predictedPeriod' | 'predictedFertile' | null;

export interface DateRange {
  start: ISODate;
  end: ISODate;
}

/** 다음 1회 예상 생리 구간과 그 앞 가임기. 홈 주간 스트립과 다이어리 달력이 같이 쓴다. */
export interface CalendarPredictions {
  predictedPeriod: DateRange | null;
  fertile: DateRange | null;
}

export interface CellMarkers {
  cycle: CycleState;
  hasCondition: boolean;
  isToday: boolean;
}

export function isPeriodDate(date: ISODate, periods: PeriodLog[]): boolean {
  for (const p of periods) {
    if (p.endDate) {
      if (date >= p.startDate && date <= p.endDate) return true;
    } else if (date === p.startDate) {
      return true;
    }
  }
  return false;
}

export function predictedRange(predictedDate: ISODate | null, length: number): DateRange | null {
  if (!predictedDate) return null;
  const span = Math.max(1, length);
  return { start: predictedDate, end: addDaysISO(predictedDate, span - 1) };
}

export function calendarPredictions(
  predictedDate: ISODate | null,
  averagePeriodLength: number,
  predictionConfidence: Confidence,
): CalendarPredictions {
  return {
    predictedPeriod: predictedRange(predictedDate, averagePeriodLength),
    fertile: predictFertileWindow(predictedDate, predictionConfidence),
  };
}

// Priority: actual period > predicted period > predicted fertile > default.
export function computeState(
  date: ISODate,
  periods: PeriodLog[],
  predictedPeriod: DateRange | null,
  fertile: DateRange | null,
): CycleState {
  if (isPeriodDate(date, periods)) return 'actualPeriod';
  if (predictedPeriod && date >= predictedPeriod.start && date <= predictedPeriod.end)
    return 'predictedPeriod';
  if (fertile && date >= fertile.start && date <= fertile.end) return 'predictedFertile';
  return null;
}

/** `predictions` 가 null 이면(달력 예측 표시 꺼짐) 실제 생리만 표시한다. */
export function deriveCellMarkers(args: {
  date: ISODate;
  today: ISODate;
  periods: PeriodLog[];
  conditionByDate: Record<string, DailyConditionLog>;
  predictions: CalendarPredictions | null;
}): CellMarkers {
  return {
    cycle: computeState(
      args.date,
      args.periods,
      args.predictions?.predictedPeriod ?? null,
      args.predictions?.fertile ?? null,
    ),
    hasCondition: !!args.conditionByDate[args.date],
    isToday: args.date === args.today,
  };
}
