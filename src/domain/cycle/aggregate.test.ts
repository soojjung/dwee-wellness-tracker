import { describe, it, expect } from 'vitest';
import { averageCycleLength, averagePeriodLength } from './aggregate';
import type { PeriodLog } from '@/types';

function period(id: string, startDate: string, endDate?: string): PeriodLog {
  return {
    id,
    startDate,
    ...(endDate ? { endDate } : {}),
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('averageCycleLength', () => {
  it('returns null for an empty list', () => {
    expect(averageCycleLength([])).toBeNull();
  });

  it('returns null for a single record (no gap to measure)', () => {
    expect(averageCycleLength([period('a', '2026-01-01')])).toBeNull();
  });

  it('returns the single gap for two records', () => {
    const periods = [period('a', '2026-01-01'), period('b', '2026-01-29')];
    expect(averageCycleLength(periods)).toBe(28);
  });

  it('averages multiple countable gaps', () => {
    const periods = [
      period('a', '2026-01-01'),
      period('b', '2026-01-29'),
      period('c', '2026-02-26'),
    ];
    expect(averageCycleLength(periods)).toBe(28);
  });

  it('includes a 15-day gap (countable minimum boundary)', () => {
    const periods = [period('a', '2026-01-01'), period('b', '2026-01-16')];
    expect(averageCycleLength(periods)).toBe(15);
  });

  it('excludes a 14-day gap (just below the countable minimum)', () => {
    const periods = [period('a', '2026-01-01'), period('b', '2026-01-15')];
    expect(averageCycleLength(periods)).toBeNull();
  });

  it('includes a 60-day gap (countable maximum boundary)', () => {
    const periods = [period('a', '2026-01-01'), period('b', '2026-03-02')];
    expect(averageCycleLength(periods)).toBe(60);
  });

  it('excludes a 61-day gap (just above the countable maximum)', () => {
    const periods = [period('a', '2026-01-01'), period('b', '2026-03-03')];
    expect(averageCycleLength(periods)).toBeNull();
  });

  it('sorts unsorted input before computing gaps', () => {
    const periods = [
      period('c', '2026-02-26'),
      period('a', '2026-01-01'),
      period('b', '2026-01-29'),
    ];
    expect(averageCycleLength(periods)).toBe(28);
  });

  it('rounds the average half up', () => {
    // Gaps of 27 and 30 days average to 28.5 -> rounds to 29.
    const periods = [
      period('a', '2026-01-01'),
      period('b', '2026-01-28'),
      period('c', '2026-02-27'),
    ];
    expect(averageCycleLength(periods)).toBe(29);
  });

  it('drops out-of-range gaps but keeps the countable ones', () => {
    // a->b is 9 days (excluded), b->c is 28 days (included) -> average is just 28.
    const periods = [
      period('a', '2026-01-01'),
      period('b', '2026-01-10'),
      period('c', '2026-02-07'),
    ];
    expect(averageCycleLength(periods)).toBe(28);
  });
});

describe('averagePeriodLength', () => {
  it('returns null for an empty list', () => {
    expect(averagePeriodLength([])).toBeNull();
  });

  it('returns null when no record has an endDate', () => {
    expect(averagePeriodLength([period('a', '2026-01-01')])).toBeNull();
  });

  it('includes a 1-day period (countable minimum boundary, same start/end)', () => {
    const periods = [period('a', '2026-01-05', '2026-01-05')];
    expect(averagePeriodLength(periods)).toBe(1);
  });

  it('includes a 14-day period (countable maximum boundary)', () => {
    const periods = [period('a', '2026-01-01', '2026-01-14')];
    expect(averagePeriodLength(periods)).toBe(14);
  });

  it('excludes a 15-day period (just above the countable maximum)', () => {
    const periods = [period('a', '2026-01-01', '2026-01-15')];
    expect(averagePeriodLength(periods)).toBeNull();
  });

  it('excludes a period whose endDate is before its startDate (negative length)', () => {
    const periods = [period('a', '2026-01-10', '2026-01-05')];
    expect(averagePeriodLength(periods)).toBeNull();
  });

  it('only averages records that have an endDate', () => {
    const periods = [period('a', '2026-01-01', '2026-01-05'), period('b', '2026-02-01')];
    expect(averagePeriodLength(periods)).toBe(5);
  });

  it('rounds the average half up', () => {
    // Lengths of 5 and 6 days average to 5.5 -> rounds to 6.
    const periods = [
      period('a', '2026-01-01', '2026-01-05'),
      period('b', '2026-02-01', '2026-02-06'),
    ];
    expect(averagePeriodLength(periods)).toBe(6);
  });
});
