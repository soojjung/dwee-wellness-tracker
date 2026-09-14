import type { ISODate } from '@/lib/date';
import type { Holiday, UsHolidayKey } from './types';
import { addDays, iso, lastWeekday, nthWeekday, weekday } from './dateUtils';

/**
 * 미국 연방 공휴일. 전부 규칙으로 계산되므로 연도 제한이 없다.
 *
 * 고정일이 토요일이면 전날 금요일, 일요일이면 다음 월요일이 observed holiday 가
 * 된다 (`substitute: true`). 요일 규칙 공휴일은 항상 평일이라 observed 가 없다.
 * Juneteenth 는 2021년부터 연방 공휴일.
 */
interface Rule {
  readonly key: UsHolidayKey;
  readonly date: (year: number) => ISODate;
  /** 고정 날짜 공휴일만 observed 규칙 적용 */
  readonly fixed: boolean;
  readonly since?: number;
}

const MON = 1;
const THU = 4;

const RULES: readonly Rule[] = [
  { key: 'newYearsDay', date: (y) => iso(y, 1, 1), fixed: true },
  { key: 'mlkDay', date: (y) => nthWeekday(y, 1, MON, 3), fixed: false },
  { key: 'presidentsDay', date: (y) => nthWeekday(y, 2, MON, 3), fixed: false },
  { key: 'memorialDay', date: (y) => lastWeekday(y, 5, MON), fixed: false },
  { key: 'juneteenth', date: (y) => iso(y, 6, 19), fixed: true, since: 2021 },
  { key: 'independenceDay', date: (y) => iso(y, 7, 4), fixed: true },
  { key: 'laborDay', date: (y) => nthWeekday(y, 9, MON, 1), fixed: false },
  { key: 'columbusDay', date: (y) => nthWeekday(y, 10, MON, 2), fixed: false },
  { key: 'veteransDay', date: (y) => iso(y, 11, 11), fixed: true },
  { key: 'thanksgiving', date: (y) => nthWeekday(y, 11, THU, 4), fixed: false },
  { key: 'christmas', date: (y) => iso(y, 12, 25), fixed: true },
];

function observed(date: ISODate): ISODate | null {
  const w = weekday(date);
  if (w === 6) return addDays(date, -1);
  if (w === 0) return addDays(date, 1);
  return null;
}

/**
 * 해당 연도 안에 "떨어지는" 날만 돌려준다. 다음 해 1월 1일이 토요일이면 observed
 * 가 이 해 12월 31일이 되므로 그 경우도 포함한다.
 */
export function usHolidaysInYear(year: number): Holiday[] {
  const out: Holiday[] = [];
  const push = (key: UsHolidayKey, date: ISODate, substitute: boolean) => {
    if (date.startsWith(`${year}-`)) out.push({ date, country: 'US', key, substitute });
  };
  for (const rule of RULES) {
    for (const y of [year, year + 1]) {
      if (rule.since !== undefined && y < rule.since) continue;
      const date = rule.date(y);
      push(rule.key, date, false);
      if (rule.fixed) {
        const obs = observed(date);
        if (obs) push(rule.key, obs, true);
      }
    }
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
