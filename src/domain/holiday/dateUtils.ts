import type { ISODate } from '@/lib/date';

/**
 * 타임존과 무관하게 달력 날짜만 다루기 위한 UTC 기반 헬퍼. `lib/date` 의
 * 로컬 시간 헬퍼를 쓰면 DST 전환일에 하루가 밀릴 수 있어 여기서는 UTC 로 고정한다.
 */
export function iso(year: number, month: number, day: number): ISODate {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function parts(date: ISODate): [number, number, number] {
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(5, 7));
  const d = Number(date.slice(8, 10));
  return [y, m, d];
}

export function addDays(date: ISODate, days: number): ISODate {
  const [y, m, d] = parts(date);
  const t = Date.UTC(y, m - 1, d + days);
  const next = new Date(t);
  return iso(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
}

/** 0 = Sunday … 6 = Saturday */
export function weekday(date: ISODate): number {
  const [y, m, d] = parts(date);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function isWeekend(date: ISODate): boolean {
  const w = weekday(date);
  return w === 0 || w === 6;
}

/** n번째(1부터) 특정 요일. 예: nthWeekday(2026, 1, 1, 3) = 1월 셋째 월요일 */
export function nthWeekday(year: number, month: number, dow: number, n: number): ISODate {
  const first = iso(year, month, 1);
  const offset = (dow - weekday(first) + 7) % 7;
  return addDays(first, offset + (n - 1) * 7);
}

/** 그 달의 마지막 특정 요일. */
export function lastWeekday(year: number, month: number, dow: number): ISODate {
  const firstOfNext = month === 12 ? iso(year + 1, 1, 1) : iso(year, month + 1, 1);
  const last = addDays(firstOfNext, -1);
  const back = (weekday(last) - dow + 7) % 7;
  return addDays(last, -back);
}
