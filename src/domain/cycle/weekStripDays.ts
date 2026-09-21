import { addDaysISO } from '@/lib/date';
import type { PeriodLog, Confidence } from '@/types';
import { isPeriodDate } from './cellState';
import { predictFertileWindow } from './fertile';

const PAST_DAYS = 60;
const FUTURE_DAYS = 60;

export type CycleState = 'actualPeriod' | 'predictedPeriod' | 'predictedFertile' | null;

export interface WeekStripDay {
  date: string;
  state: CycleState;
}

export function buildDays(
  today: string,
  periods: PeriodLog[],
  predictedDate: string | null,
  averagePeriodLength: number,
  predictionConfidence: Confidence,
): WeekStripDay[] {
  const days: WeekStripDay[] = [];
  const predictedPeriod = predictedRange(predictedDate, averagePeriodLength);
  const fertile = predictFertileWindow(predictedDate, predictionConfidence);
  for (let offset = -PAST_DAYS; offset <= FUTURE_DAYS; offset += 1) {
    const date = addDaysISO(today, offset);
    days.push({ date, state: computeState(date, periods, predictedPeriod, fertile) });
  }
  return days;
}

// Priority: actual period > predicted period > predicted fertile > default.
export function computeState(
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

export function predictedRange(
  predictedDate: string | null,
  length: number,
): { start: string; end: string } | null {
  if (!predictedDate) return null;
  const span = Math.max(1, length);
  return { start: predictedDate, end: addDaysISO(predictedDate, span - 1) };
}
