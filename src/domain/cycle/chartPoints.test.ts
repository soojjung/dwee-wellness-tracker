import { describe, it, expect } from 'vitest';
import { cycleChartPoints, type ChartMonth } from './chartPoints';
import type { PeriodLog } from '@/types';

function period(id: string, startDate: string): PeriodLog {
  return { id, startDate, createdAt: '2026-01-01T00:00:00.000Z' };
}

function month(year: number, monthIndex: number): ChartMonth {
  return { year, monthIndex };
}

const APR_TO_SEP_2026 = [3, 4, 5, 6, 7, 8].map((m) => month(2026, m));

describe('cycleChartPoints', () => {
  it('returns no points when periods is empty', () => {
    expect(cycleChartPoints([], APR_TO_SEP_2026)).toEqual([]);
  });

  it('makes no point for the very first period on record (no previous)', () => {
    expect(cycleChartPoints([period('a', '2026-05-10')], APR_TO_SEP_2026)).toEqual([]);
  });

  it('makes a point for the gap ending at a start inside the window', () => {
    const periods = [period('a', '2026-07-28'), period('b', '2026-08-29')];
    const [p] = cycleChartPoints(periods, APR_TO_SEP_2026);
    expect(p).toMatchObject({ startDate: '2026-08-29', cycleDays: 32 });
  });

  it('places a late-month start near the right edge of its month slot', () => {
    // Aug is slot 4 of 6 -> spans [4/6, 5/6]. Aug 29 of 31 -> (4 + 28.5/31) / 6.
    const periods = [period('a', '2026-07-28'), period('b', '2026-08-29')];
    const [p] = cycleChartPoints(periods, APR_TO_SEP_2026);
    expect(p!.position).toBeCloseTo((4 + 28.5 / 31) / 6, 10);
    expect(p!.position).toBeGreaterThan(4.9 / 6);
    expect(p!.position).toBeLessThan(5 / 6);
  });

  it('places a 1st-of-month start just right of the slot start', () => {
    const periods = [period('a', '2026-05-02'), period('b', '2026-06-01')];
    const [p] = cycleChartPoints(periods, APR_TO_SEP_2026);
    expect(p!.position).toBeCloseTo((2 + 0.5 / 30) / 6, 10);
  });

  it('uses the real month length (February 2026 has 28 days)', () => {
    const periods = [period('a', '2026-01-31'), period('b', '2026-02-28')];
    const [p] = cycleChartPoints(periods, [month(2026, 1)]);
    expect(p!.position).toBeCloseTo(27.5 / 28, 10);
  });

  it('makes one point per start when a month holds two starts', () => {
    const periods = [
      period('prev', '2026-04-10'),
      period('first', '2026-05-01'),
      period('second', '2026-05-30'),
    ];
    const result = cycleChartPoints(periods, APR_TO_SEP_2026);
    expect(result.map((p) => [p.startDate, p.cycleDays])).toEqual([
      ['2026-05-01', 21],
      ['2026-05-30', 29],
    ]);
    expect(result[0]!.position).toBeLessThan(result[1]!.position);
  });

  it('skips a 14-day gap and keeps a 15-day gap (countable minimum)', () => {
    const short = [period('a', '2026-05-17'), period('b', '2026-05-31')];
    const edge = [period('a', '2026-05-16'), period('b', '2026-05-31')];
    expect(cycleChartPoints(short, APR_TO_SEP_2026)).toEqual([]);
    expect(cycleChartPoints(edge, APR_TO_SEP_2026)[0]!.cycleDays).toBe(15);
  });

  it('keeps a 60-day gap and skips a 61-day gap (countable maximum)', () => {
    const edge = [period('a', '2026-04-02'), period('b', '2026-06-01')];
    const long = [period('a', '2026-04-01'), period('b', '2026-06-01')];
    expect(cycleChartPoints(edge, APR_TO_SEP_2026)[0]!.cycleDays).toBe(60);
    expect(cycleChartPoints(long, APR_TO_SEP_2026)).toEqual([]);
  });

  it('uses a previous period outside the window, but skips starts outside it', () => {
    const periods = [
      period('before', '2026-03-20'),
      period('in', '2026-04-18'),
      period('after', '2026-10-07'),
    ];
    const result = cycleChartPoints(periods, APR_TO_SEP_2026);
    expect(result.map((p) => [p.startDate, p.cycleDays])).toEqual([['2026-04-18', 29]]);
  });

  it('sorts unsorted input and matches months by year across a year boundary', () => {
    const periods = [
      period('target', '2026-01-25'),
      period('wrong-jan', '2025-01-10'),
      period('right-prev', '2025-12-20'),
    ];
    const result = cycleChartPoints(periods, [month(2025, 11), month(2026, 0)]);
    // right-prev -> target = 36 days, in the second (Jan 2026) slot.
    expect(result.map((p) => [p.startDate, p.cycleDays])).toEqual([['2026-01-25', 36]]);
    expect(result[0]!.position).toBeGreaterThan(0.5);
  });

  it('regression: real user record has no points when every gap is out of range', () => {
    // 06-23, 08-29, 09-09, 09-14 -> gaps 67, 11, 5 days.
    const periods = [
      period('a', '2026-06-23'),
      period('b', '2026-08-29'),
      period('c', '2026-09-09'),
      period('d', '2026-09-14'),
    ];
    expect(cycleChartPoints(periods, APR_TO_SEP_2026)).toEqual([]);
  });
});
