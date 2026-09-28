import type { PeriodLog } from '@/types';
import { daysBetween, monthKey } from '@/lib/date';
import { isCountableCycleGap } from './cycleGap';

export interface ChartMonth {
  year: number;
  /** 0 = 1월 */
  monthIndex: number;
}

export interface CycleChartPoint {
  /** 이 주기를 끝낸(= 다음 생리를 시작한) 날. 점은 이 날짜 위치에 찍힌다. */
  startDate: string;
  /** 직전 생리 시작일부터 이 시작일까지의 간격(일). */
  cycleDays: number;
  /** 차트 가로축에서의 위치, 0(첫 달 1일 앞) ~ 1(마지막 달 말일 뒤). */
  position: number;
}

/**
 * 주기 차트의 점. 창(`months`) 안에서 시작한 생리마다 직전 생리 시작일과의 간격을 점 하나로
 * 만들고, 가로 위치는 실제 날짜 비율로 잡는다 — 8월 말 시작이면 8월 칸 오른쪽 끝, 9월 쪽에 찍힌다.
 * 셀 수 있는 범위(`cycleGap.ts`) 밖 간격이나 직전 기록이 없는 첫 기록은 점을 만들지 않는다.
 */
export function cycleChartPoints(
  periods: readonly PeriodLog[],
  months: readonly ChartMonth[],
): CycleChartPoint[] {
  // ISODate 는 'YYYY-MM-DD' — Date 로 바꾸지 않고 앞 7자리로 달을 찾는다 (시간대 영향 없음).
  const slotByKey = new Map(months.map((m, i) => [monthKey(m), { index: i, month: m }]));
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const points: CycleChartPoint[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]!;
    const slot = slotByKey.get(current.startDate.slice(0, 7));
    if (!slot) continue;
    const gap = daysBetween(sorted[i - 1]!.startDate, current.startDate);
    if (!isCountableCycleGap(gap)) continue;
    const day = Number(current.startDate.slice(8, 10));
    // 하루를 칸으로 보고 그 가운데에 둔다 — 1일·말일이 이웃 달 경계선 위에 올라가지 않게.
    const withinMonth = (day - 0.5) / daysInMonth(slot.month);
    points.push({
      startDate: current.startDate,
      cycleDays: gap,
      position: (slot.index + withinMonth) / months.length,
    });
  }
  return points;
}

function daysInMonth({ year, monthIndex }: ChartMonth): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}
