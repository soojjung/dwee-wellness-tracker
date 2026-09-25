import { toISO, type ISODate } from './index';

export interface YearMonth {
  year: number;
  monthIndex: number;
}

/** 월 단위 이동. delta 가 음수/12를 넘겨도 연도 경계를 정상적으로 넘나든다. */
export function shiftMonth(m: YearMonth, delta: number): YearMonth {
  const total = m.year * 12 + m.monthIndex + delta;
  return { year: Math.floor(total / 12), monthIndex: ((total % 12) + 12) % 12 };
}

/** 그 달의 첫날/마지막날 ISO. */
export function monthBoundsISO(m: YearMonth): { start: ISODate; end: ISODate } {
  return {
    start: toISO(new Date(m.year, m.monthIndex, 1)),
    end: toISO(new Date(m.year, m.monthIndex + 1, 0)),
  };
}

/** 'YYYY-MM' 키. */
export function monthKey(m: YearMonth): string {
  return `${m.year}-${String(m.monthIndex + 1).padStart(2, '0')}`;
}

/**
 * 오늘 달에서 몇 달 전까지 보여줘야 하는지. 최소 `minMonths`, 그보다 오래된 기록이
 * 있으면 그 기록의 달까지 — 목록 밖으로 밀려난 기록은 고치거나 지울 수 없기 때문.
 */
export function monthsBackToCover(
  today: ISODate,
  earliest: ISODate | null,
  minMonths: number,
): number {
  if (!earliest) return minMonths;
  const [ty, tm] = today.split('-').map(Number) as [number, number];
  const [ey, em] = earliest.split('-').map(Number) as [number, number];
  return Math.max(minMonths, ty * 12 + tm - (ey * 12 + em));
}
