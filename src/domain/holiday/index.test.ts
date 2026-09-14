import { describe, it, expect } from 'vitest';
import type { HolidayCountry } from './types';
import { krHolidaysInYear } from './kr';
import { usHolidaysInYear } from './us';
import { holidaysInYear, holidaysInRange, holidaysByDate, resolveHolidayCountries } from './index';

describe('holidaysInYear', () => {
  it('delegates to krHolidaysInYear for KR', () => {
    expect(holidaysInYear('KR', 2026)).toEqual(krHolidaysInYear(2026));
  });

  it('delegates to usHolidaysInYear for US', () => {
    expect(holidaysInYear('US', 2026)).toEqual(usHolidaysInYear(2026));
  });
});

describe('holidaysInRange', () => {
  it('returns holidays across a year boundary, sorted by date then by the given country order', () => {
    expect(holidaysInRange(['KR', 'US'], '2026-12-20', '2027-01-05')).toEqual([
      { date: '2026-12-25', country: 'KR', key: 'christmas', substitute: false },
      { date: '2026-12-25', country: 'US', key: 'christmas', substitute: false },
      { date: '2027-01-01', country: 'KR', key: 'newYearsDay', substitute: false },
      { date: '2027-01-01', country: 'US', key: 'newYearsDay', substitute: false },
    ]);
  });

  it('orders same-date entries by the countries array order, US first when given first', () => {
    const result = holidaysInRange(['US', 'KR'], '2026-12-20', '2027-01-05');
    expect(result.map((entry) => entry.country)).toEqual(['US', 'KR', 'US', 'KR']);
  });

  it('returns an empty array when countries is empty', () => {
    expect(holidaysInRange([], '2026-01-01', '2026-01-02')).toEqual([]);
  });

  it('returns an empty array when start is after end', () => {
    expect(holidaysInRange(['KR'], '2026-01-05', '2026-01-01')).toEqual([]);
  });
});

describe('holidaysByDate', () => {
  it('groups multiple holidays that fall on the same date', () => {
    const byDate = holidaysByDate(['KR'], '2025-05-01', '2025-05-10');
    expect(byDate['2025-05-05']).toEqual([
      { date: '2025-05-05', country: 'KR', key: 'childrensDay', substitute: false },
      { date: '2025-05-05', country: 'KR', key: 'buddhasBirthday', substitute: false },
    ]);
  });

  it('keys a single holiday under its own date', () => {
    const byDate = holidaysByDate(['KR'], '2025-05-01', '2025-05-10');
    expect(byDate['2025-05-06']).toEqual([
      { date: '2025-05-06', country: 'KR', key: 'childrensDay', substitute: true },
    ]);
  });
});

describe('resolveHolidayCountries', () => {
  it('resolves null setting with ko locale to KR', () => {
    expect(resolveHolidayCountries(null, 'ko')).toEqual(['KR']);
  });

  it('resolves null setting with en locale to US', () => {
    expect(resolveHolidayCountries(null, 'en')).toEqual(['US']);
  });

  it('resolves an undefined setting the same as null', () => {
    expect(resolveHolidayCountries(undefined, 'ko')).toEqual(['KR']);
  });

  it('returns an explicit setting as-is regardless of locale', () => {
    expect(resolveHolidayCountries(['US'], 'ko')).toEqual(['US']);
  });

  it('returns a copy of an explicit setting, not the same array reference', () => {
    const setting: readonly HolidayCountry[] = ['US'];
    const resolved = resolveHolidayCountries(setting, 'ko');
    expect(resolved).not.toBe(setting);
    expect(resolved).toEqual(setting);
  });
});
