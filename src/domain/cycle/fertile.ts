import type { Confidence } from '@/types';
import type { ISODate } from '@/lib/date';
import { addDaysISO } from '@/lib/date';

export interface FertileWindow {
  start: ISODate;
  end: ISODate;
  confidence: Confidence;
}

// Ovulation ~= next period start - 14 (luteal phase length is the stable one).
// Fertile window uses sperm survival (up to 5d) + ovulation day + 1d buffer.
const OVULATION_OFFSET_FROM_NEXT_PERIOD = -14;
const WINDOW_START_OFFSET = -5;
const WINDOW_END_OFFSET = 1;

export function predictFertileWindow(
  nextPeriodDate: ISODate | null,
  predictionConfidence: Confidence,
): FertileWindow | null {
  if (!nextPeriodDate || predictionConfidence === 'unknown') return null;
  const ovulation = addDaysISO(nextPeriodDate, OVULATION_OFFSET_FROM_NEXT_PERIOD);
  return {
    start: addDaysISO(ovulation, WINDOW_START_OFFSET),
    end: addDaysISO(ovulation, WINDOW_END_OFFSET),
    confidence: predictionConfidence,
  };
}
