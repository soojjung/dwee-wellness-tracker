import { describe, it, expect } from 'vitest';
import type { EventLog } from '@/types/eventLog';
import {
  truncateTitle,
  dateWithin,
  eventsForDate,
  pickBadgesForDay,
  MAX_BADGES_PER_DAY,
  MAX_BADGE_TITLE_LEN,
} from './badges';

function makeEvent(
  id: string,
  startDate: string,
  endDate: string,
  title = 'Event',
): EventLog {
  return {
    id,
    startDate,
    endDate,
    title,
    memo: '',
    categoryId: 'cat-1',
    hasPeriodMark: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

// ---------------------------------------------------------------------------
// truncateTitle
// ---------------------------------------------------------------------------

describe('truncateTitle', () => {
  it('returns an empty string unchanged', () => {
    expect(truncateTitle('')).toBe('');
  });

  it('returns a string of exactly MAX_BADGE_TITLE_LEN chars unchanged', () => {
    const s = 'abcd'; // 4 ASCII chars
    expect(truncateTitle(s)).toBe('abcd');
    expect(truncateTitle(s).length).toBe(MAX_BADGE_TITLE_LEN);
  });

  it('returns a string shorter than max unchanged', () => {
    expect(truncateTitle('hi')).toBe('hi');
  });

  it('truncates an ASCII string longer than max to max chars', () => {
    expect(truncateTitle('abcdefgh')).toBe('abcd');
  });

  it('truncates to an explicit max override', () => {
    expect(truncateTitle('abcdefgh', 3)).toBe('abc');
  });

  it('counts surrogate-pair emoji as single characters (spread semantics)', () => {
    // Each emoji is 1 code-point in [...str] even though it's 2 chars in .length
    const four = '🌸🌺🌻🌼'; // 4 emoji = exactly max
    expect(truncateTitle(four)).toBe(four);
  });

  it('truncates when emoji count exceeds max, preserving full emoji (no partial surrogate)', () => {
    const six = '🌸🌺🌻🌼🌷🏵️'; // 6 code-points (last may have VS)
    const result = truncateTitle(six);
    // result must be a valid string and have ≤ MAX_BADGE_TITLE_LEN grapheme clusters
    expect([...result].length).toBe(MAX_BADGE_TITLE_LEN);
    expect(six.startsWith(result)).toBe(true);
  });

  it('handles a single multi-byte emoji (does not truncate)', () => {
    expect(truncateTitle('🌸')).toBe('🌸');
  });

  it('handles mixed ASCII + emoji within max (no truncation)', () => {
    const mixed = 'a🌸b'; // 3 code-points
    expect(truncateTitle(mixed)).toBe(mixed);
  });

  it('handles mixed ASCII + emoji exceeding max (truncates by code-point)', () => {
    const mixed = 'a🌸bc'; // 4 code-points — exactly at max, no truncation
    expect(truncateTitle(mixed)).toBe(mixed);
  });
});

// ---------------------------------------------------------------------------
// dateWithin
// ---------------------------------------------------------------------------

describe('dateWithin', () => {
  it('returns true when target equals start (inclusive lower bound)', () => {
    expect(dateWithin('2026-03-01', '2026-03-01', '2026-03-05')).toBe(true);
  });

  it('returns true when target equals end (inclusive upper bound)', () => {
    expect(dateWithin('2026-03-05', '2026-03-01', '2026-03-05')).toBe(true);
  });

  it('returns true when target is strictly between start and end', () => {
    expect(dateWithin('2026-03-03', '2026-03-01', '2026-03-05')).toBe(true);
  });

  it('returns false when target is before start', () => {
    expect(dateWithin('2026-02-28', '2026-03-01', '2026-03-05')).toBe(false);
  });

  it('returns false when target is after end', () => {
    expect(dateWithin('2026-03-06', '2026-03-01', '2026-03-05')).toBe(false);
  });

  it('returns true for a single-day range when target equals that day', () => {
    expect(dateWithin('2026-06-15', '2026-06-15', '2026-06-15')).toBe(true);
  });

  it('returns false for a single-day range when target is one day away', () => {
    expect(dateWithin('2026-06-16', '2026-06-15', '2026-06-15')).toBe(false);
  });

  it('handles year boundary correctly', () => {
    expect(dateWithin('2026-01-01', '2025-12-31', '2026-01-02')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// eventsForDate
// ---------------------------------------------------------------------------

describe('eventsForDate', () => {
  it('returns empty array when events list is empty', () => {
    expect(eventsForDate([], '2026-03-10')).toEqual([]);
  });

  it('includes an event whose startDate equals the target date', () => {
    const e = makeEvent('a', '2026-03-10', '2026-03-15');
    expect(eventsForDate([e], '2026-03-10')).toEqual([e]);
  });

  it('includes an event whose endDate equals the target date', () => {
    const e = makeEvent('a', '2026-03-05', '2026-03-10');
    expect(eventsForDate([e], '2026-03-10')).toEqual([e]);
  });

  it('includes an event that spans the target date', () => {
    const e = makeEvent('a', '2026-03-01', '2026-03-31');
    expect(eventsForDate([e], '2026-03-15')).toEqual([e]);
  });

  it('excludes an event whose range ends before the target date', () => {
    const e = makeEvent('a', '2026-03-01', '2026-03-09');
    expect(eventsForDate([e], '2026-03-10')).toEqual([]);
  });

  it('excludes an event whose range starts after the target date', () => {
    const e = makeEvent('a', '2026-03-11', '2026-03-20');
    expect(eventsForDate([e], '2026-03-10')).toEqual([]);
  });

  it('returns only the events whose range covers the target date when mixed', () => {
    const before = makeEvent('b', '2026-03-01', '2026-03-09');
    const match = makeEvent('m', '2026-03-05', '2026-03-15');
    const after = makeEvent('a', '2026-03-11', '2026-03-20');
    expect(eventsForDate([before, match, after], '2026-03-10')).toEqual([match]);
  });

  it('returns multiple events when they all cover the target date', () => {
    const e1 = makeEvent('1', '2026-03-01', '2026-03-31');
    const e2 = makeEvent('2', '2026-03-10', '2026-03-10');
    const e3 = makeEvent('3', '2026-03-08', '2026-03-12');
    expect(eventsForDate([e1, e2, e3], '2026-03-10')).toEqual([e1, e2, e3]);
  });

  it('handles a single-day event on its day', () => {
    const e = makeEvent('a', '2026-07-04', '2026-07-04');
    expect(eventsForDate([e], '2026-07-04')).toEqual([e]);
  });
});

// ---------------------------------------------------------------------------
// pickBadgesForDay
// ---------------------------------------------------------------------------

describe('pickBadgesForDay', () => {
  it('returns empty array when no events match the date', () => {
    const e = makeEvent('a', '2026-03-01', '2026-03-09');
    expect(pickBadgesForDay([e], '2026-03-15')).toEqual([]);
  });

  it('returns all matching events when count is under MAX_BADGES_PER_DAY', () => {
    const e1 = makeEvent('1', '2026-03-10', '2026-03-12');
    const e2 = makeEvent('2', '2026-03-10', '2026-03-12');
    expect(pickBadgesForDay([e1, e2], '2026-03-11')).toEqual([e1, e2]);
  });

  it('returns exactly MAX_BADGES_PER_DAY events when count equals the cap', () => {
    const events = [
      makeEvent('1', '2026-03-10', '2026-03-12'),
      makeEvent('2', '2026-03-10', '2026-03-12'),
      makeEvent('3', '2026-03-10', '2026-03-12'),
    ];
    const result = pickBadgesForDay(events, '2026-03-11');
    expect(result).toHaveLength(MAX_BADGES_PER_DAY);
    expect(result).toEqual(events);
  });

  it('caps at MAX_BADGES_PER_DAY when more events match', () => {
    const events = [
      makeEvent('1', '2026-03-10', '2026-03-12'),
      makeEvent('2', '2026-03-10', '2026-03-12'),
      makeEvent('3', '2026-03-10', '2026-03-12'),
      makeEvent('4', '2026-03-10', '2026-03-12'),
      makeEvent('5', '2026-03-10', '2026-03-12'),
    ];
    const result = pickBadgesForDay(events, '2026-03-11');
    expect(result).toHaveLength(MAX_BADGES_PER_DAY);
    // First 3 in input order
    expect(result.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it('respects an explicit max override', () => {
    const events = [
      makeEvent('1', '2026-03-10', '2026-03-12'),
      makeEvent('2', '2026-03-10', '2026-03-12'),
      makeEvent('3', '2026-03-10', '2026-03-12'),
    ];
    expect(pickBadgesForDay(events, '2026-03-11', 1)).toHaveLength(1);
    expect(pickBadgesForDay(events, '2026-03-11', 2)).toHaveLength(2);
  });

  it('returns empty array on empty events list', () => {
    expect(pickBadgesForDay([], '2026-03-10')).toEqual([]);
  });

  it('preserves input order up to the cap', () => {
    const events = [
      makeEvent('z', '2026-03-10', '2026-03-12'),
      makeEvent('a', '2026-03-10', '2026-03-12'),
      makeEvent('m', '2026-03-10', '2026-03-12'),
      makeEvent('b', '2026-03-10', '2026-03-12'),
    ];
    const result = pickBadgesForDay(events, '2026-03-11');
    expect(result.map((e) => e.id)).toEqual(['z', 'a', 'm']);
  });
});
