import type { ISODate } from '@/lib/date';
import type { Locale } from '@/types';
import type { Holiday, HolidayCountry } from './types';
import { krHolidaysInYear } from './kr';
import { usHolidaysInYear } from './us';

export * from './types';
export { KR_SUPPORTED_YEARS, isKrYearSupported, krHolidaysInYear } from './kr';
export { usHolidaysInYear } from './us';

export function holidaysInYear(country: HolidayCountry, year: number): Holiday[] {
  return country === 'KR' ? krHolidaysInYear(year) : usHolidaysInYear(year);
}

/** `start`~`end` (둘 다 포함) 사이의 공휴일. 나라 순서는 `countries` 순, 날짜순 정렬. */
export function holidaysInRange(
  countries: readonly HolidayCountry[],
  start: ISODate,
  end: ISODate,
): Holiday[] {
  if (countries.length === 0 || start > end) return [];
  const fromYear = Number(start.slice(0, 4));
  const toYear = Number(end.slice(0, 4));
  const out: Holiday[] = [];
  for (const country of countries) {
    for (let y = fromYear; y <= toYear; y += 1) {
      for (const h of holidaysInYear(country, y)) {
        if (h.date >= start && h.date <= end) out.push(h);
      }
    }
  }
  const order = new Map(countries.map((c, i) => [c, i]));
  return out.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return (order.get(a.country) ?? 0) - (order.get(b.country) ?? 0);
  });
}

/** 달력 셀에서 바로 찾아 쓰기 위한 날짜별 묶음. */
export function holidaysByDate(
  countries: readonly HolidayCountry[],
  start: ISODate,
  end: ISODate,
): Record<ISODate, Holiday[]> {
  const out: Record<ISODate, Holiday[]> = {};
  for (const h of holidaysInRange(countries, start, end)) {
    (out[h.date] ??= []).push(h);
  }
  return out;
}

/**
 * 설정값 해석. `null` 은 "언어 따라 자동" — 한국어면 KR, 그 외는 US. 사용자가 토글을
 * 건드리면 명시적 배열이 저장되고, 이후 언어를 바꿔도 그 선택은 유지된다.
 */
export function resolveHolidayCountries(
  setting: readonly HolidayCountry[] | null | undefined,
  locale: Locale,
): HolidayCountry[] {
  if (setting) return [...setting];
  return locale === 'ko' ? ['KR'] : ['US'];
}
