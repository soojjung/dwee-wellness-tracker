import { describe, it, expect } from 'vitest';
import type { Holiday, UsHolidayKey } from './types';
import { usHolidaysInYear } from './us';

function h(date: string, key: UsHolidayKey, substitute = false): Holiday {
  return { date, country: 'US', key, substitute };
}

describe('usHolidaysInYear', () => {
  it('returns the full holiday list for 2020, without Juneteenth (before its start year)', () => {
    expect(usHolidaysInYear(2020)).toEqual([
      h('2020-01-01', 'newYearsDay'),
      h('2020-01-20', 'mlkDay'),
      h('2020-02-17', 'presidentsDay'),
      h('2020-05-25', 'memorialDay'),
      h('2020-07-03', 'independenceDay', true),
      h('2020-07-04', 'independenceDay'),
      h('2020-09-07', 'laborDay'),
      h('2020-10-12', 'columbusDay'),
      h('2020-11-11', 'veteransDay'),
      h('2020-11-26', 'thanksgiving'),
      h('2020-12-25', 'christmas'),
    ]);
  });

  it('returns the full holiday list for 2021, the first year Juneteenth appears, with a Saturday Juneteenth observed the Friday before', () => {
    expect(usHolidaysInYear(2021)).toEqual([
      h('2021-01-01', 'newYearsDay'),
      h('2021-01-18', 'mlkDay'),
      h('2021-02-15', 'presidentsDay'),
      h('2021-05-31', 'memorialDay'),
      h('2021-06-18', 'juneteenth', true),
      h('2021-06-19', 'juneteenth'),
      h('2021-07-04', 'independenceDay'),
      h('2021-07-05', 'independenceDay', true),
      h('2021-09-06', 'laborDay'),
      h('2021-10-11', 'columbusDay'),
      h('2021-11-11', 'veteransDay'),
      h('2021-11-25', 'thanksgiving'),
      h('2021-12-24', 'christmas', true),
      h('2021-12-25', 'christmas'),
      h('2021-12-31', 'newYearsDay', true),
    ]);
  });

  it('returns the full holiday list for 2026, with a Saturday Independence Day observed the Friday before', () => {
    expect(usHolidaysInYear(2026)).toEqual([
      h('2026-01-01', 'newYearsDay'),
      h('2026-01-19', 'mlkDay'),
      h('2026-02-16', 'presidentsDay'),
      h('2026-05-25', 'memorialDay'),
      h('2026-06-19', 'juneteenth'),
      h('2026-07-03', 'independenceDay', true),
      h('2026-07-04', 'independenceDay'),
      h('2026-09-07', 'laborDay'),
      h('2026-10-12', 'columbusDay'),
      h('2026-11-11', 'veteransDay'),
      h('2026-11-26', 'thanksgiving'),
      h('2026-12-25', 'christmas'),
    ]);
  });

  it('returns the full holiday list for 2027, with Juneteenth/Independence Day/Christmas all observed and next year’s Jan 1 observed carried into Dec 31', () => {
    expect(usHolidaysInYear(2027)).toEqual([
      h('2027-01-01', 'newYearsDay'),
      h('2027-01-18', 'mlkDay'),
      h('2027-02-15', 'presidentsDay'),
      h('2027-05-31', 'memorialDay'),
      h('2027-06-18', 'juneteenth', true),
      h('2027-06-19', 'juneteenth'),
      h('2027-07-04', 'independenceDay'),
      h('2027-07-05', 'independenceDay', true),
      h('2027-09-06', 'laborDay'),
      h('2027-10-11', 'columbusDay'),
      h('2027-11-11', 'veteransDay'),
      h('2027-11-25', 'thanksgiving'),
      h('2027-12-24', 'christmas', true),
      h('2027-12-25', 'christmas'),
      h('2027-12-31', 'newYearsDay', true),
    ]);
  });

  it('returns the full holiday list for 2028, with a Sunday Veterans Day observed the following Monday', () => {
    expect(usHolidaysInYear(2028)).toEqual([
      h('2028-01-01', 'newYearsDay'),
      h('2028-01-17', 'mlkDay'),
      h('2028-02-21', 'presidentsDay'),
      h('2028-05-29', 'memorialDay'),
      h('2028-06-19', 'juneteenth'),
      h('2028-07-04', 'independenceDay'),
      h('2028-09-04', 'laborDay'),
      h('2028-10-09', 'columbusDay'),
      h('2028-11-10', 'veteransDay', true),
      h('2028-11-11', 'veteransDay'),
      h('2028-11-23', 'thanksgiving'),
      h('2028-12-25', 'christmas'),
    ]);
  });

  it('never flags a weekday-rule holiday (e.g. mlkDay) as a substitute', () => {
    const mlk = usHolidaysInYear(2026).filter((entry) => entry.key === 'mlkDay');
    expect(mlk).toEqual([h('2026-01-19', 'mlkDay')]);
  });

  it('omits Juneteenth entirely for years before 2021', () => {
    expect(usHolidaysInYear(2020).some((entry) => entry.key === 'juneteenth')).toBe(false);
  });
});
