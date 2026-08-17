/**
 * Pure helpers for the cycle chart's y-axis scaling and axis geometry.
 * Extracted from `CycleChart.tsx` so the tick-picking logic can be tested
 * against boundary values (single data point, out-of-band ranges, wide
 * spans that need coarser steps, etc.).
 */

const MAX_TICKS = 7;
export const CYCLE_HARD_MIN = 15;
export const CYCLE_HARD_MAX = 60;

export interface NiceScaleResult {
  yMin: number;
  yMax: number;
  tickStepValue: number;
}

/**
 * Picks a nice step size (1 → 2 → 5 → 10) so the data range fits in at
 * most 7 ticks. Clamps to CYCLE_HARD_MIN/MAX so noisy user input can't
 * blow the axis up beyond the physiological 15–60 day window.
 *
 * `dataMin`/`dataMax` may be equal (single data point) — the function
 * widens the range by 1 above the equal point so the tick math has room
 * to breathe. The consumer typically pads by ±2 before calling to avoid
 * the "line sits on the floor" look.
 */
export function niceScale(dataMin: number, dataMax: number): NiceScaleResult {
  const rawMin = Math.max(Math.floor(dataMin), CYCLE_HARD_MIN);
  const rawMax = Math.min(
    Math.ceil(dataMax === dataMin ? dataMax + 1 : dataMax),
    CYCLE_HARD_MAX,
  );
  const candidates = [1, 2, 5, 10];
  for (const step of candidates) {
    const yMin = Math.floor(rawMin / step) * step;
    const yMax = Math.ceil(rawMax / step) * step;
    const ticks = (yMax - yMin) / step + 1;
    if (ticks <= MAX_TICKS) {
      return { yMin: Math.max(yMin, 0), yMax, tickStepValue: step };
    }
  }
  const step = 10;
  const yMin = Math.floor(rawMin / step) * step;
  const yMax = Math.ceil(rawMax / step) * step;
  return { yMin: Math.max(yMin, 0), yMax, tickStepValue: step };
}

/**
 * Clamps an x coordinate so a fixed-width overlay (e.g. the "평균 N일"
 * pill) stays fully inside the plot area. `halfWidth` is the pill's own
 * half-extent in the same coord space; callers pass it so the clamp is
 * agnostic to the pill's rendered size.
 */
export function clampOverlayX(
  x: number,
  minX: number,
  maxX: number,
  halfWidth: number,
): number {
  const safeMin = minX + halfWidth;
  const safeMax = maxX - halfWidth;
  if (safeMin > safeMax) return (minX + maxX) / 2;
  return Math.min(Math.max(x, safeMin), safeMax);
}
