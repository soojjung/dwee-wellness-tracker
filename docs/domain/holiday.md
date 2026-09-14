# 공휴일(Holiday) 도메인 로직

## Overview

다이어리 캘린더에 얹는 한국(KR)·미국(US) 공휴일은 전부 순수 함수로 계산한다. 외부 API·저장소 호출 없음 — `domain/holiday/**`는 부수효과 없음 규칙을 따른다. 날짜 계산은 UTC 고정 유틸(`dateUtils.ts`)을 쓴다 — 로컬 타임존에 따라 하루가 밀리는 문제를 막기 위함.

## 파일 구성

| 파일 | 역할 |
|---|---|
| `types.ts` | `Holiday`, `KrHolidayKey`, `UsHolidayKey` 타입 |
| `dateUtils.ts` | UTC 기준 날짜 유틸 (`addDays`, `iso`, `weekday`, `isWeekend`, `nthWeekday`, `lastWeekday`) |
| `kr.ts` | 한국 공휴일 — 고정일 규칙 + 음력 표(2025–2030) + 대체공휴일 |
| `us.ts` | 미국 연방 공휴일 — 전부 규칙 계산, 연도 제한 없음 |
| `index.ts` | `holidaysInYear`, `holidaysInRange`, `holidaysByDate`, `resolveHolidayCountries` |

각 파일에 `*.test.ts` + `*.cases.md` 쌍이 있다.

## 한국(KR)

### 지원 연도

`KR_SUPPORTED_YEARS = { from: 2025, to: 2030 }`. 표가 없는 연도는 **빈 배열**을 반환한다 — 고정일만 보여주면 "설날이 없네"처럼 잘못 읽힐 수 있어 통째로 비운다.

새 연도를 추가하려면 `kr.ts`의 `LUNAR_TABLE`에 그 해 설날·부처님오신날·추석의 양력 날짜(+ 선거일·임시공휴일 등 `extras`)를 추가하고 `KR_SUPPORTED_YEARS.to`를 올린다. 정부가 임시공휴일을 새로 지정하면 해당 연도의 `extras`에 `{ date, key: 'temporaryHoliday' }`를 추가한다.

### 고정일 vs 음력

- 고정일(신정, 3·1절, 어린이날, 현충일, 광복절, 개천절, 한글날, 성탄절, 제헌절)은 규칙으로 계산.
- **제헌절**은 2026년부터 다시 공휴일(`CONSTITUTION_DAY_SINCE = 2026`) — 2025년은 미포함.
- 설날·부처님오신날·추석은 음력이라 연도별 양력 날짜를 표(`LUNAR_TABLE`)로 둔다.
- **근로자의 날(노동절)**은 관공서의 공휴일에 관한 규정상 공휴일이 아니라 포함하지 않는다.

### 대체공휴일

| 정책 | 대상 | 조건 |
|---|---|---|
| `weekend` | 3·1절, 어린이날, 부처님오신날, 제헌절, 광복절, 개천절, 한글날, 성탄절 | 토·일 어느 쪽과 겹쳐도 대체 |
| `sunday` | 설날 연휴, 추석 연휴 | 일요일과만 겹칠 때 대체 (토요일은 대체 없음) |
| `none` | 신정, 현충일, 선거일, 임시공휴일 | 대체 없음 |

`policy !== 'none'`인 공휴일이 다른 공휴일과 같은 날 겹치면, 주말 여부와 무관하게 대체가 하나 더 생긴다(예: 2025-05-05 어린이날 = 부처님오신날 → 대체공휴일 하루). 대체일은 원래 날짜 이후 첫 "평일이면서 공휴일이 아닌 날"이며, 이미 배정된 대체일도 건너뛴다.

## 미국(US)

연방 공휴일 11종을 전부 규칙으로 계산하므로 연도 제한이 없다.

- 고정 날짜 공휴일(신정, Juneteenth, 독립기념일, Veterans Day, 성탄절)만 observed 규칙이 붙는다 — 토요일이면 전날 금요일, 일요일이면 다음 월요일이 `substitute: true`로 추가된다.
- 요일 규칙 공휴일(MLK Day, Presidents' Day, Memorial Day, Labor Day, Columbus Day, Thanksgiving)은 항상 평일이라 observed가 없다.
- Juneteenth는 2021년부터 연방 공휴일(`since: 2021`) — 그 이전 연도는 반환하지 않는다.

## 조회 API

- `holidaysInYear(country, year)` — 한 나라·한 해.
- `holidaysInRange(countries, start, end)` — 여러 나라, 날짜순 정렬(같은 날엔 `countries` 순서).
- `holidaysByDate(countries, start, end)` — 캘린더 셀에서 바로 찾도록 날짜별로 묶는다. `DiaryMonthGrid`가 이 함수를 쓴다.
- `resolveHolidayCountries(setting, locale)` — 설정값 해석. `null`(기본값)이면 앱 언어를 따라 자동(ko→KR, en→US); 사용자가 마이페이지에서 토글하면 그 시점부터 명시적 배열이 저장되고 이후 언어를 바꿔도 유지된다. 빈 배열(`[]`, 두 나라 모두 끔)은 "아무 나라도 표시 안 함"으로 `null`과 구분된다.

## 화면·저장소 연결

- 표시: [`docs/flows/log.md §공휴일 표시`](../flows/log.md)
- 설정 UI: [`docs/flows/settings.md §공휴일 설정`](../flows/settings.md)
- 저장 스키마: `UserSettings.holidayCountries` (`readonly HolidayCountry[] | null`), Supabase `profiles.holiday_countries text[] null` (migration `0014_profiles_holiday_countries.sql`) — [`docs/architecture/data-layer.md`](../architecture/data-layer.md)

## 변경 이력

| 날짜 | 변경 |
|---|---|
| 2026-09-14 | 최초 도입 — KR(2025–2030 음력 표 + 대체공휴일) + US(규칙 기반, 무제한 연도) |
