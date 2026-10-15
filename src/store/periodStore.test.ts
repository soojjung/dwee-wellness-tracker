// Mutation results for periodStore (R7-11): a failed write is returned to the
// caller and reported, never written into `error` (the load-failure state
// HomeScreen turns into a full-page error).
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PeriodLog } from '@/types';

vi.mock('@/data', () => ({
  periodRepo: {
    list: vi.fn(async () => []),
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(async () => {}),
  },
  ensureMigrations: vi.fn(async () => {}),
}));
vi.mock('@/lib/monitoring/sentry', () => ({ captureException: vi.fn() }));

import { periodRepo } from '@/data';
import { captureException } from '@/lib/monitoring/sentry';
import { usePeriodStore } from './periodStore';

const initialState = usePeriodStore.getState();

function log(id: string, startDate: string, endDate: string | null): PeriodLog {
  return { id, startDate, endDate, createdAt: '2026-10-01T00:00:00.000Z' } as PeriodLog;
}

beforeEach(() => {
  vi.clearAllMocks();
  usePeriodStore.setState(initialState, true);
});

describe('add', () => {
  it('returns the new log and keeps error null on success', async () => {
    vi.mocked(periodRepo.add).mockResolvedValueOnce(log('a', '2026-09-30', '2026-10-04'));
    const out = await usePeriodStore.getState().add({ startDate: '2026-09-30', endDate: '2026-10-04' });
    expect(out?.id).toBe('a');
    expect(usePeriodStore.getState().periods.map((p) => p.id)).toEqual(['a']);
    expect(usePeriodStore.getState().error).toBeNull();
  });

  it('returns null, reports, and leaves error untouched when the write fails', async () => {
    vi.mocked(periodRepo.add).mockRejectedValueOnce(new Error('offline'));
    const out = await usePeriodStore.getState().add({ startDate: '2026-09-30', endDate: '2026-10-04' });
    expect(out).toBeNull();
    expect(usePeriodStore.getState().error).toBeNull();
    expect(usePeriodStore.getState().periods).toEqual([]);
    expect(captureException).toHaveBeenCalledWith(expect.any(Error), { tags: { period_op: 'add' } });
  });

  it('returns null without writing for an invalid date', async () => {
    const out = await usePeriodStore.getState().add({ startDate: '2026-13-40' });
    expect(out).toBeNull();
    expect(periodRepo.add).not.toHaveBeenCalled();
    expect(usePeriodStore.getState().error).toBeNull();
  });
});

describe('update', () => {
  it('returns true and applies the patch on success', async () => {
    usePeriodStore.setState({ periods: [log('a', '2026-09-01', '2026-09-03')] });
    vi.mocked(periodRepo.update).mockResolvedValueOnce(log('a', '2026-09-01', '2026-09-05'));
    expect(await usePeriodStore.getState().update('a', { endDate: '2026-09-05' })).toBe(true);
    expect(usePeriodStore.getState().periods[0]?.endDate).toBe('2026-09-05');
  });

  it('returns false and reports when the write fails', async () => {
    usePeriodStore.setState({ periods: [log('a', '2026-09-01', '2026-09-03')] });
    vi.mocked(periodRepo.update).mockRejectedValueOnce(new Error('offline'));
    expect(await usePeriodStore.getState().update('a', { endDate: '2026-09-05' })).toBe(false);
    expect(usePeriodStore.getState().periods[0]?.endDate).toBe('2026-09-03');
    expect(usePeriodStore.getState().error).toBeNull();
    expect(captureException).toHaveBeenCalledWith(expect.any(Error), { tags: { period_op: 'update' } });
  });
});

describe('remove', () => {
  it('returns false, keeps the record, and reports when the write fails', async () => {
    usePeriodStore.setState({ periods: [log('a', '2026-09-01', '2026-09-03')] });
    vi.mocked(periodRepo.remove).mockRejectedValueOnce(new Error('offline'));
    expect(await usePeriodStore.getState().remove('a')).toBe(false);
    expect(usePeriodStore.getState().periods).toHaveLength(1);
    expect(usePeriodStore.getState().error).toBeNull();
    expect(captureException).toHaveBeenCalledWith(expect.any(Error), { tags: { period_op: 'remove' } });
  });
});
