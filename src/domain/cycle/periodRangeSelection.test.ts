import { describe, it, expect } from 'vitest';
import {
  isInPeriodRange,
  rangeBounds,
  tapRangeDate,
  type PeriodRangeSelection,
} from './periodRangeSelection';

describe('tapRangeDate', () => {
  it('sets the start when there is no selection yet', () => {
    expect(tapRangeDate(null, '2026-06-10')).toEqual({ start: '2026-06-10', end: null });
  });

  it('clears the selection when the lone start is tapped again', () => {
    const selection: PeriodRangeSelection = { start: '2026-06-10', end: null };
    expect(tapRangeDate(selection, '2026-06-10')).toBeNull();
  });

  it('sets the end when a later date is tapped after the start', () => {
    const selection: PeriodRangeSelection = { start: '2026-06-10', end: null };
    expect(tapRangeDate(selection, '2026-06-14')).toEqual({ start: '2026-06-10', end: '2026-06-14' });
  });

  it('sets the end even when the second tap is before the start (order-independent)', () => {
    const selection: PeriodRangeSelection = { start: '2026-06-10', end: null };
    expect(tapRangeDate(selection, '2026-06-05')).toEqual({ start: '2026-06-10', end: '2026-06-05' });
  });

  it('starts a brand-new range when tapping again after a full range exists', () => {
    const selection: PeriodRangeSelection = { start: '2026-06-10', end: '2026-06-14' };
    expect(tapRangeDate(selection, '2026-06-20')).toEqual({ start: '2026-06-20', end: null });
  });

  it('starts a new range even if the tapped date is inside the existing range', () => {
    const selection: PeriodRangeSelection = { start: '2026-06-10', end: '2026-06-14' };
    expect(tapRangeDate(selection, '2026-06-12')).toEqual({ start: '2026-06-12', end: null });
  });
});

describe('rangeBounds', () => {
  it('returns hi=null for a start-only selection', () => {
    expect(rangeBounds({ start: '2026-06-10', end: null })).toEqual({
      lo: '2026-06-10',
      hi: null,
    });
  });

  it('keeps forward order as-is', () => {
    expect(rangeBounds({ start: '2026-06-10', end: '2026-06-14' })).toEqual({
      lo: '2026-06-10',
      hi: '2026-06-14',
    });
  });

  it('flips a reversed tap order into lo/hi', () => {
    expect(rangeBounds({ start: '2026-06-14', end: '2026-06-10' })).toEqual({
      lo: '2026-06-10',
      hi: '2026-06-14',
    });
  });

  it('handles a same-day range', () => {
    expect(rangeBounds({ start: '2026-06-10', end: '2026-06-10' })).toEqual({
      lo: '2026-06-10',
      hi: '2026-06-10',
    });
  });
});

describe('isInPeriodRange', () => {
  it('returns false for every date when selection is null', () => {
    expect(isInPeriodRange(null, '2026-06-10')).toBe(false);
  });

  it('is true only for the start date when only a start is tapped', () => {
    const selection: PeriodRangeSelection = { start: '2026-06-10', end: null };
    expect(isInPeriodRange(selection, '2026-06-10')).toBe(true);
    expect(isInPeriodRange(selection, '2026-06-11')).toBe(false);
    expect(isInPeriodRange(selection, '2026-06-09')).toBe(false);
  });

  it('is true for every date within a forward range, inclusive', () => {
    const selection: PeriodRangeSelection = { start: '2026-06-10', end: '2026-06-12' };
    expect(isInPeriodRange(selection, '2026-06-10')).toBe(true);
    expect(isInPeriodRange(selection, '2026-06-11')).toBe(true);
    expect(isInPeriodRange(selection, '2026-06-12')).toBe(true);
    expect(isInPeriodRange(selection, '2026-06-13')).toBe(false);
  });

  it('is true for every date within a reversed-tap range, inclusive', () => {
    const selection: PeriodRangeSelection = { start: '2026-06-14', end: '2026-06-12' };
    expect(isInPeriodRange(selection, '2026-06-12')).toBe(true);
    expect(isInPeriodRange(selection, '2026-06-13')).toBe(true);
    expect(isInPeriodRange(selection, '2026-06-14')).toBe(true);
    expect(isInPeriodRange(selection, '2026-06-11')).toBe(false);
  });
});
