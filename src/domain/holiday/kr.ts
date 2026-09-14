import type { ISODate } from '@/lib/date';
import type { Holiday, KrHolidayKey } from './types';
import { addDays, iso, isWeekend, weekday } from './dateUtils';

/**
 * 한국 공휴일 (관공서의 공휴일에 관한 규정 기준).
 *
 * - 양력 고정일은 규칙으로 계산한다. 제헌절은 2026년부터 다시 공휴일.
 * - 설날·추석·부처님오신날은 음력이라 연도별 양력 날짜를 표로 둔다. 선거일·임시공휴일도
 *   표에 넣는다 — 정부 발표 후 추가한다.
 * - 대체공휴일은 규칙으로 계산한다 (아래 `substitutePolicy`).
 * - 근로자의 날(노동절)은 관공서 공휴일이 아니라 넣지 않는다.
 *
 * 표가 없는 연도는 빈 배열을 돌려준다. 고정일만 보여주면 "설날이 없네" 처럼 잘못
 * 읽힐 수 있어 통째로 비운다. `isKrYearSupported` 로 확인.
 */
export const KR_SUPPORTED_YEARS = { from: 2025, to: 2030 } as const;

export function isKrYearSupported(year: number): boolean {
  return year >= KR_SUPPORTED_YEARS.from && year <= KR_SUPPORTED_YEARS.to;
}

interface BaseEntry {
  readonly date: ISODate;
  readonly key: KrHolidayKey;
}

interface LunarYear {
  /** 설날 당일 */
  readonly seollal: ISODate;
  /** 부처님오신날 (음력 4월 8일) */
  readonly buddhasBirthday: ISODate;
  /** 추석 당일 */
  readonly chuseok: ISODate;
  /** 선거일·임시공휴일 등 그 해에만 있는 날 */
  readonly extras?: readonly BaseEntry[];
}

// 출처: month2k / time.is 공휴일 달력 (2026-09 확인). 2029·2030 은 음력 날짜만
// 확정이고 선거일은 아직 지정 전이라 비워 둔다.
const LUNAR_TABLE: Readonly<Record<number, LunarYear>> = {
  2025: {
    seollal: '2025-01-29',
    buddhasBirthday: '2025-05-05',
    chuseok: '2025-10-06',
    extras: [
      { date: '2025-01-27', key: 'temporaryHoliday' },
      { date: '2025-06-03', key: 'electionDay' },
    ],
  },
  2026: {
    seollal: '2026-02-17',
    buddhasBirthday: '2026-05-24',
    chuseok: '2026-09-25',
    extras: [{ date: '2026-06-03', key: 'electionDay' }],
  },
  2027: {
    seollal: '2027-02-07',
    buddhasBirthday: '2027-05-13',
    chuseok: '2027-09-15',
  },
  2028: {
    seollal: '2028-01-27',
    buddhasBirthday: '2028-05-02',
    chuseok: '2028-10-03',
    extras: [{ date: '2028-04-12', key: 'electionDay' }],
  },
  2029: {
    seollal: '2029-02-13',
    buddhasBirthday: '2029-05-20',
    chuseok: '2029-09-22',
  },
  2030: {
    seollal: '2030-02-03',
    buddhasBirthday: '2030-05-09',
    chuseok: '2030-09-12',
  },
};

const CONSTITUTION_DAY_SINCE = 2026;

/**
 * 대체공휴일 발생 조건.
 * - `weekend`: 토·일 어느 쪽과 겹쳐도 대체 (국경일·어린이날·부처님오신날·성탄절).
 * - `sunday`: 일요일과 겹칠 때만 대체 (설·추석 연휴 — 토요일은 대체 없음).
 * - `none`: 대체 없음 (신정·현충일·선거일·임시공휴일).
 * 어느 쪽이든 다른 공휴일과 겹치면 대체가 생긴다 (`none` 제외).
 */
type SubstitutePolicy = 'weekend' | 'sunday' | 'none';

const SUBSTITUTE_POLICY: Readonly<Record<KrHolidayKey, SubstitutePolicy>> = {
  newYearsDay: 'none',
  seollalHoliday: 'sunday',
  seollal: 'sunday',
  samiljeol: 'weekend',
  childrensDay: 'weekend',
  buddhasBirthday: 'weekend',
  memorialDay: 'none',
  constitutionDay: 'weekend',
  liberationDay: 'weekend',
  chuseokHoliday: 'sunday',
  chuseok: 'sunday',
  foundationDay: 'weekend',
  hangulDay: 'weekend',
  christmas: 'weekend',
  electionDay: 'none',
  temporaryHoliday: 'none',
};

