import { describe, it, expect } from 'vitest';
import { classifyCycleStatus } from './status';
import type { PeriodLog } from '@/types';

function log(id: string, startDate: string, endDate?: string): PeriodLog {
  return {
    id,
    startDate,
    ...(endDate ? { endDate } : {}),
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('classifyCycleStatus', () => {
  it('returns insufficient when fewer than 3 records', () => {
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-05'),
      log('b', '2026-01-29', '2026-02-03'),
    ]);
    expect(result.status).toBe('insufficient');
    expect(result.confidence).toBe('unknown');
    expect(result.averageCycleDays).toBeNull();
  });

  it('returns shortPeriod when latest completed length is 2 days', () => {
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-05'),
      log('b', '2026-01-29', '2026-02-02'),
      log('c', '2026-02-26', '2026-02-27'),
    ]);
    expect(result.status).toBe('shortPeriod');
    expect(result.latestPeriodLengthDays).toBe(2);
  });

  it('returns longPeriod when latest completed length is 8+ days', () => {
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-05'),
      log('b', '2026-01-29', '2026-02-04'),
      log('c', '2026-02-26', '2026-03-06'),
    ]);
    expect(result.status).toBe('longPeriod');
    expect(result.latestPeriodLengthDays).toBe(9);
  });

  it('returns irregular when cycle range spans 15+ days', () => {
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-05'),
      log('b', '2026-01-25', '2026-01-29'),
      log('c', '2026-03-05', '2026-03-09'),
    ]);
    expect(result.status).toBe('irregular');
    expect(result.cycleRangeDays).toBeGreaterThanOrEqual(15);
  });

  it('returns slightlyIrregular when cycle range is 8~14 days', () => {
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-05'),
      log('b', '2026-01-25', '2026-01-29'),
      log('c', '2026-02-28', '2026-03-04'),
    ]);
    expect(result.status).toBe('slightlyIrregular');
    expect(result.cycleRangeDays).toBeGreaterThanOrEqual(8);
    expect(result.cycleRangeDays).toBeLessThanOrEqual(14);
  });

  it('returns stable when period 3~7d, cycle 21~35d, range <= 7d', () => {
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-06'),
      log('b', '2026-01-29', '2026-02-03'),
      log('c', '2026-02-26', '2026-03-03'),
      log('d', '2026-03-26', '2026-03-31'),
    ]);
    expect(result.status).toBe('stable');
    expect(result.confidence).toBe('high');
  });

  it('returns regular when repeats consistently but outside stable window', () => {
    // Cycle length ~19 days (below stable 21) but constant → regular
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-05'),
      log('b', '2026-01-20', '2026-01-24'),
      log('c', '2026-02-08', '2026-02-12'),
      log('d', '2026-02-27', '2026-03-03'),
    ]);
    expect(result.status).toBe('regular');
  });

  it('marks confidence high when 4+ cycle gaps are available', () => {
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-06'),
      log('b', '2026-01-29', '2026-02-03'),
      log('c', '2026-02-26', '2026-03-03'),
      log('d', '2026-03-26', '2026-03-31'),
      log('e', '2026-04-23', '2026-04-28'),
    ]);
    expect(result.confidence).toBe('high');
  });

  it('marks confidence medium at exactly 3 records (2 gaps)', () => {
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-06'),
      log('b', '2026-01-29', '2026-02-03'),
      log('c', '2026-02-26', '2026-03-03'),
    ]);
    expect(result.confidence).toBe('medium');
  });

  it('excludes cycle gaps outside 15~60 days from calculations', () => {
    // Middle record too close (14d gap) → dropped, remaining gaps stable
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-05'),
      log('b', '2026-01-15', '2026-01-19'),
      log('c', '2026-02-12', '2026-02-16'),
    ]);
    expect(result.status).not.toBe('insufficient');
    expect(result.averageCycleDays).not.toBeNull();
  });
});
