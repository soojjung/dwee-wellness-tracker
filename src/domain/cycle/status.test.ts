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
    // Boundary: exactly 2 gaps passes MIN_CYCLES_FOR_STATUS = 2, proceeds to normal
    // determination. Also validates that gaps = 2 is sufficient for range calculation.
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-06'),
      log('b', '2026-01-29', '2026-02-03'),
      log('c', '2026-02-26', '2026-03-03'),
    ]);
    expect(result.confidence).toBe('medium');
    expect(result.cycleRangeDays).toBe(0);
  });

  it('returns insufficient when only 1 countable gap (other gaps filtered)', () => {
    // 3 records: gap 14d (filtered, < 15) + gap 28d (countable) = 1 valid gap only.
    // Changed 2026-09-21: was `regular`, now `insufficient` because range requires 2+ gaps.
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-05'),
      log('b', '2026-01-15', '2026-01-19'),
      log('c', '2026-02-12', '2026-02-16'),
    ]);
    expect(result.status).toBe('insufficient');
    expect(result.confidence).toBe('unknown');
    expect(result.averageCycleDays).toBe(28);
  });

  it('returns insufficient when all gaps are outside 15~60 days (longer than 60)', () => {
    // 3 records with consecutive gaps of ~90 days each — all filtered out.
    // Unlike when shortPeriod/longPeriod is found, gaps=0 with normal period length
    // → insufficient (record intervals too irregular, pattern unanalyzable).
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-05'),
      log('b', '2026-04-01', '2026-04-05'),
      log('c', '2026-07-01', '2026-07-05'),
    ]);
    expect(result.status).toBe('insufficient');
    expect(result.averageCycleDays).toBeNull();
    expect(result.cycleRangeDays).toBeNull();
    expect(result.confidence).toBe('unknown');
  });

  it('returns insufficient when all gaps are outside 15~60 days (shorter than 15)', () => {
    // Three records ~10 days apart each — all under CYCLE_GAP_MIN_DAYS and filtered.
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-04'),
      log('b', '2026-01-11', '2026-01-14'),
      log('c', '2026-01-21', '2026-01-24'),
    ]);
    expect(result.status).toBe('insufficient');
    expect(result.averageCycleDays).toBeNull();
    expect(result.cycleRangeDays).toBeNull();
    expect(result.confidence).toBe('unknown');
  });

  it('shortPeriod still wins over regular-fallback when all gaps are filtered', () => {
    // Latest period length = 2d (shortPeriod). All gaps are >60d so avg is
    // null, but shortPeriod is evaluated first — priority is preserved.
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-04'),
      log('b', '2026-04-01', '2026-04-04'),
      log('c', '2026-07-01', '2026-07-02'),
    ]);
    expect(result.status).toBe('shortPeriod');
    expect(result.averageCycleDays).toBeNull();
    expect(result.latestPeriodLengthDays).toBe(2);
  });

  it('shortPeriod still wins when there is only one countable gap', () => {
    // One countable gap (28d) + one filtered (90d). That alone would be
    // `insufficient` now, but period length is observable without any cycle,
    // so the 2-day period is still what we report.
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-05'),
      log('b', '2026-04-01', '2026-04-05'),
      log('c', '2026-04-29', '2026-04-30'),
    ]);
    expect(result.status).toBe('shortPeriod');
    expect(result.confidence).toBe('low');
    expect(result.averageCycleDays).toBe(28);
  });

  it('longPeriod still wins over regular-fallback when all gaps are filtered', () => {
    // Latest period length = 9d (longPeriod). Same all-gaps-filtered setup.
    const result = classifyCycleStatus([
      log('a', '2026-01-01', '2026-01-04'),
      log('b', '2026-04-01', '2026-04-04'),
      log('c', '2026-07-01', '2026-07-09'),
    ]);
    expect(result.status).toBe('longPeriod');
    expect(result.averageCycleDays).toBeNull();
    expect(result.latestPeriodLengthDays).toBe(9);
  });

  it('returns insufficient (real user case): 4 records with gaps 67/11/5 days — all outside 15~60', () => {
    // Regression test: actual user data that surfaced the bug.
    // Records: 06-23~26, 08-29~09-02, 09-09, 09-14~18 → gaps ~67, ~11, ~5 days.
    // Expected: insufficient (not regular), confidence=unknown.
    const result = classifyCycleStatus([
      log('a', '2026-06-23', '2026-06-26'),
      log('b', '2026-08-29', '2026-09-02'),
      log('c', '2026-09-09', '2026-09-09'),
      log('d', '2026-09-14', '2026-09-18'),
    ]);
    expect(result.status).toBe('insufficient');
    expect(result.confidence).toBe('unknown');
    expect(result.averageCycleDays).toBeNull();
    expect(result.cycleRangeDays).toBeNull();
  });
});
