import { describe, it, expect } from 'vitest';
import { predictFertileWindow } from './fertile';

describe('predictFertileWindow', () => {
  it('returns null when nextPeriodDate is null', () => {
    expect(predictFertileWindow(null, 'medium')).toBeNull();
  });

  it('returns null when prediction confidence is unknown', () => {
    expect(predictFertileWindow('2026-08-01', 'unknown')).toBeNull();
  });

  it('centers the window on ovulation (nextPeriod - 14) with -5 / +1 offsets', () => {
    // nextPeriod = 2026-08-15 → ovulation = 2026-08-01 → window = 2026-07-27..2026-08-02
    const w = predictFertileWindow('2026-08-15', 'medium');
    expect(w).toEqual({ start: '2026-07-27', end: '2026-08-02', confidence: 'medium' });
  });

  it('passes through the source prediction confidence', () => {
    expect(predictFertileWindow('2026-08-15', 'high')?.confidence).toBe('high');
    expect(predictFertileWindow('2026-08-15', 'low')?.confidence).toBe('low');
  });

  it('produces a 7-day inclusive window (5 pre + ovulation + 1 post)', () => {
    const w = predictFertileWindow('2026-08-15', 'medium')!;
    // day count = end - start + 1
    const start = new Date(w.start).getTime();
    const end = new Date(w.end).getTime();
    const days = Math.round((end - start) / 86400000) + 1;
    expect(days).toBe(7);
  });
});
