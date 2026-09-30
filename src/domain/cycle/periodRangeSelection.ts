import type { ISODate } from '@/lib/date';

/**
 * In-progress start/end tap state for `PeriodRangeCalendar` (Figma 947:7835).
 * Unlike `periodEdit`'s drafts (which track every existing record for
 * edit/extend/remove), this only ever describes ONE new range being built up
 * by two taps. `end` stays the raw second tap (order-independent) — use
 * `rangeBounds` to read it sorted low → high.
 */
export interface PeriodRangeSelection {
  start: ISODate;
  end: ISODate | null;
}

/**
 * Tap reducer for the "1st tap = start, 2nd tap = end" range picker:
 * - No selection yet → tapped date becomes the start.
 * - Only a start exists → tapping it again clears the selection; tapping any
 *   other date (before or after) completes the range.
 * - A full range already exists → tapping starts a brand-new range from the
 *   tapped date.
 */
export function tapRangeDate(
  selection: PeriodRangeSelection | null,
  date: ISODate,
): PeriodRangeSelection | null {
  if (!selection) return { start: date, end: null };
  if (selection.end === null) {
    return date === selection.start ? null : { start: selection.start, end: date };
  }
  return { start: date, end: null };
}

/** Sorted [lo, hi] bounds. `hi` is `null` while only the start has been tapped. */
export function rangeBounds(selection: PeriodRangeSelection): {
  lo: ISODate;
  hi: ISODate | null;
} {
  if (selection.end === null) return { lo: selection.start, hi: null };
  return selection.start <= selection.end
    ? { lo: selection.start, hi: selection.end }
    : { lo: selection.end, hi: selection.start };
}

/** Whether `date` falls inside the (possibly single-day) selection. */
export function isInPeriodRange(selection: PeriodRangeSelection | null, date: ISODate): boolean {
  if (!selection) return false;
  const { lo, hi } = rangeBounds(selection);
  return date >= lo && date <= (hi ?? lo);
}
