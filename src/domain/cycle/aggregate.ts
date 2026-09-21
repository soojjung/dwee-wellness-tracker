import type { PeriodLog } from '@/types';
import { daysBetween } from '@/lib/date';
import { CYCLE_GAP_MIN_DAYS, CYCLE_GAP_MAX_DAYS } from './cycleGap';

export function averageCycleLength(periods: PeriodLog[]): number | null {
  if (periods.length < 2) return null;
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetween(sorted[i - 1]!.startDate, sorted[i]!.startDate);
    if (gap >= CYCLE_GAP_MIN_DAYS && gap <= CYCLE_GAP_MAX_DAYS) gaps.push(gap);
  }
  if (gaps.length === 0) return null;
  return Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length);
}

export function averagePeriodLength(periods: PeriodLog[]): number | null {
  const ended = periods.filter((p): p is PeriodLog & { endDate: string } => Boolean(p.endDate));
  if (ended.length === 0) return null;
  const lengths = ended
    .map((p) => daysBetween(p.startDate, p.endDate) + 1)
    .filter((l) => l >= 1 && l <= 14);
  if (lengths.length === 0) return null;
  return Math.round(lengths.reduce((s, l) => s + l, 0) / lengths.length);
}
