import { describe, it, expect } from 'vitest';
import { CYCLE_GAP_MIN_DAYS, CYCLE_GAP_MAX_DAYS, isCountableCycleGap } from './cycleGap';

describe('cycleGap', () => {
  it('exports CYCLE_GAP_MIN_DAYS = 15', () => {
    expect(CYCLE_GAP_MIN_DAYS).toBe(15);
  });

  it('exports CYCLE_GAP_MAX_DAYS = 60', () => {
    expect(CYCLE_GAP_MAX_DAYS).toBe(60);
  });

  describe('isCountableCycleGap', () => {
    it('returns false for gaps below CYCLE_GAP_MIN_DAYS', () => {
      expect(isCountableCycleGap(14)).toBe(false);
      expect(isCountableCycleGap(1)).toBe(false);
      expect(isCountableCycleGap(0)).toBe(false);
    });

    it('returns true for gaps at CYCLE_GAP_MIN_DAYS boundary', () => {
      expect(isCountableCycleGap(15)).toBe(true);
    });

    it('returns true for gaps within valid range 15~60', () => {
      expect(isCountableCycleGap(28)).toBe(true);
      expect(isCountableCycleGap(30)).toBe(true);
      expect(isCountableCycleGap(35)).toBe(true);
    });

    it('returns true for gaps at CYCLE_GAP_MAX_DAYS boundary', () => {
      expect(isCountableCycleGap(60)).toBe(true);
    });

    it('returns false for gaps above CYCLE_GAP_MAX_DAYS', () => {
      expect(isCountableCycleGap(61)).toBe(false);
      expect(isCountableCycleGap(67)).toBe(false);
      expect(isCountableCycleGap(90)).toBe(false);
    });
  });
});
