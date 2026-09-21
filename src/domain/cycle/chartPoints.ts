import type { PeriodLog } from '@/types';
import { daysBetween } from '@/lib/date';
import { isCountableCycleGap } from './cycleGap';

export interface ChartMonth {
  year: number;
  /** 0 = 1월 */
  monthIndex: number;
}

export interface MonthlyCyclePoint extends ChartMonth {
  /** 그 달에 그릴 주기(일). 그릴 수 없으면 null. */
  cycleDays: number | null;
}

/**
 * 주기 차트의 달별 점. 각 달에서 **처음 시작한 생리**와 그 직전 생리의 시작일 간격을 그 달의
 * 주기로 본다. 셀 수 있는 범위(`cycleGap.ts`) 밖이거나, 그 달에 시작한 기록이 없거나, 직전
 * 기록이 없으면 null — 억지로 값을 만들지 않는다.
 */
export function monthlyCyclePoints(
  periods: readonly PeriodLog[],
  months: readonly ChartMonth[],
): MonthlyCyclePoint[] {
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  return months.map(({ year, monthIndex }) => {
    // ISODate 는 'YYYY-MM-DD' — Date 로 바꾸지 않고 앞 7자리로 달을 비교한다 (시간대 영향 없음).
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    const idx = sorted.findIndex((p) => p.startDate.slice(0, 7) === monthKey);
    const current = idx > 0 ? sorted[idx] : undefined;
    const previous = idx > 0 ? sorted[idx - 1] : undefined;
    if (!current || !previous) return { year, monthIndex, cycleDays: null };
    const gap = daysBetween(previous.startDate, current.startDate);
    return { year, monthIndex, cycleDays: isCountableCycleGap(gap) ? gap : null };
  });
}
