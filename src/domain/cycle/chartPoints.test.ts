import { describe, it, expect } from 'vitest';
import { monthlyCyclePoints, type ChartMonth } from './chartPoints';
import type { PeriodLog } from '@/types';

function period(id: string, startDate: string): PeriodLog {
  return { id, startDate, createdAt: '2026-01-01T00:00:00.000Z' };
}

function month(year: number, monthIndex: number): ChartMonth {
  return { year, monthIndex };
}

describe('monthlyCyclePoints', () => {
  it('returns null for a month with no period starting in it', () => {
    const periods = [period('a', '2026-01-01'), period('b', '2026-03-01')];
    const result = monthlyCyclePoints(periods, [month(2026, 1)]);
    expect(result).toEqual([{ year: 2026, monthIndex: 1, cycleDays: null }]);
  });

  it('returns null when the month holds the very first period on record (no previous)', () => {
    const periods = [period('a', '2026-02-05')];
    const result = monthlyCyclePoints(periods, [month(2026, 1)]);
    expect(result).toEqual([{ year: 2026, monthIndex: 1, cycleDays: null }]);
  });

  it('returns null for a 14-day gap (just below the countable minimum)', () => {
    const periods = [period('a', '2025-12-18'), period('b', '2026-01-01')];
    const result = monthlyCyclePoints(periods, [month(2026, 0)]);
    expect(result).toEqual([{ year: 2026, monthIndex: 0, cycleDays: null }]);
  });

  it('returns the gap for a 15-day gap (countable minimum boundary)', () => {
    const periods = [period('a', '2025-12-17'), period('b', '2026-01-01')];
    const result = monthlyCyclePoints(periods, [month(2026, 0)]);
    expect(result).toEqual([{ year: 2026, monthIndex: 0, cycleDays: 15 }]);
  });

  it('returns the gap for a 60-day gap (countable maximum boundary)', () => {
    const periods = [period('a', '2025-11-02'), period('b', '2026-01-01')];
    const result = monthlyCyclePoints(periods, [month(2026, 0)]);
    expect(result).toEqual([{ year: 2026, monthIndex: 0, cycleDays: 60 }]);
  });

  it('returns null for a 61-day gap (just above the countable maximum)', () => {
    const periods = [period('a', '2025-11-01'), period('b', '2026-01-01')];
    const result = monthlyCyclePoints(periods, [month(2026, 0)]);
    expect(result).toEqual([{ year: 2026, monthIndex: 0, cycleDays: null }]);
  });

  it('uses only the first start recorded in the month when there are multiple', () => {
    const periods = [
      period('prev', '2026-01-01'),
      period('first', '2026-02-05'),
      period('second', '2026-02-20'),
    ];
    const result = monthlyCyclePoints(periods, [month(2026, 1)]);
    // Jan 1 -> Feb 5 = 35 days. If the second Feb start were used instead
    // (Jan 1 -> Feb 20 = 50 days), this would fail.
    expect(result).toEqual([{ year: 2026, monthIndex: 1, cycleDays: 35 }]);
  });

  it('sorts unsorted input before matching', () => {
    const periods = [
      period('second', '2026-02-20'),
      period('first', '2026-02-05'),
      period('prev', '2026-01-01'),
    ];
    const result = monthlyCyclePoints(periods, [month(2026, 1)]);
    expect(result).toEqual([{ year: 2026, monthIndex: 1, cycleDays: 35 }]);
  });

  it('matches the month by year, not just month number, across a year boundary', () => {
    const periods = [
      period('old-prev', '2024-12-01'),
      period('wrong-jan', '2025-01-10'),
      period('right-prev', '2025-12-20'),
      period('target', '2026-01-25'),
    ];
    const result = monthlyCyclePoints(periods, [month(2026, 0)]);
    // Correct: right-prev (2025-12-20) -> target (2026-01-25) = 36 days.
    // A bug that matches month-of-year only (ignoring the year) would instead
    // pick wrong-jan as the "January" record and report 40 days.
    expect(result).toEqual([{ year: 2026, monthIndex: 0, cycleDays: 36 }]);
  });

  it('returns null for every month when periods is empty', () => {
    const result = monthlyCyclePoints([], [month(2026, 0), month(2026, 1)]);
    expect(result).toEqual([
      { year: 2026, monthIndex: 0, cycleDays: null },
      { year: 2026, monthIndex: 1, cycleDays: null },
    ]);
  });

  it('regression: real user record is null for every queried month (all gaps out of range)', () => {
    // 06-23~26, 08-29~09-02, 09-09, 09-14~18 -> gaps ~67, ~11, ~5 days, all
    // outside the 15~60 countable range. September's first start (09-09) is
    // the one considered, not the later 09-14 record.
    const periods = [
      period('a', '2026-06-23'),
      period('b', '2026-08-29'),
      period('c', '2026-09-09'),
      period('d', '2026-09-14'),
    ];
    const months = [
      month(2026, 3),
      month(2026, 4),
      month(2026, 5),
      month(2026, 6),
      month(2026, 7),
      month(2026, 8),
    ];
    const result = monthlyCyclePoints(periods, months);
    expect(result.every((r) => r.cycleDays === null)).toBe(true);
  });
});
