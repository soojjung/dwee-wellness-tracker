import { describe, it, expect } from 'vitest';
import { isValidISODate, ISO_DATE_RE, formatFullDate, fromISO } from './index';

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
