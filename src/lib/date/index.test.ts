import { describe, it, expect } from 'vitest';
import { isValidISODate, ISO_DATE_RE, formatFullDate, fromISO, calendarGrid } from './index';

describe('ISO_DATE_RE', () => {
  it('matches a well-formed YYYY-MM-DD string', () => {
    expect(ISO_DATE_RE.test('2026-02-01')).toBe(true);
  });

  it('does not match strings missing zero padding', () => {
    expect(ISO_DATE_RE.test('2026-2-1')).toBe(false);
  });

  it('does not match strings without dashes', () => {
    expect(ISO_DATE_RE.test('20260201')).toBe(false);
  });
});

describe('isValidISODate', () => {
  it('returns true for a well-formed date', () => {
    expect(isValidISODate('2026-02-01')).toBe(true);
  });

  it('returns true for a leap-year Feb 29', () => {
    expect(isValidISODate('2024-02-29')).toBe(true);
  });

  it('returns true for year/month boundaries (Dec 31, Jan 1)', () => {
    expect(isValidISODate('2026-12-31')).toBe(true);
    expect(isValidISODate('2026-01-01')).toBe(true);
  });

  it('returns false when the format is wrong (single-digit month/day)', () => {
    expect(isValidISODate('2026-2-1')).toBe(false);
  });

  it('returns false when the format is wrong (no dashes)', () => {
    expect(isValidISODate('20260201')).toBe(false);
  });

  it('returns false when the format is wrong (slashes)', () => {
    expect(isValidISODate('2026/02/01')).toBe(false);
  });

  it('returns false for a non-date string', () => {
    expect(isValidISODate('not a date')).toBe(false);
  });

  it('returns false for an invalid month (> 12)', () => {
    expect(isValidISODate('2026-13-01')).toBe(false);
  });

  it('returns false for an invalid day (Feb 30)', () => {
    expect(isValidISODate('2026-02-30')).toBe(false);
  });

  it('returns false for Feb 29 on a non-leap year', () => {
    expect(isValidISODate('2025-02-29')).toBe(false);
  });

  it('returns false for non-string inputs', () => {
    expect(isValidISODate(undefined)).toBe(false);
    expect(isValidISODate(null)).toBe(false);
    expect(isValidISODate(123)).toBe(false);
    expect(isValidISODate({})).toBe(false);
    expect(isValidISODate([])).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isValidISODate('')).toBe(false);
  });
});

describe('formatFullDate', () => {
  it('renders ko full date with weekday for a Monday', () => {
    expect(formatFullDate('2026-06-15', 'ko')).toBe('2026년 6월 15일 월요일');
  });

  it('renders en full date with weekday for a Monday', () => {
    expect(formatFullDate('2026-06-15', 'en')).toBe('Monday, June 15, 2026');
  });

  it('renders a Sunday in ko', () => {
    expect(formatFullDate('2026-06-14', 'ko')).toBe('2026년 6월 14일 일요일');
  });

  it('renders a Sunday in en', () => {
    expect(formatFullDate('2026-06-14', 'en')).toBe('Sunday, June 14, 2026');
  });

  it('produces the same output for an ISO string and its equivalent Date object', () => {
    const iso = '2026-06-15';
    expect(formatFullDate(fromISO(iso), 'en')).toBe(formatFullDate(iso, 'en'));
  });

  it('renders the last day of a month correctly', () => {
    expect(formatFullDate('2026-01-31', 'en')).toBe('Saturday, January 31, 2026');
  });

  it('renders the first day of the next month correctly', () => {
    expect(formatFullDate('2026-02-01', 'en')).toBe('Sunday, February 1, 2026');
  });
});

describe('calendarGrid', () => {
  it('returns a 5-week (35-cell) grid for a month needing 5 rows, Sunday start', () => {
    const grid = calendarGrid(2026, 8, 0); // September 2026 (Sep 1 = Tue, Sep 30 = Wed)
    expect(grid).toHaveLength(35);
    expect(grid.at(0)?.date).toBe('2026-08-30');
    expect(grid.at(-1)?.date).toBe('2026-10-03');
  });

  it('returns a 4-week (28-cell) grid when the month exactly fills whole weeks, Sunday start', () => {
    const grid = calendarGrid(2026, 1, 0); // February 2026 (Feb 1 = Sun, Feb 28 = Sat, 28 days)
    expect(grid).toHaveLength(28);
    expect(grid.at(0)?.date).toBe('2026-02-01');
    expect(grid.at(-1)?.date).toBe('2026-02-28');
  });

  it('returns a 6-week (42-cell) grid for a month needing 6 rows, Sunday start', () => {
    const grid = calendarGrid(2026, 7, 0); // August 2026 (Aug 1 = Sat, Aug 31 = Mon, 31 days)
    expect(grid).toHaveLength(42);
    expect(grid.at(0)?.date).toBe('2026-07-26');
    expect(grid.at(-1)?.date).toBe('2026-09-05');
  });

  it('shifts the leading padding when weekStartsOn is Monday', () => {
    const grid = calendarGrid(2026, 8, 1); // September 2026, Monday start
    expect(grid).toHaveLength(35);
    expect(grid.at(0)?.date).toBe('2026-08-31');
    expect(grid.at(-1)?.date).toBe('2026-10-04');
  });

  it('marks leading and trailing padding cells as outside the current month', () => {
    const grid = calendarGrid(2026, 8, 0); // September 2026, Sunday start: 2 leading + 3 trailing days
    expect(grid.slice(0, 2).map((c) => c.inCurrentMonth)).toEqual([false, false]);
    expect(grid.slice(-3).map((c) => c.inCurrentMonth)).toEqual([false, false, false]);
  });

  it('marks every day within the target month as inCurrentMonth', () => {
    const grid = calendarGrid(2026, 8, 0); // September 2026, Sunday start
    const septemberCells = grid.filter((c) => c.date >= '2026-09-01' && c.date <= '2026-09-30');
    expect(septemberCells).toHaveLength(30);
    expect(septemberCells.every((c) => c.inCurrentMonth)).toBe(true);
  });

  it('marks every cell true when the month exactly fills whole weeks', () => {
    const grid = calendarGrid(2026, 1, 0); // February 2026, no padding needed
    expect(grid.every((c) => c.inCurrentMonth)).toBe(true);
  });

  it('produces consecutive ISO dates with no gaps or duplicates', () => {
    const grid = calendarGrid(2026, 7, 0); // August 2026, 6-week grid
    for (let i = 1; i < grid.length; i++) {
      const prev = fromISO(grid[i - 1]!.date);
      const curr = fromISO(grid[i]!.date);
      expect((curr.getTime() - prev.getTime()) / 86_400_000).toBe(1);
    }
  });
});
