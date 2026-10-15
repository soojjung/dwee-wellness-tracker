import { describe, it, expect } from 'vitest';
import type { ISODate } from '@/lib/date';
import {
  EMPTY_PERIOD_TAP_STATE,
  finalizePeriodDrafts,
  selectedPeriodDates,
  tapPeriodDate,
  type PeriodTapState,
} from './periodRangeSelection';

function keyGen() {
  let n = 0;
  return () => `new:${++n}`;
}

function tapAll(dates: ISODate[], start: PeriodTapState = EMPTY_PERIOD_TAP_STATE) {
  const newKey = keyGen();
  return dates.reduce((s, d) => tapPeriodDate(s, d, newKey), start);
}

function ranges(state: PeriodTapState) {
  return state.drafts.map((p) => [p.startDate, p.endDate]);
}

describe('tapPeriodDate', () => {
  it('sets a pending start on the first tap', () => {
    expect(tapAll(['2026-10-11'])).toEqual({ drafts: [], pendingStart: '2026-10-11' });
  });

  it('clears the pending start when it is tapped again', () => {
    expect(tapAll(['2026-10-11', '2026-10-11'])).toEqual(EMPTY_PERIOD_TAP_STATE);
  });

  it('completes a range on the second tap', () => {
    const s = tapAll(['2026-10-11', '2026-10-12']);
    expect(ranges(s)).toEqual([['2026-10-11', '2026-10-12']]);
    expect(s.pendingStart).toBeNull();
  });

  it('completes a range when the second tap is before the start', () => {
    expect(ranges(tapAll(['2026-10-14', '2026-10-11']))).toEqual([['2026-10-11', '2026-10-14']]);
  });

  it('keeps earlier days on a 3rd consecutive tap (11 → 12 → 13)', () => {
    expect(ranges(tapAll(['2026-10-11', '2026-10-12', '2026-10-13']))).toEqual([
      ['2026-10-11', '2026-10-13'],
    ]);
  });

  it('removes only the re-tapped end day (11·12, tap 12 → 11)', () => {
    expect(ranges(tapAll(['2026-10-11', '2026-10-12', '2026-10-12']))).toEqual([
      ['2026-10-11', '2026-10-11'],
    ]);
  });

  it('splits a range when a middle day is re-tapped', () => {
    expect(ranges(tapAll(['2026-10-11', '2026-10-15', '2026-10-13']))).toEqual([
      ['2026-10-11', '2026-10-12'],
      ['2026-10-14', '2026-10-15'],
    ]);
  });

  it('drops a one-day range when its only day is re-tapped', () => {
    expect(tapAll(['2026-10-11', '2026-10-12', '2026-10-12', '2026-10-11'])).toEqual(
      EMPTY_PERIOD_TAP_STATE,
    );
  });

  it('extends a range up to 7 days after its end', () => {
    expect(ranges(tapAll(['2026-10-11', '2026-10-12', '2026-10-19']))).toEqual([
      ['2026-10-11', '2026-10-19'],
    ]);
  });

  it('starts a new pending start more than 7 days after a range', () => {
    const s = tapAll(['2026-10-01', '2026-10-02', '2026-10-20']);
    expect(ranges(s)).toEqual([['2026-10-01', '2026-10-02']]);
    expect(s.pendingStart).toBe('2026-10-20');
  });

  it('extends a range backward when the day right before it is tapped', () => {
    const s = tapAll(['2026-10-12', '2026-10-13', '2026-10-11']);
    expect(ranges(s)).toEqual([['2026-10-11', '2026-10-13']]);
    expect(s.pendingStart).toBeNull();
  });

  it('keeps a tap 2+ days before a range as a pending start', () => {
    const s = tapAll(['2026-10-12', '2026-10-13', '2026-10-10']);
    expect(ranges(s)).toEqual([['2026-10-12', '2026-10-13']]);
    expect(s.pendingStart).toBe('2026-10-10');
  });
});

describe('finalizePeriodDrafts', () => {
  it('returns drafts as-is when there is no pending start', () => {
    const s = tapAll(['2026-10-11', '2026-10-13']);
    expect(finalizePeriodDrafts(s, 5)).toEqual(s.drafts);
  });

  it('fills a lone start with the average period length', () => {
    const out = finalizePeriodDrafts(tapAll(['2026-10-11']), 5);
    expect(out.map((p) => [p.startDate, p.endDate])).toEqual([['2026-10-11', '2026-10-15']]);
  });
});

describe('selectedPeriodDates', () => {
  it('is empty for the empty state', () => {
    expect(selectedPeriodDates(EMPTY_PERIOD_TAP_STATE).size).toBe(0);
  });

  it('includes every day of each range plus the pending start', () => {
    const s = tapAll(['2026-10-11', '2026-10-13', '2026-10-25']);
    expect([...selectedPeriodDates(s)].sort()).toEqual([
      '2026-10-11',
      '2026-10-12',
      '2026-10-13',
      '2026-10-25',
    ]);
  });
});
