import { addDaysISO, type ISODate } from '@/lib/date';
import {
  EXTEND_GAP_DAYS,
  addRange,
  compact,
  extendTo,
  findContainingDraft,
  findExtendableDraft,
  removeDay,
  type DraftPeriod,
} from './periodEdit';
import { defaultPeriodEndDate } from './recordPolicy';

/**
 * Calendar tap state shared by `PeriodSelectSheet` (Home) and
 * `PeriodRecordSheet` (report). `drafts` are the ranges built so far;
 * `pendingStart` is a lone first tap still waiting for its end.
 */
export interface PeriodTapState {
  drafts: DraftPeriod[];
  pendingStart: ISODate | null;
}

export const EMPTY_PERIOD_TAP_STATE: PeriodTapState = { drafts: [], pendingStart: null };

/**
 * Tap reducer:
 * - Tapping a day inside a range removes just that day (splitting if needed).
 * - Tapping within `EXTEND_GAP_DAYS` after a range extends it to that day;
 *   tapping the day right before a range extends it backward.
 * - Otherwise 1st tap = start, 2nd tap = end (order-independent); tapping the
 *   lone start again clears it.
 */
export function tapPeriodDate(
  state: PeriodTapState,
  date: ISODate,
  newKey: () => string,
): PeriodTapState {
  const { drafts, pendingStart } = state;

  const containing = findContainingDraft(drafts, date);
  if (containing) {
    return { drafts: removeDay(drafts, containing.key, date, newKey), pendingStart: null };
  }

  const extendable = findExtendableDraft(drafts, date, EXTEND_GAP_DAYS);
  if (extendable) {
    return { drafts: extendTo(drafts, extendable.key, date), pendingStart: null };
  }

  // The day right before a range joins it — otherwise a lone start there would
  // be saved with the average length and overshoot the range it touches.
  const following = drafts.find((p) => p.startDate === addDaysISO(date, 1));
  if (following) {
    return {
      drafts: compact(drafts.map((p) => (p === following ? { ...p, startDate: date } : p))),
      pendingStart: null,
    };
  }

  if (!pendingStart) return { drafts, pendingStart: date };
  if (date === pendingStart) return { drafts, pendingStart: null };

  const [lo, hi] = pendingStart < date ? [pendingStart, date] : [date, pendingStart];
  const nearbyForLo = findExtendableDraft(drafts, lo, EXTEND_GAP_DAYS);
  if (nearbyForLo) {
    return { drafts: extendTo(drafts, nearbyForLo.key, hi), pendingStart: null };
  }
  return { drafts: addRange(drafts, lo, hi, newKey()), pendingStart: null };
}

/**
 * Drafts to save. A lone start is common (e.g. "started today"), so instead
 * of dropping it the range is filled with the average period length.
 */
export function finalizePeriodDrafts(
  state: PeriodTapState,
  averagePeriodLength: number,
): DraftPeriod[] {
  const { drafts, pendingStart } = state;
  if (!pendingStart) return drafts;
  return addRange(
    drafts,
    pendingStart,
    defaultPeriodEndDate(pendingStart, averagePeriodLength),
    'pending',
  );
}

/** Every day currently shown as selected — draft ranges plus a lone start. */
export function selectedPeriodDates(state: PeriodTapState): Set<ISODate> {
  const set = new Set<ISODate>();
  for (const p of state.drafts) {
    for (let d = p.startDate; d <= p.endDate; d = addDaysISO(d, 1)) set.add(d);
  }
  if (state.pendingStart) set.add(state.pendingStart);
  return set;
}
