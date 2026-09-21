import { describe, it, expect } from 'vitest';
import { buildDays, computeState, predictedRange } from './weekStripDays';
import type { PeriodLog } from '@/types';

function period(id: string, startDate: string, endDate?: string): PeriodLog {
  return {
    id,
    startDate,
    ...(endDate ? { endDate } : {}),
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('predictedRange', () => {
  it('returns null when predictedDate is null', () => {
    expect(predictedRange(null, 5)).toBeNull();
  });

  it('spans [predictedDate, predictedDate + length - 1]', () => {
    expect(predictedRange('2026-06-01', 5)).toEqual({
      start: '2026-06-01',
      end: '2026-06-05',
    });
  });

  it('clamps a non-positive length to a single day', () => {
    expect(predictedRange('2026-06-01', 0)).toEqual({
      start: '2026-06-01',
      end: '2026-06-01',
    });
    expect(predictedRange('2026-06-01', -3)).toEqual({
      start: '2026-06-01',
      end: '2026-06-01',
    });
  });
});

describe('computeState', () => {
  const predictedPeriod = { start: '2026-06-10', end: '2026-06-14' };
  const fertile = { start: '2026-05-20', end: '2026-05-26' };

  it('returns actualPeriod when the date falls in a real period record', () => {
    const periods = [period('a', '2026-06-01', '2026-06-05')];
    expect(computeState('2026-06-03', periods, predictedPeriod, fertile)).toBe('actualPeriod');
  });

  it('prioritizes actualPeriod over an overlapping predicted period', () => {
    const periods = [period('a', '2026-06-10', '2026-06-12')];
    expect(computeState('2026-06-11', periods, predictedPeriod, fertile)).toBe('actualPeriod');
  });

  it('returns predictedPeriod when inside the predicted range and not an actual period', () => {
    expect(computeState('2026-06-12', [], predictedPeriod, fertile)).toBe('predictedPeriod');
  });

  it('returns predictedFertile when inside the fertile window only', () => {
    expect(computeState('2026-05-22', [], predictedPeriod, fertile)).toBe('predictedFertile');
  });

  it('returns null when the date matches none of the ranges', () => {
    expect(computeState('2026-07-01', [], predictedPeriod, fertile)).toBeNull();
  });

  it('returns null when predictedPeriod and fertile are both null', () => {
    expect(computeState('2026-06-12', [], null, null)).toBeNull();
  });

  it('treats range boundaries as inclusive', () => {
    expect(computeState('2026-06-10', [], predictedPeriod, fertile)).toBe('predictedPeriod');
    expect(computeState('2026-06-14', [], predictedPeriod, fertile)).toBe('predictedPeriod');
    expect(computeState('2026-06-09', [], predictedPeriod, fertile)).toBeNull();
    expect(computeState('2026-06-15', [], predictedPeriod, fertile)).toBeNull();
  });
});

describe('buildDays', () => {
  it('returns 121 days spanning 60 days before/after today, inclusive', () => {
    const days = buildDays('2026-06-15', [], null, 5, 'unknown');
    expect(days).toHaveLength(121);
    expect(days[0]!.date).toBe('2026-04-16');
    expect(days[days.length - 1]!.date).toBe('2026-08-14');
  });

  it('marks today actualPeriod when today falls in a real period', () => {
    const periods = [period('a', '2026-06-14', '2026-06-16')];
    const days = buildDays('2026-06-15', periods, null, 5, 'unknown');
    const today = days.find((d) => d.date === '2026-06-15');
    expect(today?.state).toBe('actualPeriod');
  });

  it('marks the predicted period range when a prediction exists', () => {
    const days = buildDays('2026-06-01', [], '2026-06-10', 4, 'medium');
    const predictedDay = days.find((d) => d.date === '2026-06-11');
    expect(predictedDay?.state).toBe('predictedPeriod');
  });

  it('produces all-null states when there is no data at all', () => {
    const days = buildDays('2026-06-01', [], null, 5, 'unknown');
    expect(days.every((d) => d.state === null)).toBe(true);
  });
});
