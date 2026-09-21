import { describe, it, expect } from 'vitest';
import { buildMonth } from './monthWeeks';

describe('buildMonth', () => {
  it('pads leading nulls up to the first weekday of the month', () => {
    // 2026-09-01 is a Tuesday (weekday index 2) -> 2 leading nulls.
    const { weeks } = buildMonth(2026, 8);
    expect(weeks[0]!.slice(0, 2)).toEqual([null, null]);
    expect(weeks[0]![2]).toBe('2026-09-01');
  });

  it('has no leading nulls when the month starts on Sunday', () => {
    // 2026-02-01 is a Sunday.
    const { weeks } = buildMonth(2026, 1);
    expect(weeks[0]![0]).toBe('2026-02-01');
  });

  it('pads trailing nulls to complete the final week of 7', () => {
    // 2026-09-30 is a Wednesday -> 3 trailing nulls after it in the last week.
    const { weeks } = buildMonth(2026, 8);
    const lastWeek = weeks[weeks.length - 1]!;
    expect(lastWeek).toHaveLength(7);
    expect(lastWeek.slice(-3)).toEqual([null, null, null]);
  });

  it('produces exactly 5 weeks for a month needing 5 rows', () => {
    // September 2026: 2 leading + 30 days = 32 cells -> 5 weeks (35 cells).
    const { weeks } = buildMonth(2026, 8);
    expect(weeks).toHaveLength(5);
  });

  it('produces exactly 4 weeks when the month exactly fills whole weeks', () => {
    // February 2026: starts Sunday, 28 days -> exactly 4 weeks, no padding.
    const { weeks } = buildMonth(2026, 1);
    expect(weeks).toHaveLength(4);
    expect(weeks.every((w) => w.every((c) => c !== null))).toBe(true);
  });

  it('produces exactly 6 weeks for a month needing 6 rows', () => {
    // August 2026: starts Saturday, 31 days -> 6 leading+trailing rows.
    const { weeks } = buildMonth(2026, 7);
    expect(weeks).toHaveLength(6);
  });

  it('every week has exactly 7 cells', () => {
    const { weeks } = buildMonth(2026, 7);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });

  it('builds the key as zero-padded YYYY-MM', () => {
    expect(buildMonth(2026, 0).key).toBe('2026-01');
    expect(buildMonth(2026, 11).key).toBe('2026-12');
  });

  it('renders ko and en month names', () => {
    const m = buildMonth(2026, 5);
    expect(m.labelKo).toBe('6월');
    expect(m.labelEn).toBe('June');
  });

  it('lists every in-month date exactly once across all weeks, in order', () => {
    const { weeks } = buildMonth(2026, 8); // September, 30 days
    const dates = weeks.flat().filter((d): d is string => d !== null);
    expect(dates).toHaveLength(30);
    expect(dates[0]).toBe('2026-09-01');
    expect(dates[dates.length - 1]).toBe('2026-09-30');
  });
});
