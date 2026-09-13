import { describe, it, expect } from 'vitest';
import type { EventLog } from '@/types/eventLog';
import { layoutWeekSegments, type WeekCellLike } from './weekLanes';

function makeEvent(
  id: string,
  startDate: string,
  endDate: string,
  createdAt = '2026-01-01T00:00:00.000Z',
): EventLog {
  return {
    id,
    startDate,
    endDate,
    title: 'Event',
    memo: '',
    categoryId: 'cat-1',
    hasPeriodMark: false,
    createdAt,
    updatedAt: createdAt,
  };
}

function cell(date: string, inCurrentMonth = true): WeekCellLike {
  return { date, inCurrentMonth };
}

// A plain Sun-Sat row, all cells in the current month.
const baseRow: WeekCellLike[] = [
  cell('2026-03-01'),
  cell('2026-03-02'),
  cell('2026-03-03'),
  cell('2026-03-04'),
  cell('2026-03-05'),
  cell('2026-03-06'),
  cell('2026-03-07'),
];

describe('layoutWeekSegments', () => {
  it('returns an empty array when cells is empty', () => {
    const events = [makeEvent('a', '2026-03-01', '2026-03-05')];
    expect(layoutWeekSegments(events, [])).toEqual([]);
  });

  it('returns an empty array when events is empty', () => {
    expect(layoutWeekSegments([], baseRow)).toEqual([]);
  });

  it('lays out a single-day event on its own column with no continuation flags', () => {
    const e = makeEvent('a', '2026-03-03', '2026-03-03');
    const result = layoutWeekSegments([e], baseRow);
    expect(result).toEqual([
      {
        event: e,
        lane: 0,
        startCol: 2,
        endCol: 2,
        continuesBefore: false,
        continuesAfter: false,
      },
    ]);
  });

  it('lays out a multi-day event fully inside the row as one continuous bar', () => {
    const e = makeEvent('a', '2026-03-02', '2026-03-05');
    const result = layoutWeekSegments([e], baseRow);
    expect(result).toEqual([
      {
        event: e,
        lane: 0,
        startCol: 1,
        endCol: 4,
        continuesBefore: false,
        continuesAfter: false,
      },
    ]);
  });

  it('clips an event that starts before the row and sets continuesBefore', () => {
    const e = makeEvent('a', '2026-02-25', '2026-03-03');
    const result = layoutWeekSegments([e], baseRow);
    expect(result).toEqual([
      {
        event: e,
        lane: 0,
        startCol: 0,
        endCol: 2,
        continuesBefore: true,
        continuesAfter: false,
      },
    ]);
  });

  it('clips an event that ends after the row and sets continuesAfter', () => {
    const e = makeEvent('a', '2026-03-05', '2026-03-12');
    const result = layoutWeekSegments([e], baseRow);
    expect(result).toEqual([
      {
        event: e,
        lane: 0,
        startCol: 4,
        endCol: 6,
        continuesBefore: false,
        continuesAfter: true,
      },
    ]);
  });

  it('omits an event that only touches out-of-month cells', () => {
    const rowWithLeadingOutOfMonth: WeekCellLike[] = [
      cell('2026-02-27', false),
      cell('2026-02-28', false),
      cell('2026-03-01'),
      cell('2026-03-02'),
      cell('2026-03-03'),
      cell('2026-03-04'),
      cell('2026-03-05'),
    ];
    const e = makeEvent('a', '2026-02-27', '2026-02-28');
    expect(layoutWeekSegments([e], rowWithLeadingOutOfMonth)).toEqual([]);
  });

  it('clips the visible span to in-month cells when the event bleeds into a leading out-of-month cell', () => {
    const rowWithLeadingOutOfMonth: WeekCellLike[] = [
      cell('2026-02-27', false),
      cell('2026-02-28', false),
      cell('2026-03-01'),
      cell('2026-03-02'),
      cell('2026-03-03'),
      cell('2026-03-04'),
      cell('2026-03-05'),
    ];
    const e = makeEvent('a', '2026-02-27', '2026-03-02');
    const result = layoutWeekSegments([e], rowWithLeadingOutOfMonth);
    expect(result).toEqual([
      {
        event: e,
        lane: 0,
        startCol: 2,
        endCol: 3,
        continuesBefore: true,
        continuesAfter: false,
      },
    ]);
  });

  it('clips the visible span to in-month cells when the event bleeds into a trailing out-of-month cell', () => {
    const rowWithTrailingOutOfMonth: WeekCellLike[] = [
      cell('2026-03-01'),
      cell('2026-03-02'),
      cell('2026-03-03'),
      cell('2026-03-04'),
      cell('2026-03-05'),
      cell('2026-03-06', false),
      cell('2026-03-07', false),
    ];
    const e = makeEvent('a', '2026-03-05', '2026-03-09');
    const result = layoutWeekSegments([e], rowWithTrailingOutOfMonth);
    expect(result).toEqual([
      {
        event: e,
        lane: 0,
        startCol: 4,
        endCol: 4,
        continuesBefore: false,
        continuesAfter: true,
      },
    ]);
  });

  it('assigns overlapping events to lanes 0 and 1', () => {
    const a = makeEvent('a', '2026-03-01', '2026-03-03');
    const b = makeEvent('b', '2026-03-02', '2026-03-04');
    const result = layoutWeekSegments([a, b], baseRow);
    expect(result.map((s) => ({ id: s.event.id, lane: s.lane }))).toEqual([
      { id: 'a', lane: 0 },
      { id: 'b', lane: 1 },
    ]);
  });

  it('keeps non-overlapping events on the same lane 0', () => {
    const a = makeEvent('a', '2026-03-01', '2026-03-02');
    const b = makeEvent('b', '2026-03-04', '2026-03-05');
    const result = layoutWeekSegments([a, b], baseRow);
    expect(result.map((s) => ({ id: s.event.id, lane: s.lane }))).toEqual([
      { id: 'a', lane: 0 },
      { id: 'b', lane: 0 },
    ]);
  });

  it('bumps an event to lane 1 when it overlaps lane 0 on only one shared column', () => {
    const a = makeEvent('a', '2026-03-01', '2026-03-05');
    const b = makeEvent('b', '2026-03-05', '2026-03-06');
    const result = layoutWeekSegments([a, b], baseRow);
    expect(result.map((s) => ({ id: s.event.id, lane: s.lane }))).toEqual([
      { id: 'a', lane: 0 },
      { id: 'b', lane: 1 },
    ]);
  });

  it('drops the 4th fully-overlapping event when it exceeds the default maxLanes (MAX_BADGES_PER_DAY)', () => {
    const events = [
      makeEvent('1', '2026-03-01', '2026-03-01'),
      makeEvent('2', '2026-03-01', '2026-03-01'),
      makeEvent('3', '2026-03-01', '2026-03-01'),
      makeEvent('4', '2026-03-01', '2026-03-01'),
    ];
    const result = layoutWeekSegments(events, baseRow);
    expect(result.map((s) => ({ id: s.event.id, lane: s.lane }))).toEqual([
      { id: '1', lane: 0 },
      { id: '2', lane: 1 },
      { id: '3', lane: 2 },
    ]);
  });

  it('respects an explicit maxLanes override', () => {
    const events = [
      makeEvent('1', '2026-03-01', '2026-03-01'),
      makeEvent('2', '2026-03-01', '2026-03-01'),
    ];
    const result = layoutWeekSegments(events, baseRow, 1);
    expect(result.map((s) => ({ id: s.event.id, lane: s.lane }))).toEqual([
      { id: '1', lane: 0 },
    ]);
  });

  it('sorts overlapping events with the same startDate longest-first', () => {
    const short = makeEvent('short', '2026-03-01', '2026-03-02');
    const long = makeEvent('long', '2026-03-01', '2026-03-04');
    // Input order is short-then-long; sort should still put the longer one first.
    const result = layoutWeekSegments([short, long], baseRow);
    expect(result.map((s) => ({ id: s.event.id, lane: s.lane }))).toEqual([
      { id: 'long', lane: 0 },
      { id: 'short', lane: 1 },
    ]);
  });

  it('breaks a same-range tie by earlier createdAt first', () => {
    const later = makeEvent('later', '2026-03-01', '2026-03-03', '2026-01-02T00:00:00.000Z');
    const earlier = makeEvent('earlier', '2026-03-01', '2026-03-03', '2026-01-01T00:00:00.000Z');
    // Input order is later-then-earlier; sort should still put the earlier createdAt first.
    const result = layoutWeekSegments([later, earlier], baseRow);
    expect(result.map((s) => ({ id: s.event.id, lane: s.lane }))).toEqual([
      { id: 'earlier', lane: 0 },
      { id: 'later', lane: 1 },
    ]);
  });

  it('breaks a same-range, same-createdAt tie by smaller id first', () => {
    const b = makeEvent('b', '2026-03-01', '2026-03-03');
    const a = makeEvent('a', '2026-03-01', '2026-03-03');
    // Input order is b-then-a; sort should still put id 'a' first.
    const result = layoutWeekSegments([b, a], baseRow);
    expect(result.map((s) => ({ id: s.event.id, lane: s.lane }))).toEqual([
      { id: 'a', lane: 0 },
      { id: 'b', lane: 1 },
    ]);
  });
});
