import { describe, it, expect } from 'vitest';
import {
  defaultPeriodEndDate,
  evaluateNewStart,
  reconcileForNewStart,
  SHORT_CYCLE_THRESHOLD_DAYS,
} from './recordPolicy';
import type { PeriodLog } from '@/types';

function log(id: string, startDate: string, endDate?: string): PeriodLog {
  return {
    id,
    startDate,
    ...(endDate ? { endDate } : {}),
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('reconcileForNewStart', () => {
  it('returns existingMatch when same startDate already exists (idempotent)', () => {
    const existing = [log('a', '2026-02-01', '2026-02-05')];
    const result = reconcileForNewStart(existing, '2026-02-01');
    expect(result.existingMatch).toBe(existing[0]);
    expect(result.closeUpdates).toEqual([]);
  });

  it('returns existingMatch even if existing is still open (no double-add)', () => {
    const existing = [log('a', '2026-02-01')];
    const result = reconcileForNewStart(existing, '2026-02-01');
    expect(result.existingMatch).toBe(existing[0]);
    expect(result.closeUpdates).toEqual([]);
  });

  it('closes a single open record with endDate = newStart - 1 day', () => {
    const existing = [log('a', '2026-02-01')];
    const result = reconcileForNewStart(existing, '2026-03-01');
    expect(result.existingMatch).toBeNull();
    expect(result.closeUpdates).toEqual([{ id: 'a', endDate: '2026-02-28' }]);
  });

  it('closes all open records that start before the new startDate', () => {
    const existing = [
      log('a', '2026-01-15'),
      log('b', '2026-02-10'),
    ];
    const result = reconcileForNewStart(existing, '2026-03-01');
    expect(result.existingMatch).toBeNull();
    expect(result.closeUpdates).toEqual([
      { id: 'a', endDate: '2026-02-28' },
      { id: 'b', endDate: '2026-02-28' },
    ]);
  });

  it('does not touch open records whose startDate is after the new startDate', () => {
    const existing = [
      log('past-open', '2026-01-15'),
      log('future-open', '2026-04-01'),
    ];
    const result = reconcileForNewStart(existing, '2026-03-01');
    expect(result.existingMatch).toBeNull();
    expect(result.closeUpdates).toEqual([
      { id: 'past-open', endDate: '2026-02-28' },
    ]);
  });

  it('skips already-closed records', () => {
    const existing = [
      log('closed', '2026-01-01', '2026-01-06'),
      log('open', '2026-02-01'),
    ];
    const result = reconcileForNewStart(existing, '2026-03-01');
    expect(result.existingMatch).toBeNull();
    expect(result.closeUpdates).toEqual([
      { id: 'open', endDate: '2026-02-28' },
    ]);
  });

  it('returns no closeUpdates when existingMatch is found, even with other open records', () => {
    const existing = [
      log('other-open', '2026-01-15'),
      log('match', '2026-03-01'),
    ];
    const result = reconcileForNewStart(existing, '2026-03-01');
    expect(result.existingMatch?.id).toBe('match');
    expect(result.closeUpdates).toEqual([]);
  });

  it('handles month boundary correctly for endDate calculation', () => {
    const existing = [log('a', '2026-05-15')];
    const result = reconcileForNewStart(existing, '2026-06-01');
    expect(result.closeUpdates).toEqual([{ id: 'a', endDate: '2026-05-31' }]);
  });

  it('handles year boundary correctly', () => {
    const existing = [log('a', '2025-12-20')];
    const result = reconcileForNewStart(existing, '2026-01-05');
    expect(result.closeUpdates).toEqual([{ id: 'a', endDate: '2026-01-04' }]);
  });

  it('returns empty closeUpdates on empty input', () => {
    const result = reconcileForNewStart([], '2026-03-01');
    expect(result.existingMatch).toBeNull();
    expect(result.closeUpdates).toEqual([]);
  });
});

describe('defaultPeriodEndDate', () => {
  it('returns startDate + 4 days for the default 5-day length', () => {
    expect(defaultPeriodEndDate('2026-02-01', 5)).toBe('2026-02-05');
  });

  it('handles a 3-day length', () => {
    expect(defaultPeriodEndDate('2026-02-01', 3)).toBe('2026-02-03');
  });

  it('handles a 1-day length (same day)', () => {
    expect(defaultPeriodEndDate('2026-02-01', 1)).toBe('2026-02-01');
  });

  it('crosses month boundary correctly', () => {
    expect(defaultPeriodEndDate('2026-01-29', 5)).toBe('2026-02-02');
  });

  it('crosses year boundary correctly', () => {
    expect(defaultPeriodEndDate('2025-12-30', 5)).toBe('2026-01-03');
  });
});

describe('evaluateNewStart', () => {
  it('returns idempotent when the same startDate already exists', () => {
    const existing = [log('a', '2026-06-10', '2026-06-14')];
    const result = evaluateNewStart(existing, '2026-06-10');
    expect(result.kind).toBe('idempotent');
    if (result.kind === 'idempotent') expect(result.match.id).toBe('a');
  });

  it('returns ok when there is no prior period', () => {
    expect(evaluateNewStart([], '2026-06-10').kind).toBe('ok');
  });

  it('flags shortGap when the gap is under the threshold (14 days)', () => {
    const existing = [log('a', '2026-06-02', '2026-06-06')];
    const result = evaluateNewStart(existing, '2026-06-15');
    expect(result.kind).toBe('shortGap');
    if (result.kind === 'shortGap') {
      expect(result.priorPeriod.id).toBe('a');
      expect(result.daysSincePrior).toBe(13);
    }
  });

  it('flags shortGap for the user scenario (6/10 then 6/16 → 6 days)', () => {
    const existing = [log('a', '2026-06-10', '2026-06-14')];
    const result = evaluateNewStart(existing, '2026-06-16');
    expect(result.kind).toBe('shortGap');
    if (result.kind === 'shortGap') expect(result.daysSincePrior).toBe(6);
  });

  it('returns ok when the gap is exactly the threshold (15 days)', () => {
    const existing = [log('a', '2026-06-01')];
    const result = evaluateNewStart(existing, '2026-06-16');
    expect(result.kind).toBe('ok');
  });

  it('compares against the nearest prior, not the earliest', () => {
    const existing = [
      log('old', '2026-05-01', '2026-05-05'),
      log('recent', '2026-06-10', '2026-06-14'),
    ];
    const result = evaluateNewStart(existing, '2026-06-16');
    expect(result.kind).toBe('shortGap');
    if (result.kind === 'shortGap') {
      expect(result.priorPeriod.id).toBe('recent');
      expect(result.daysSincePrior).toBe(6);
    }
  });

  it('ignores future records when looking for prior', () => {
    const existing = [
      log('future', '2026-08-01'),
      log('prior', '2026-06-01', '2026-06-05'),
    ];
    const result = evaluateNewStart(existing, '2026-06-20');
    expect(result.kind).toBe('ok');
  });

  it('keeps the threshold in sync with the aggregate outlier rule', () => {
    expect(SHORT_CYCLE_THRESHOLD_DAYS).toBe(15);
  });
});
