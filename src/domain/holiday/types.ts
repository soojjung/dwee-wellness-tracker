import type { ISODate } from '@/lib/date';
import type { HolidayCountry } from '@/types/holiday';

export type { HolidayCountry } from '@/types/holiday';
export { HOLIDAY_COUNTRIES } from '@/types/holiday';

export type KrHolidayKey =
  | 'newYearsDay'
  | 'seollalHoliday'
  | 'seollal'
  | 'samiljeol'
  | 'childrensDay'
  | 'buddhasBirthday'
  | 'memorialDay'
  | 'constitutionDay'
  | 'liberationDay'
  | 'chuseokHoliday'
  | 'chuseok'
  | 'foundationDay'
  | 'hangulDay'
  | 'christmas'
  | 'electionDay'
  | 'temporaryHoliday';

export type UsHolidayKey =
  | 'newYearsDay'
  | 'mlkDay'
  | 'presidentsDay'
  | 'memorialDay'
  | 'juneteenth'
  | 'independenceDay'
  | 'laborDay'
  | 'columbusDay'
  | 'veteransDay'
  | 'thanksgiving'
  | 'christmas';

export type HolidayKey = KrHolidayKey | UsHolidayKey;

export interface Holiday {
  readonly date: ISODate;
  readonly country: HolidayCountry;
  readonly key: HolidayKey;
  /**
   * 원래 날짜가 주말이거나 다른 공휴일과 겹쳐 대신 쉬는 날. 한국은 대체공휴일,
   * 미국은 observed holiday. 이름은 `key` 의 것을 쓰되 "대체" 표기를 덧붙인다.
   */
  readonly substitute: boolean;
}
