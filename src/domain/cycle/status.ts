import type { PeriodLog, Confidence } from '@/types';
import { daysBetween } from '@/lib/date';

export type CycleStatus =
  | 'stable'
  | 'regular'
  | 'slightlyIrregular'
  | 'irregular'
  | 'shortPeriod'
  | 'longPeriod'
  | 'insufficient';

export interface CycleStatusResult {
  status: CycleStatus;
  confidence: Confidence;
  averageCycleDays: number | null;
  cycleRangeDays: number | null;
  latestPeriodLengthDays: number | null;
}

const CYCLE_MIN = 15;
const CYCLE_MAX = 60;
const PERIOD_MIN = 1;
const PERIOD_MAX = 14;

const MIN_RECORDS_FOR_STATUS = 3;

const STABLE_PERIOD_MIN = 3;
const STABLE_PERIOD_MAX = 7;
const STABLE_CYCLE_MIN = 21;
const STABLE_CYCLE_MAX = 35;
const STABLE_RANGE_MAX = 7;

const IRREGULAR_RANGE_MIN = 15;
const SLIGHT_RANGE_MIN = 8;

const SHORT_PERIOD_MAX = 2;
const LONG_PERIOD_MIN = 8;

function collectCycleGaps(periods: PeriodLog[]): number[] {
  if (periods.length < 2) return [];
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetween(sorted[i - 1]!.startDate, sorted[i]!.startDate);
    if (gap >= CYCLE_MIN && gap <= CYCLE_MAX) gaps.push(gap);
  }
  return gaps;
}

function latestCompletedPeriodLength(periods: PeriodLog[]): number | null {
  const completed = periods
    .filter((p): p is PeriodLog & { endDate: string } => Boolean(p.endDate))
    .map((p) => ({ p, length: daysBetween(p.startDate, p.endDate) + 1 }))
    .filter(({ length }) => length >= PERIOD_MIN && length <= PERIOD_MAX);
  if (completed.length === 0) return null;
  completed.sort((a, b) => b.p.startDate.localeCompare(a.p.startDate));
  return completed[0]!.length;
}

function avgOrNull(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10;
}

/**
 * 최근 기록으로 주기 상태를 판정. 표시 문자열은 화면이 `t.report.status.*` 로 조립.
 * 우선순위와 임계값은 `.claude/rules/cycle-logic.md` §8 참고.
 */
export function classifyCycleStatus(periods: PeriodLog[]): CycleStatusResult {
  if (periods.length < MIN_RECORDS_FOR_STATUS) {
    return {
      status: 'insufficient',
      confidence: 'unknown',
      averageCycleDays: null,
      cycleRangeDays: null,
      latestPeriodLengthDays: latestCompletedPeriodLength(periods),
    };
  }

  const gaps = collectCycleGaps(periods);
  const avg = avgOrNull(gaps);
  const range = gaps.length >= 2 ? Math.max(...gaps) - Math.min(...gaps) : gaps.length === 1 ? 0 : null;
  const latestLen = latestCompletedPeriodLength(periods);

  // gaps.length + 1 == number of period records. `high` = 4+ records (§2 of cycle-logic.md).
  const confidence: Confidence =
    gaps.length >= 3 ? 'high' : gaps.length >= 2 ? 'medium' : 'low';

  const base = {
    confidence,
    averageCycleDays: avg,
    cycleRangeDays: range,
    latestPeriodLengthDays: latestLen,
  };

  if (latestLen !== null && latestLen <= SHORT_PERIOD_MAX) {
    return { status: 'shortPeriod', ...base };
  }
  if (latestLen !== null && latestLen >= LONG_PERIOD_MIN) {
    return { status: 'longPeriod', ...base };
  }
  if (range !== null && range >= IRREGULAR_RANGE_MIN) {
    return { status: 'irregular', ...base };
  }
  if (range !== null && range >= SLIGHT_RANGE_MIN) {
    return { status: 'slightlyIrregular', ...base };
  }
  const inStablePeriod =
    latestLen === null || (latestLen >= STABLE_PERIOD_MIN && latestLen <= STABLE_PERIOD_MAX);
  const inStableCycle =
    avg !== null && avg >= STABLE_CYCLE_MIN && avg <= STABLE_CYCLE_MAX;
  const inStableRange = range !== null && range <= STABLE_RANGE_MAX;
  if (inStablePeriod && inStableCycle && inStableRange) {
    return { status: 'stable', ...base };
  }
  return { status: 'regular', ...base };
}
