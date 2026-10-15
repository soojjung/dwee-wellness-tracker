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
