import { beforeEach, describe, it, expect } from 'vitest';
import {
  addRange,
  compact,
  computeChanges,
  extendTo,
  findContainingDraft,
  findExtendableDraft,
  removeDay,
  toDrafts,
  type DraftPeriod,
} from './periodEdit';
import type { PeriodLog } from '@/types';

function log(id: string, startDate: string, endDate?: string): PeriodLog {
  return {
    id,
    startDate,
    ...(endDate ? { endDate } : {}),
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function draft(
  key: string,
  startDate: string,
  endDate: string,
  originalId: string | null = null,
): DraftPeriod {
  return { key, originalId, startDate, endDate };
}

let counter = 0;
const nextKey = () => `new:${++counter}`;

describe('toDrafts', () => {
  it('normalizes missing endDate to startDate', () => {
    const drafts = toDrafts([log('a', '2026-05-01'), log('b', '2026-06-01', '2026-06-05')]);
    expect(drafts).toEqual([
      { key: 'a', originalId: 'a', startDate: '2026-05-01', endDate: '2026-05-01' },
      { key: 'b', originalId: 'b', startDate: '2026-06-01', endDate: '2026-06-05' },
    ]);
  });

  it('sorts by startDate ascending', () => {
    const drafts = toDrafts([log('b', '2026-06-01', '2026-06-03'), log('a', '2026-05-01')]);
    expect(drafts.map((d) => d.key)).toEqual(['a', 'b']);
  });

  it('returns empty array for empty input', () => {
    expect(toDrafts([])).toEqual([]);
  });
});

describe('findContainingDraft', () => {
  const drafts = [draft('a', '2026-05-01', '2026-05-05', 'a')];

  it('finds a period on the start boundary', () => {
    expect(findContainingDraft(drafts, '2026-05-01')?.key).toBe('a');
  });

  it('finds a period on the end boundary', () => {
    expect(findContainingDraft(drafts, '2026-05-05')?.key).toBe('a');
  });

  it('finds a period on an interior day', () => {
    expect(findContainingDraft(drafts, '2026-05-03')?.key).toBe('a');
  });

  it('returns null when date is before the period', () => {
    expect(findContainingDraft(drafts, '2026-04-30')).toBeNull();
  });

  it('returns null when date is after the period', () => {
    expect(findContainingDraft(drafts, '2026-05-06')).toBeNull();
  });

  it('returns null when drafts list is empty', () => {
    expect(findContainingDraft([], '2026-05-03')).toBeNull();
  });
});

describe('findExtendableDraft', () => {
  const drafts = [draft('a', '2026-05-01', '2026-05-05', 'a')];

  it('picks a period whose end is within gapDays before d', () => {
    expect(findExtendableDraft(drafts, '2026-05-06', 7)?.key).toBe('a');
    expect(findExtendableDraft(drafts, '2026-05-12', 7)?.key).toBe('a');
  });

  it('excludes a period that ended more than gapDays ago', () => {
    expect(findExtendableDraft(drafts, '2026-05-13', 7)).toBeNull();
  });

  it('includes a period at exactly gapDays boundary (cutoff inclusive)', () => {
    // d='2026-05-12', gapDays=7 → cutoff='2026-05-05' → endDate='2026-05-05' >= cutoff
    expect(findExtendableDraft(drafts, '2026-05-12', 7)?.key).toBe('a');
  });

  it('excludes a period that contains d (d is inside the range)', () => {
    expect(findExtendableDraft(drafts, '2026-05-03', 7)).toBeNull();
  });

  it('returns the latest-ending period among multiple candidates', () => {
    const twoPeriods = [
      draft('a', '2026-04-01', '2026-04-05', 'a'),
      draft('b', '2026-04-20', '2026-04-25', 'b'),
    ];
    expect(findExtendableDraft(twoPeriods, '2026-04-28', 7)?.key).toBe('b');
  });

  it('returns null for empty drafts list', () => {
    expect(findExtendableDraft([], '2026-05-10', 7)).toBeNull();
  });
});

describe('compact', () => {
  it('merges touching periods and preserves originalId of first', () => {
    const drafts = [
      draft('new:1', '2026-05-06', '2026-05-09', null),
      draft('a', '2026-05-01', '2026-05-05', 'a'),
    ];
    expect(compact(drafts)).toEqual([draft('a', '2026-05-01', '2026-05-09', 'a')]);
  });

  it('merges overlapping periods', () => {
    const drafts = [
      draft('a', '2026-05-01', '2026-05-07', 'a'),
      draft('b', '2026-05-05', '2026-05-10', 'b'),
    ];
    expect(compact(drafts)).toEqual([draft('a', '2026-05-01', '2026-05-10', 'a')]);
  });

  it('keeps disjoint periods separate', () => {
    const drafts = [
      draft('a', '2026-05-01', '2026-05-05', 'a'),
      draft('b', '2026-06-01', '2026-06-05', 'b'),
    ];
    expect(compact(drafts)).toEqual([
      draft('a', '2026-05-01', '2026-05-05', 'a'),
      draft('b', '2026-06-01', '2026-06-05', 'b'),
    ]);
  });

  it('returns single period unchanged', () => {
    const drafts = [draft('a', '2026-05-01', '2026-05-05', 'a')];
    expect(compact(drafts)).toEqual([draft('a', '2026-05-01', '2026-05-05', 'a')]);
  });

  it('promotes originalId from later draft when first draft has none', () => {
    // first sorted draft has no originalId; second does — originalId should be adopted
    const drafts = [
      draft('new:1', '2026-05-01', '2026-05-03', null),
      draft('b', '2026-05-04', '2026-05-06', 'b'),
    ];
    const result = compact(drafts);
    expect(result.length).toBe(1);
    expect(result[0].originalId).toBe('b');
  });
});

describe('removeDay', () => {
  beforeEach(() => {
    counter = 0;
  });

  it('shrinks left when removing the start date', () => {
    const drafts = [draft('a', '2026-05-01', '2026-05-05', 'a')];
    const result = removeDay(drafts, 'a', '2026-05-01', nextKey);
    expect(result).toEqual([draft('a', '2026-05-02', '2026-05-05', 'a')]);
  });

  it('shrinks right when removing the end date', () => {
    const drafts = [draft('a', '2026-05-01', '2026-05-05', 'a')];
    const result = removeDay(drafts, 'a', '2026-05-05', nextKey);
    expect(result).toEqual([draft('a', '2026-05-01', '2026-05-04', 'a')]);
  });

  it('splits into two when removing a middle date', () => {
    const drafts = [draft('a', '2026-05-01', '2026-05-05', 'a')];
    const result = removeDay(drafts, 'a', '2026-05-03', nextKey);
    expect(result).toEqual([
      draft('a', '2026-05-01', '2026-05-02', 'a'),
      draft('new:1', '2026-05-04', '2026-05-05', null),
    ]);
  });

  it('removes the period entirely when it is a single-day range', () => {
    const drafts = [draft('a', '2026-05-01', '2026-05-01', 'a')];
    const result = removeDay(drafts, 'a', '2026-05-01', nextKey);
    expect(result).toEqual([]);
  });

  it('passes through all drafts unchanged when targetKey not found', () => {
    const drafts = [draft('a', '2026-05-01', '2026-05-05', 'a')];
    const result = removeDay(drafts, 'z', '2026-05-03', nextKey);
    expect(result).toEqual(drafts);
  });

  it('passes through a draft unchanged when date is outside its range', () => {
    const drafts = [draft('a', '2026-05-01', '2026-05-05', 'a')];
    const result = removeDay(drafts, 'a', '2026-05-10', nextKey);
    expect(result).toEqual(drafts);
  });

  it('only removes the matching draft and preserves others', () => {
    const drafts = [
      draft('a', '2026-05-01', '2026-05-05', 'a'),
      draft('b', '2026-06-01', '2026-06-05', 'b'),
    ];
    const result = removeDay(drafts, 'a', '2026-05-01', nextKey);
    expect(result).toEqual([
      draft('a', '2026-05-02', '2026-05-05', 'a'),
      draft('b', '2026-06-01', '2026-06-05', 'b'),
    ]);
  });
});

describe('extendTo', () => {
  it('extends endDate forward', () => {
    const drafts = [draft('a', '2026-05-01', '2026-05-05', 'a')];
    const result = extendTo(drafts, 'a', '2026-05-08');
    expect(result).toEqual([draft('a', '2026-05-01', '2026-05-08', 'a')]);
  });

  it('does nothing when d is before current endDate', () => {
    const drafts = [draft('a', '2026-05-01', '2026-05-05', 'a')];
    expect(extendTo(drafts, 'a', '2026-05-04')).toEqual(drafts);
  });

  it('does nothing when d equals current endDate (no change)', () => {
    const drafts = [draft('a', '2026-05-01', '2026-05-05', 'a')];
    expect(extendTo(drafts, 'a', '2026-05-05')).toEqual(drafts);
  });

  it('does nothing when targetKey is not found', () => {
    const drafts = [draft('a', '2026-05-01', '2026-05-05', 'a')];
    expect(extendTo(drafts, 'z', '2026-05-10')).toEqual(drafts);
  });

  it('merges with an adjacent later period when extending into it', () => {
    const drafts = [
      draft('a', '2026-05-01', '2026-05-05', 'a'),
      draft('b', '2026-05-09', '2026-05-11', 'b'),
    ];
    const result = extendTo(drafts, 'a', '2026-05-10');
    expect(result).toEqual([draft('a', '2026-05-01', '2026-05-11', 'a')]);
  });
});

describe('addRange', () => {
  it('adds a disjoint new range to existing drafts', () => {
    const drafts = [draft('a', '2026-05-01', '2026-05-05', 'a')];
    const result = addRange(drafts, '2026-06-01', '2026-06-03', 'new:1');
    expect(result).toEqual([
      draft('a', '2026-05-01', '2026-05-05', 'a'),
      draft('new:1', '2026-06-01', '2026-06-03', null),
    ]);
  });

  it('normalizes swapped start/end so lo <= hi', () => {
    const result = addRange([], '2026-06-03', '2026-06-01', 'new:1');
    expect(result).toEqual([draft('new:1', '2026-06-01', '2026-06-03', null)]);
  });

  it('merges into existing period when new range touches its end', () => {
    const drafts = [draft('a', '2026-05-01', '2026-05-05', 'a')];
    const result = addRange(drafts, '2026-05-06', '2026-05-09', 'new:1');
    expect(result).toEqual([draft('a', '2026-05-01', '2026-05-09', 'a')]);
  });

  it('merges into existing period when new range overlaps it', () => {
    const drafts = [draft('a', '2026-05-01', '2026-05-05', 'a')];
    const result = addRange(drafts, '2026-05-03', '2026-05-09', 'new:1');
    expect(result).toEqual([draft('a', '2026-05-01', '2026-05-09', 'a')]);
  });

  it('adds a single-day range to empty drafts', () => {
    const result = addRange([], '2026-05-15', '2026-05-15', 'new:1');
    expect(result).toEqual([draft('new:1', '2026-05-15', '2026-05-15', null)]);
  });
});

describe('computeChanges', () => {
  it('returns empty array when working state matches original', () => {
    const original = [log('a', '2026-05-01', '2026-05-05')];
    const working = toDrafts(original);
    expect(computeChanges(original, working)).toEqual([]);
  });

  it('detects add for a draft with no originalId', () => {
    const changes = computeChanges(
      [],
      [draft('new:1', '2026-05-01', '2026-05-03', null)],
    );
    expect(changes).toEqual([{ kind: 'add', startDate: '2026-05-01', endDate: '2026-05-03' }]);
  });

  it('detects remove when an original record is absent from working', () => {
    const original = [log('a', '2026-05-01', '2026-05-03')];
    const changes = computeChanges(original, []);
    expect(changes).toEqual([{ kind: 'remove', id: 'a' }]);
  });

  it('detects update when endDate changed', () => {
    const original = [log('a', '2026-05-01', '2026-05-05')];
    const working = [draft('a', '2026-05-01', '2026-05-07', 'a')];
    expect(computeChanges(original, working)).toEqual([
      { kind: 'update', id: 'a', startDate: '2026-05-01', endDate: '2026-05-07' },
    ]);
  });

  it('detects update when startDate changed', () => {
    const original = [log('a', '2026-05-01', '2026-05-05')];
    const working = [draft('a', '2026-04-29', '2026-05-05', 'a')];
    expect(computeChanges(original, working)).toEqual([
      { kind: 'update', id: 'a', startDate: '2026-04-29', endDate: '2026-05-05' },
    ]);
  });

  it('detects split as update + add', () => {
    const original = [log('a', '2026-05-01', '2026-05-05')];
    const working = [
      draft('a', '2026-05-01', '2026-05-02', 'a'),
      draft('new:1', '2026-05-04', '2026-05-05', null),
    ];
    expect(computeChanges(original, working)).toEqual([
      { kind: 'update', id: 'a', startDate: '2026-05-01', endDate: '2026-05-02' },
      { kind: 'add', startDate: '2026-05-04', endDate: '2026-05-05' },
    ]);
  });

  it('handles mixed add/update/remove in one call', () => {
    const original = [
      log('a', '2026-04-01', '2026-04-05'),
      log('b', '2026-05-01', '2026-05-05'),
    ];
    const working = [
      draft('a', '2026-04-01', '2026-04-07', 'a'),   // update
      draft('new:1', '2026-06-01', '2026-06-03', null), // add
      // 'b' is absent → remove
    ];
    expect(computeChanges(original, working)).toEqual([
      { kind: 'update', id: 'a', startDate: '2026-04-01', endDate: '2026-04-07' },
      { kind: 'add', startDate: '2026-06-01', endDate: '2026-06-03' },
      { kind: 'remove', id: 'b' },
    ]);
  });

  it('treats a PeriodLog with no endDate as a single-day record for change detection', () => {
    const original = [log('a', '2026-05-01')]; // no endDate
    const working = [draft('a', '2026-05-01', '2026-05-01', 'a')];
    expect(computeChanges(original, working)).toEqual([]);
  });
});
