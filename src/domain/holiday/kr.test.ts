import { describe, it, expect } from 'vitest';
import type { Holiday, KrHolidayKey } from './types';
import { krHolidaysInYear, isKrYearSupported, KR_SUPPORTED_YEARS } from './kr';

function h(date: string, key: KrHolidayKey, substitute = false): Holiday {
  return { date, country: 'KR', key, substitute };
}

describe('krHolidaysInYear', () => {
  it('returns an empty array for a year before the supported range', () => {
    expect(krHolidaysInYear(2024)).toEqual([]);
  });

  it('returns an empty array for a year after the supported range', () => {
    expect(krHolidaysInYear(2031)).toEqual([]);
  });

  it('returns the full sorted holiday list for 2025, with a single substitute for the childrensDay/buddhasBirthday overlap', () => {
    expect(krHolidaysInYear(2025)).toEqual([
      h('2025-01-01', 'newYearsDay'),
      h('2025-01-27', 'temporaryHoliday'),
      h('2025-01-28', 'seollalHoliday'),
      h('2025-01-29', 'seollal'),
      h('2025-01-30', 'seollalHoliday'),
      h('2025-03-01', 'samiljeol'),
      h('2025-03-03', 'samiljeol', true),
      h('2025-05-05', 'childrensDay'),
      h('2025-05-05', 'buddhasBirthday'),
      h('2025-05-06', 'childrensDay', true),
      h('2025-06-03', 'electionDay'),
      h('2025-06-06', 'memorialDay'),
      h('2025-08-15', 'liberationDay'),
      h('2025-10-03', 'foundationDay'),
      h('2025-10-05', 'chuseokHoliday'),
      h('2025-10-06', 'chuseok'),
      h('2025-10-07', 'chuseokHoliday'),
      h('2025-10-08', 'chuseokHoliday', true),
      h('2025-10-09', 'hangulDay'),
      h('2025-12-25', 'christmas'),
    ]);
  });

  it('returns the full sorted holiday list for 2026, with constitutionDay present and no substitute for a Saturday chuseokHoliday', () => {
    expect(krHolidaysInYear(2026)).toEqual([
      h('2026-01-01', 'newYearsDay'),
      h('2026-02-16', 'seollalHoliday'),
      h('2026-02-17', 'seollal'),
      h('2026-02-18', 'seollalHoliday'),
      h('2026-03-01', 'samiljeol'),
      h('2026-03-02', 'samiljeol', true),
      h('2026-05-05', 'childrensDay'),
      h('2026-05-24', 'buddhasBirthday'),
      h('2026-05-25', 'buddhasBirthday', true),
      h('2026-06-03', 'electionDay'),
      h('2026-06-06', 'memorialDay'),
      h('2026-07-17', 'constitutionDay'),
      h('2026-08-15', 'liberationDay'),
      h('2026-08-17', 'liberationDay', true),
      h('2026-09-24', 'chuseokHoliday'),
      h('2026-09-25', 'chuseok'),
      h('2026-09-26', 'chuseokHoliday'),
      h('2026-10-03', 'foundationDay'),
      h('2026-10-05', 'foundationDay', true),
      h('2026-10-09', 'hangulDay'),
      h('2026-12-25', 'christmas'),
    ]);
  });

  it('returns the full sorted holiday list for 2027, with no substitute for a Saturday seollalHoliday or a Sunday memorialDay, and a seollal substitute that skips an already-occupied day', () => {
    expect(krHolidaysInYear(2027)).toEqual([
      h('2027-01-01', 'newYearsDay'),
      h('2027-02-06', 'seollalHoliday'),
      h('2027-02-07', 'seollal'),
      h('2027-02-08', 'seollalHoliday'),
      h('2027-02-09', 'seollal', true),
      h('2027-03-01', 'samiljeol'),
      h('2027-05-05', 'childrensDay'),
      h('2027-05-13', 'buddhasBirthday'),
      h('2027-06-06', 'memorialDay'),
      h('2027-07-17', 'constitutionDay'),
      h('2027-07-19', 'constitutionDay', true),
      h('2027-08-15', 'liberationDay'),
      h('2027-08-16', 'liberationDay', true),
      h('2027-09-14', 'chuseokHoliday'),
      h('2027-09-15', 'chuseok'),
      h('2027-09-16', 'chuseokHoliday'),
      h('2027-10-03', 'foundationDay'),
      h('2027-10-04', 'foundationDay', true),
      h('2027-10-09', 'hangulDay'),
      h('2027-10-11', 'hangulDay', true),
      h('2027-12-25', 'christmas'),
      h('2027-12-27', 'christmas', true),
    ]);
  });

  it('returns the full sorted holiday list for 2028, with exactly one substitute for the foundationDay/chuseok overlap', () => {
    expect(krHolidaysInYear(2028)).toEqual([
      h('2028-01-01', 'newYearsDay'),
      h('2028-01-26', 'seollalHoliday'),
      h('2028-01-27', 'seollal'),
      h('2028-01-28', 'seollalHoliday'),
      h('2028-03-01', 'samiljeol'),
      h('2028-04-12', 'electionDay'),
      h('2028-05-02', 'buddhasBirthday'),
      h('2028-05-05', 'childrensDay'),
      h('2028-06-06', 'memorialDay'),
      h('2028-07-17', 'constitutionDay'),
      h('2028-08-15', 'liberationDay'),
      h('2028-10-02', 'chuseokHoliday'),
      h('2028-10-03', 'foundationDay'),
      h('2028-10-03', 'chuseok'),
      h('2028-10-04', 'chuseokHoliday'),
      h('2028-10-05', 'foundationDay', true),
      h('2028-10-09', 'hangulDay'),
      h('2028-12-25', 'christmas'),
    ]);
  });

  it('returns the full sorted holiday list for 2029', () => {
    expect(krHolidaysInYear(2029)).toEqual([
      h('2029-01-01', 'newYearsDay'),
      h('2029-02-12', 'seollalHoliday'),
      h('2029-02-13', 'seollal'),
      h('2029-02-14', 'seollalHoliday'),
      h('2029-03-01', 'samiljeol'),
      h('2029-05-05', 'childrensDay'),
      h('2029-05-07', 'childrensDay', true),
      h('2029-05-20', 'buddhasBirthday'),
      h('2029-05-21', 'buddhasBirthday', true),
      h('2029-06-06', 'memorialDay'),
      h('2029-07-17', 'constitutionDay'),
      h('2029-08-15', 'liberationDay'),
      h('2029-09-21', 'chuseokHoliday'),
      h('2029-09-22', 'chuseok'),
      h('2029-09-23', 'chuseokHoliday'),
      h('2029-09-24', 'chuseokHoliday', true),
      h('2029-10-03', 'foundationDay'),
      h('2029-10-09', 'hangulDay'),
      h('2029-12-25', 'christmas'),
    ]);
  });

  it('returns the full sorted holiday list for 2030, with a seollal substitute that skips an already-occupied day', () => {
    expect(krHolidaysInYear(2030)).toEqual([
      h('2030-01-01', 'newYearsDay'),
      h('2030-02-02', 'seollalHoliday'),
      h('2030-02-03', 'seollal'),
      h('2030-02-04', 'seollalHoliday'),
      h('2030-02-05', 'seollal', true),
      h('2030-03-01', 'samiljeol'),
      h('2030-05-05', 'childrensDay'),
      h('2030-05-06', 'childrensDay', true),
      h('2030-05-09', 'buddhasBirthday'),
      h('2030-06-06', 'memorialDay'),
      h('2030-07-17', 'constitutionDay'),
      h('2030-08-15', 'liberationDay'),
      h('2030-09-11', 'chuseokHoliday'),
      h('2030-09-12', 'chuseok'),
      h('2030-09-13', 'chuseokHoliday'),
      h('2030-10-03', 'foundationDay'),
      h('2030-10-09', 'hangulDay'),
      h('2030-12-25', 'christmas'),
    ]);
  });

  it('never includes Labor Day (05-01)', () => {
    expect(krHolidaysInYear(2026).some((entry) => entry.date === '2026-05-01')).toBe(false);
  });
});

describe('isKrYearSupported', () => {
  it('returns true at the lower boundary of the supported range', () => {
    expect(isKrYearSupported(2025)).toBe(true);
  });

  it('returns true at the upper boundary of the supported range', () => {
    expect(isKrYearSupported(2030)).toBe(true);
  });

  it('returns false just below the supported range', () => {
    expect(isKrYearSupported(2024)).toBe(false);
  });

  it('returns false just above the supported range', () => {
    expect(isKrYearSupported(2031)).toBe(false);
  });
});

describe('KR_SUPPORTED_YEARS', () => {
  it('exposes the supported year range as 2025-2030', () => {
    expect(KR_SUPPORTED_YEARS).toEqual({ from: 2025, to: 2030 });
  });
});