function baseEntries(year: number): BaseEntry[] {
  const lunar = LUNAR_TABLE[year];
  if (!lunar) return [];
  const fixed: BaseEntry[] = [
    { date: iso(year, 1, 1), key: 'newYearsDay' },
    { date: iso(year, 3, 1), key: 'samiljeol' },
    { date: iso(year, 5, 5), key: 'childrensDay' },
    { date: iso(year, 6, 6), key: 'memorialDay' },
    { date: iso(year, 8, 15), key: 'liberationDay' },
    { date: iso(year, 10, 3), key: 'foundationDay' },
    { date: iso(year, 10, 9), key: 'hangulDay' },
    { date: iso(year, 12, 25), key: 'christmas' },
  ];
  if (year >= CONSTITUTION_DAY_SINCE) {
    fixed.push({ date: iso(year, 7, 17), key: 'constitutionDay' });
  }
  const lunarEntries: BaseEntry[] = [
    { date: addDays(lunar.seollal, -1), key: 'seollalHoliday' },
    { date: lunar.seollal, key: 'seollal' },
    { date: addDays(lunar.seollal, 1), key: 'seollalHoliday' },
    { date: lunar.buddhasBirthday, key: 'buddhasBirthday' },
    { date: addDays(lunar.chuseok, -1), key: 'chuseokHoliday' },
    { date: lunar.chuseok, key: 'chuseok' },
    { date: addDays(lunar.chuseok, 1), key: 'chuseokHoliday' },
  ];
  return [...fixed, ...lunarEntries, ...(lunar.extras ?? [])].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  );
}

function triggersSubstitute(entry: BaseEntry, overlapsOther: boolean): boolean {
  const policy = SUBSTITUTE_POLICY[entry.key];
  if (policy === 'none') return false;
  if (overlapsOther) return true;
  const w = weekday(entry.date);
  if (policy === 'sunday') return w === 0;
  return w === 0 || w === 6;
}

/**
 * 대체공휴일 배정. 같은 날에 공휴일이 둘 겹치면 하나만 대체하고(2025-05-05 어린이날 =
 * 부처님오신날 → 5/6 하루), 주말 사유는 해당 공휴일마다 하나씩 생긴다. 대체일은 원래
 * 날짜 이후 첫 번째 "평일이면서 공휴일이 아닌 날" — 이미 배정된 대체일도 건너뛴다.
 */
function withSubstitutes(base: BaseEntry[]): Holiday[] {
  const taken = new Set(base.map((e) => e.date));
  const byDate = new Map<ISODate, BaseEntry[]>();
  for (const e of base) {
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }

  const out: Holiday[] = base.map((e) => ({
    date: e.date,
    country: 'KR',
    key: e.key,
    substitute: false,
  }));

  for (const [date, entries] of byDate) {
    const eligible = entries.filter((e) => SUBSTITUTE_POLICY[e.key] !== 'none');
    let needed = 0;
    for (const e of eligible) {
      if (triggersSubstitute(e, false)) needed += 1;
    }
    // 겹침 사유: 겹친 공휴일 수 - 1 만큼 (주말 사유와 별도).
    const overlapCount = Math.max(0, eligible.length - 1);
    needed += overlapCount;
    // 어떤 공휴일 이름을 달지: 겹침이면 나중 항목(예: 추석 vs 개천절 → 추석) 대신
    // 첫 번째 eligible 항목을 쓴다. 표시는 "대체공휴일" 이라 큰 차이 없다.
    const label = eligible[0];
    for (let i = 0; i < needed && label; i += 1) {
      let candidate = addDays(date, 1);
      while (isWeekend(candidate) || taken.has(candidate)) candidate = addDays(candidate, 1);
      taken.add(candidate);
      out.push({ date: candidate, country: 'KR', key: label.key, substitute: true });
    }
  }

  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function krHolidaysInYear(year: number): Holiday[] {
  if (!isKrYearSupported(year)) return [];
  return withSubstitutes(baseEntries(year));
}
