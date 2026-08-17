import { describe, it, expect } from 'vitest';
import {
  niceScale,
  clampOverlayX,
  CYCLE_HARD_MIN,
  CYCLE_HARD_MAX,
} from './chartScale';

describe('niceScale', () => {
  describe('single data point', () => {
    it('widens the range by 1 above the equal point (typical case)', () => {
      const { yMin, yMax, tickStepValue } = niceScale(28, 28);
      // dataMin === dataMax triggers the +1 nudge on rawMax; padding by
      // ±2 typically happens at the call site, so here we exercise the
      // internal widen only.
      expect(yMax).toBeGreaterThanOrEqual(yMin + 1);
      expect(tickStepValue).toBe(1);
    });

    it('single point at HARD_MIN keeps the axis clamped to 15', () => {
      const { yMin } = niceScale(CYCLE_HARD_MIN, CYCLE_HARD_MIN);
      expect(yMin).toBe(CYCLE_HARD_MIN);
    });

    it('single point at HARD_MAX keeps the axis clamped to 60', () => {
      const { yMax } = niceScale(CYCLE_HARD_MAX, CYCLE_HARD_MAX);
      expect(yMax).toBe(CYCLE_HARD_MAX);
    });
  });

  describe('padded ranges (typical caller behaviour)', () => {
    it('picks step=1 for a range small enough to fit at unit ticks', () => {
      // span=5 → 6 ticks at step=1, within the 7-tick budget.
      const { yMin, yMax, tickStepValue } = niceScale(25, 30);
      expect(tickStepValue).toBe(1);
      expect(yMin).toBe(25);
      expect(yMax).toBe(30);
    });

    it('picks step=2 when step=1 would produce more than 7 ticks', () => {
      // span=10 → 11 ticks at step=1 (too many) → step=2 gives 6 ticks.
      const { yMin, yMax, tickStepValue } = niceScale(20, 30);
      expect(tickStepValue).toBe(2);
      const ticks = (yMax - yMin) / tickStepValue + 1;
      expect(ticks).toBeLessThanOrEqual(7);
    });

    it('picks step=5 for wide ranges (20–40)', () => {
      const { yMin, yMax, tickStepValue } = niceScale(18, 42);
      expect(tickStepValue).toBe(5);
      expect(yMin % 5).toBe(0);
      expect(yMax % 5).toBe(0);
      const ticks = (yMax - yMin) / tickStepValue + 1;
      expect(ticks).toBeLessThanOrEqual(7);
    });

    it('picks step=10 when nothing else fits', () => {
      // A pathological range that only step=10 can hold in ≤7 ticks.
      const { tickStepValue } = niceScale(20, 55);
      expect(tickStepValue).toBe(10);
    });
  });

  describe('boundary clamping', () => {
    it('clamps values below HARD_MIN to 15', () => {
      const { yMin } = niceScale(-5, 20);
      expect(yMin).toBeGreaterThanOrEqual(CYCLE_HARD_MIN);
    });

    it('clamps values above HARD_MAX to 60', () => {
      const { yMax } = niceScale(50, 99);
      expect(yMax).toBeLessThanOrEqual(CYCLE_HARD_MAX);
    });

    it('never returns a negative yMin', () => {
      const { yMin } = niceScale(-100, 10);
      expect(yMin).toBeGreaterThanOrEqual(0);
    });
  });

  describe('degenerate inputs', () => {
    it('handles inverted min/max without throwing', () => {
      // Caller passes (dataMax, dataMin) by mistake — should still return
      // finite numbers rather than crash the render.
      expect(() => niceScale(40, 20)).not.toThrow();
    });

    it('handles fractional values by rounding outward', () => {
      const { yMin, yMax } = niceScale(25.7, 28.3);
      expect(yMin).toBeLessThanOrEqual(25.7);
      expect(yMax).toBeGreaterThanOrEqual(28.3);
    });
  });

  describe('tick count invariant', () => {
    it('always returns at most 7 ticks for any valid range', () => {
      const pairs: Array<[number, number]> = [
        [15, 15],
        [20, 30],
        [15, 60],
        [25, 32],
        [40, 45],
      ];
      for (const [a, b] of pairs) {
        const { yMin, yMax, tickStepValue } = niceScale(a, b);
        const ticks = (yMax - yMin) / tickStepValue + 1;
        expect(ticks).toBeLessThanOrEqual(7);
      }
    });
  });
});

describe('clampOverlayX', () => {
  it('leaves the pill centered when it fits comfortably in the middle', () => {
    expect(clampOverlayX(150, 0, 300, 30)).toBe(150);
  });

  it('pushes the pill inward from the left boundary', () => {
    expect(clampOverlayX(5, 0, 300, 30)).toBe(30);
  });

  it('pushes the pill inward from the right boundary', () => {
    expect(clampOverlayX(295, 0, 300, 30)).toBe(270);
  });

  it('handles the single-data-point-at-far-right regression', () => {
    // Reproduces the "평균28일" vertical-stack bug: single point at the
    // last month, pill centered there → clamp to keep it fully inside.
    const gridXStart = 25;
    const gridXEnd = 324;
    const clamped = clampOverlayX(gridXEnd, gridXStart, gridXEnd, 30);
    expect(clamped).toBe(gridXEnd - 30);
    expect(clamped).toBeLessThan(gridXEnd);
  });

  it('falls back to the midpoint when the plot is narrower than the pill', () => {
    // safeMin (0+50) > safeMax (100-50) — no valid position, so we pick
    // the mid so at least the pill sits somewhere reasonable.
    expect(clampOverlayX(80, 0, 100, 50)).toBe(50);
  });

  it('is idempotent for already-clamped inputs', () => {
    const once = clampOverlayX(10, 0, 300, 30);
    const twice = clampOverlayX(once, 0, 300, 30);
    expect(twice).toBe(once);
  });

  it('respects zero half-width (degenerate pill)', () => {
    expect(clampOverlayX(50, 0, 100, 0)).toBe(50);
    expect(clampOverlayX(-10, 0, 100, 0)).toBe(0);
    expect(clampOverlayX(200, 0, 100, 0)).toBe(100);
  });
});
