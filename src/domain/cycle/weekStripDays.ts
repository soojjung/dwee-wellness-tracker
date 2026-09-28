import { addDaysISO } from '@/lib/date';
import type { PeriodLog, Confidence } from '@/types';
import { calendarPredictions, computeState, type CycleState } from './cellState';

export { computeState, predictedRange, type CycleState } from './cellState';

const PAST_DAYS = 60;
const FUTURE_DAYS = 60;

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
  const { predictedPeriod, fertile } = calendarPredictions(
    predictedDate,
    averagePeriodLength,
    predictionConfidence,
  );
  for (let offset = -PAST_DAYS; offset <= FUTURE_DAYS; offset += 1) {
    const date = addDaysISO(today, offset);
    days.push({ date, state: computeState(date, periods, predictedPeriod, fertile) });
  }
  return days;
}
