import { describe, it, expect } from 'vitest';
import { iso, addDays, weekday, isWeekend, nthWeekday, lastWeekday } from './dateUtils';

describe('iso', () => {
  it('pads single-digit month and day with a leading zero', () => {
    expect(iso(2026, 1, 5)).toBe('2026-01-05');
  });

  it('leaves already-two-digit month and day unchanged', () => {
    expect(iso(2026, 12, 31)).toBe('2026-12-31');
  });
});

describe('addDays', () => {
  it('adds days forward within the same month', () => {
    expect(addDays('2026-03-10', 5)).toBe('2026-03-15');
  });

  it('subtracts days backward across a month boundary', () => {
    expect(addDays('2026-03-10', -15)).toBe('2026-02-23');
  });

  it('returns the same date when adding zero days', () => {
    expect(addDays('2026-06-15', 0)).toBe('2026-06-15');
  });

  it('rolls Feb 28 -> Feb 29 in a leap year', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('rolls Feb 28 -> Mar 1 in a non-leap year', () => {
    expect(addDays('2027-02-28', 1)).toBe('2027-03-01');
  });

  it('rolls Dec 31 -> Jan 1 of the next year', () => {
    expect(addDays('2027-12-31', 1)).toBe('2028-01-01');
  });
});

describe('weekday', () => {
  it('returns 0 (Sunday) with no drift around a US DST transition date', () => {
    // 2026-03-08 is the second Sunday of March 2026, when US DST begins.
    expect(weekday('2026-03-08')).toBe(0);
  });

  it('returns 6 for a known Saturday', () => {
    expect(weekday('2026-01-03')).toBe(6);
  });

  it('returns 1 for a known Monday', () => {
    expect(weekday('2026-01-05')).toBe(1);
  });
});

describe('isWeekend', () => {
  it('returns true for Saturday', () => {
    expect(isWeekend('2026-01-03')).toBe(true);
  });

  it('returns true for Sunday', () => {
    expect(isWeekend('2026-01-04')).toBe(true);
  });

  it('returns false for a weekday', () => {
    expect(isWeekend('2026-01-07')).toBe(false);
  });
});

describe('nthWeekday', () => {
  it('finds the 1st occurrence of a weekday in the month', () => {
    // First Sunday of March 2026.
    expect(nthWeekday(2026, 3, 0, 1)).toBe('2026-03-01');
  });

  it('finds the 3rd occurrence of a weekday in the month', () => {
    // Third Monday of January 2026 (US MLK Day).
    expect(nthWeekday(2026, 1, 1, 3)).toBe('2026-01-19');
  });

  it('finds the 4th occurrence of a weekday in the month', () => {
    // Fourth Thursday of November 2026 (US Thanksgiving).
    expect(nthWeekday(2026, 11, 4, 4)).toBe('2026-11-26');
  });
});

describe('lastWeekday', () => {
  it('finds the last occurrence of a weekday in the month', () => {
    // Last Monday of May 2026 (US Memorial Day).
    expect(lastWeekday(2026, 5, 1)).toBe('2026-05-25');
  });

  it('finds the last occurrence of a weekday in December without leaking into next year', () => {
    // Last Thursday of December 2026; computed via next year's Jan 1 internally.
    expect(lastWeekday(2026, 12, 4)).toBe('2026-12-31');
  });

  it('returns the last day of the month itself when it already matches the target weekday', () => {
    // Feb 28, 2026 is itself a Saturday.
    expect(lastWeekday(2026, 2, 6)).toBe('2026-02-28');
  });
});
