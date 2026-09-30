import type { PeriodLog, UserSettings } from '@/types';
import type { PhaseEstimate } from './types';
import { daysBetween } from '@/lib/date';
import { averageCycleLength, averagePeriodLength } from './aggregate';

/**
 * Grace window (in days) to keep the 'luteal' phase when a period is
 * due/late but not yet logged. Once period overdue by this many days,
 * fall back to 'unknown'. This bounds the duration of pre-period (luteal)
 * assumption without asserting menstrual without a record.
 */
export const PERIOD_LATE_GRACE_DAYS = 14;

export function currentPhase(
  today: string,
  periods: PeriodLog[],
  settings: UserSettings,
): PhaseEstimate {
  if (periods.length === 0) return { phase: 'unknown', confidence: 'unknown' };
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const last = sorted[sorted.length - 1]!;
  const dayInCycle = daysBetween(last.startDate, today);
  if (dayInCycle < 0) return { phase: 'unknown', confidence: 'low' };

  const cycle = averageCycleLength(periods) ?? settings.averageCycleLength;
  const periodLen = averagePeriodLength(periods) ?? settings.averagePeriodLength;
  const ovulationDay = cycle - 14;

  const phase: PhaseEstimate['phase'] =
    dayInCycle < periodLen
      ? 'menstrual'
      : dayInCycle < ovulationDay - 2
        ? 'follicular'
        : dayInCycle <= ovulationDay + 1
          ? 'ovulation'
          : dayInCycle < cycle + PERIOD_LATE_GRACE_DAYS
            ? 'luteal'
            : 'unknown';

  // 예정일이 지났는데 기록이 없는 동안의 황체기는 추정이라 신뢰도를 낮춘다.
  const late = dayInCycle >= cycle && phase === 'luteal';
  const confidence = late ? 'low' : periods.length >= 3 ? 'medium' : 'low';

  return { phase, confidence };
}
