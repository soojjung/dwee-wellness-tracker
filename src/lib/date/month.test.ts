import { describe, it, expect } from 'vitest';
import { shiftMonth, monthBoundsISO, monthKey, monthsBackToCover } from './month';

describe('shiftMonth', () => {
  it('rolls forward from December into January of the next year', () => {
    expect(shiftMonth({ year: 2026, monthIndex: 11 }, 1)).toEqual({
      year: 2027,
      monthIndex: 0,
    });
  });

  it('rolls backward from January into December of the previous year', () => {
    expect(shiftMonth({ year: 2026, monthIndex: 0 }, -1)).toEqual({
      year: 2025,
      monthIndex: 11,
    });
  });

  it('returns the same month unchanged for delta=0', () => {
    expect(shiftMonth({ year: 2026, monthIndex: 5 }, 0)).toEqual({
      year: 2026,
      monthIndex: 5,
    });
  });

  it('handles a +13 overflow spanning more than one year', () => {
    // 2026-06 + 13 months = 2027-07
    expect(shiftMonth({ year: 2026, monthIndex: 5 }, 13)).toEqual({
      year: 2027,
      monthIndex: 6,
    });
  });

  it('handles a -13 overflow spanning more than one year', () => {
    // 2026-06 - 13 months = 2025-05
    expect(shiftMonth({ year: 2026, monthIndex: 5 }, -13)).toEqual({
      year: 2025,
      monthIndex: 4,
    });
  });

  it('handles a large negative delta crossing several years', () => {
    // 2026-00 - 25 months = 2023-11
    expect(shiftMonth({ year: 2026, monthIndex: 0 }, -25)).toEqual({
      year: 2023,
      monthIndex: 11,
    });
  });

  it('handles a large positive delta crossing several years', () => {
    // 2026-11 + 25 months = 2029-00
    expect(shiftMonth({ year: 2026, monthIndex: 11 }, 25)).toEqual({
      year: 2029,
      monthIndex: 0,
    });
  });
});

describe('monthBoundsISO', () => {
  it('returns the first/last day of a 31-day month', () => {
    expect(monthBoundsISO({ year: 2026, monthIndex: 0 })).toEqual({
      start: '2026-01-01',
      end: '2026-01-31',
    });
  });

  it('returns Feb 1-28 for a non-leap year', () => {
    expect(monthBoundsISO({ year: 2026, monthIndex: 1 })).toEqual({
      start: '2026-02-01',
      end: '2026-02-28',
    });
  });

  it('returns Feb 1-29 for a leap year', () => {
    expect(monthBoundsISO({ year: 2024, monthIndex: 1 })).toEqual({
      start: '2024-02-01',
      end: '2024-02-29',
    });
  });

  it('returns the first/last day of December (year-end boundary)', () => {
    expect(monthBoundsISO({ year: 2026, monthIndex: 11 })).toEqual({
      start: '2026-12-01',
      end: '2026-12-31',
    });
  });
});

describe('monthKey', () => {
  it('zero-pads a single-digit month', () => {
    expect(monthKey({ year: 2026, monthIndex: 0 })).toBe('2026-01');
  });

  it('does not pad a two-digit month', () => {
    expect(monthKey({ year: 2026, monthIndex: 11 })).toBe('2026-12');
  });

  it('reflects monthIndex + 1 as the calendar month number', () => {
    expect(monthKey({ year: 2026, monthIndex: 8 })).toBe('2026-09');
  });
});

describe('monthsBackToCover', () => {
  it('returns the minimum when there is no record', () => {
    expect(monthsBackToCover('2026-09-26', null, 24)).toBe(24);
  });

  it('keeps the minimum when the earliest record is within it', () => {
    expect(monthsBackToCover('2026-09-26', '2025-03-10', 24)).toBe(24);
  });

  it('reaches back to the month of an older record', () => {
    expect(monthsBackToCover('2026-09-26', '2023-11-30', 24)).toBe(34);
  });

  it('counts by calendar month, ignoring the day', () => {
    expect(monthsBackToCover('2026-09-01', '2024-08-31', 24)).toBe(25);
  });

  it('crosses the year boundary', () => {
    expect(monthsBackToCover('2027-01-05', '2024-12-20', 24)).toBe(25);
  });
});
