# `lib/date` — Unit test cases

대상: `src/lib/date/index.ts` 의 `ISO_DATE_RE` 정규식 + `isValidISODate(s: unknown): s is ISODate` 타입 가드 + `formatFullDate(d, locale)` + `formatMonthName(d, locale)` + `formatMonthDay(d, locale)` + `formatCompactDate(d, locale, { omitYear })` + `formatDateShort(d, locale)` + `calendarGrid(year, monthIndex, weekStartsOn)` (`./calendarGrid`, `index.ts` 에서 재수출).

Last run: 2026-09-21 — 50/50 passed

## `ISO_DATE_RE`

| #   | 설명 (`it` title)                           | 입력           | 기대 결과 | 결과 |
| --- | ------------------------------------------- | -------------- | --------- | ---- |
| 1   | matches a well-formed YYYY-MM-DD string     | `'2026-02-01'` | `true`    | ✅   |
| 2   | does not match strings missing zero padding | `'2026-2-1'`   | `false`   | ✅   |
| 3   | does not match strings without dashes       | `'20260201'`   | `false`   | ✅   |

## `isValidISODate`

| #   | 설명 (`it` title)                                               | 입력                                   | 기대 결과     | 결과 |
| --- | --------------------------------------------------------------- | -------------------------------------- | ------------- | ---- |
| 4   | returns true for a well-formed date                             | `'2026-02-01'`                         | `true`        | ✅   |
| 5   | returns true for a leap-year Feb 29                             | `'2024-02-29'`                         | `true`        | ✅   |
| 6   | returns true for year/month boundaries                          | `'2026-12-31'`, `'2026-01-01'`         | `true` (both) | ✅   |
| 7   | returns false when the format is wrong (single-digit month/day) | `'2026-2-1'`                           | `false`       | ✅   |
| 8   | returns false when the format is wrong (no dashes)              | `'20260201'`                           | `false`       | ✅   |
| 9   | returns false when the format is wrong (slashes)                | `'2026/02/01'`                         | `false`       | ✅   |
| 10  | returns false for a non-date string                             | `'not a date'`                         | `false`       | ✅   |
| 11  | returns false for an invalid month (> 12)                       | `'2026-13-01'`                         | `false`       | ✅   |
| 12  | returns false for an invalid day (Feb 30)                       | `'2026-02-30'`                         | `false`       | ✅   |
| 13  | returns false for Feb 29 on a non-leap year                     | `'2025-02-29'`                         | `false`       | ✅   |
| 14  | returns false for non-string inputs                             | `undefined`, `null`, `123`, `{}`, `[]` | `false` (all) | ✅   |
| 15  | returns false for an empty string                               | `''`                                   | `false`       | ✅   |

**Notes**

- `ISO_DATE_RE` 는 문자열 형식만 검사 (regex). 의미적 유효성(예: 2026-02-30, 2025-02-29)은 통과시킨다.
- `isValidISODate` 는 regex 통과 + `parseISO`의 `isValid` 둘 다 만족해야 true. 두 단계로 잘못된 값을 잡는다.

## `formatFullDate`

| #   | 설명 (`it` title)                                                         | 입력                                              | 기대 결과                          | 결과 |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------- | ---- |
| 16  | renders ko full date with weekday for a Monday                            | `'2026-06-15'`, `'ko'`                            | `'2026년 6월 15일 월요일'`         | ✅   |
| 17  | renders en full date with weekday for a Monday                            | `'2026-06-15'`, `'en'`                            | `'Monday, June 15, 2026'`          | ✅   |
| 18  | renders a Sunday in ko                                                    | `'2026-06-14'`, `'ko'`                            | `'2026년 6월 14일 일요일'`         | ✅   |
| 19  | renders a Sunday in en                                                    | `'2026-06-14'`, `'en'`                            | `'Sunday, June 14, 2026'`          | ✅   |
| 20  | produces the same output for an ISO string and its equivalent Date object | `fromISO('2026-06-15')` vs `'2026-06-15'`, `'en'` | both calls return identical string | ✅   |
| 21  | renders the last day of a month correctly                                 | `'2026-01-31'`, `'en'`                            | `'Saturday, January 31, 2026'`     | ✅   |
| 22  | renders the first day of the next month correctly                         | `'2026-02-01'`, `'en'`                            | `'Sunday, February 1, 2026'`       | ✅   |

## `formatMonthName`

| #   | 설명 (`it` title)                                                        | 입력                                             | 기대 결과     | 결과 |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------- | ------------- | ---- |
| 23  | renders ko month name for a mid-year date                                 | `'2026-06-15'`, `'ko'`                            | `'6월'`       | ✅   |
| 24  | renders en month name for a mid-year date                                 | `'2026-06-15'`, `'en'`                            | `'June'`      | ✅   |
| 25  | renders ko month name for December (year-end boundary)                    | `'2026-12-01'`, `'ko'`                            | `'12월'`      | ✅   |
| 26  | renders en month name for December (year-end boundary)                    | `'2026-12-01'`, `'en'`                            | `'December'`  | ✅   |
| 27  | produces the same output for an ISO string and its equivalent Date object | `fromISO('2026-06-15')` vs `'2026-06-15'`, `'ko'` | both calls return identical string | ✅   |

## `formatMonthDay`

| #   | 설명 (`it` title)                                                        | 입력                                             | 기대 결과      | 결과 |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------- | -------------- | ---- |
| 28  | renders ko month/day without a year for a mid-month date                  | `'2026-06-15'`, `'ko'`                            | `'6월 15일'`   | ✅   |
| 29  | renders en month/day without a year for a mid-month date                  | `'2026-06-15'`, `'en'`                            | `'Jun 15'`     | ✅   |
| 30  | renders ko month/day for Jan 1 (year-start boundary)                      | `'2026-01-01'`, `'ko'`                            | `'1월 1일'`    | ✅   |
| 31  | renders en month/day for Jan 1 (year-start boundary)                      | `'2026-01-01'`, `'en'`                            | `'Jan 1'`      | ✅   |
| 32  | produces the same output for an ISO string and its equivalent Date object | `fromISO('2026-06-15')` vs `'2026-06-15'`, `'en'` | both calls return identical string | ✅   |

## `formatCompactDate`

| #   | 설명 (`it` title)                                                        | 입력                                                                     | 기대 결과      | 결과 |
| --- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------- | ---- |
| 33  | renders ko date with year when omitYear is false                          | `'2026-06-15'`, `'ko'`, `{ omitYear: false }`                              | `'26.06.15'`   | ✅   |
| 34  | renders ko date without year when omitYear is true                        | `'2026-06-15'`, `'ko'`, `{ omitYear: true }`                               | `'06.15'`      | ✅   |
| 35  | renders en date with year when omitYear is false                          | `'2026-06-15'`, `'en'`, `{ omitYear: false }`                              | `'Jun 15, 26'` | ✅   |
| 36  | renders en date without year when omitYear is true                        | `'2026-06-15'`, `'en'`, `{ omitYear: true }`                               | `'Jun 15'`     | ✅   |
| 37  | produces the same output for an ISO string and its equivalent Date object | `fromISO('2026-06-15')` vs `'2026-06-15'`, `'ko'`, `{ omitYear: false }`   | both calls return identical string | ✅   |

## `formatDateShort`

| #   | 설명 (`it` title)                                                              | 입력                                              | 기대 결과            | 결과 |
| --- | --------------------------------------------------------------------------------- | -------------------------------------------------- | --------------------- | ---- |
| 38  | renders ko date as yyyy.MM.dd                                                     | `'2026-06-15'`, `'ko'`                             | `'2026.06.15'`        | ✅   |
| 39  | renders en date as "Month Year Day" (documented quirk, not "Month Day, Year")     | `'2026-06-15'`, `'en'`                             | `'June 2026 15'`      | ✅   |
| 40  | renders ko date for the last day of the year (boundary)                           | `'2026-12-31'`, `'ko'`                             | `'2026.12.31'`        | ✅   |
| 41  | renders en date for the last day of the year (boundary, same quirk)               | `'2026-12-31'`, `'en'`                             | `'December 2026 31'`  | ✅   |
| 42  | produces the same output for an ISO string and its equivalent Date object         | `fromISO('2026-06-15')` vs `'2026-06-15'`, `'en'`  | both calls return identical string | ✅   |

**Notes**

- Row #39/#41: `formatDateShort` 의 en 출력은 의도적으로 "Month Year Day" 순서 (`${formatMonthLabel(date, 'en')} ${date.getDate()}`) — "Month Day, Year" 가 아님. 현재 동작을 그대로 테스트함 (고치지 않음, 호출측이 이 형식에 의존할 수 있어 변경은 별도 논의 필요).

## `calendarGrid`

| #   | 설명 (`it` title)                                                                      | 입력                                                    | 기대 결과                                              | 결과 |
| --- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------- | ---- |
| 43  | returns a 5-week (35-cell) grid for a month needing 5 rows, Sunday start               | `calendarGrid(2026, 8, 0)` (Sep 2026)                   | `length=35`, first `'2026-08-30'`, last `'2026-10-03'` | ✅   |
| 44  | returns a 4-week (28-cell) grid when the month exactly fills whole weeks, Sunday start | `calendarGrid(2026, 1, 0)` (Feb 2026)                   | `length=28`, first `'2026-02-01'`, last `'2026-02-28'` | ✅   |
| 45  | returns a 6-week (42-cell) grid for a month needing 6 rows, Sunday start               | `calendarGrid(2026, 7, 0)` (Aug 2026)                   | `length=42`, first `'2026-07-26'`, last `'2026-09-05'` | ✅   |
| 46  | shifts the leading padding when weekStartsOn is Monday                                 | `calendarGrid(2026, 8, 1)` (Sep 2026, Mon start)        | `length=35`, first `'2026-08-31'`, last `'2026-10-04'` | ✅   |
| 47  | marks leading and trailing padding cells as outside the current month                  | `calendarGrid(2026, 8, 0)` cells `[0,1]` and last 3     | `inCurrentMonth=false` for both groups                 | ✅   |
| 48  | marks every day within the target month as inCurrentMonth                              | `calendarGrid(2026, 8, 0)` filtered to `2026-09-01..30` | 30 cells, all `inCurrentMonth=true`                    | ✅   |
| 49  | marks every cell true when the month exactly fills whole weeks                         | `calendarGrid(2026, 1, 0)` (Feb 2026, no padding)       | every cell `inCurrentMonth=true`                       | ✅   |
| 50  | produces consecutive ISO dates with no gaps or duplicates                              | `calendarGrid(2026, 7, 0)` (Aug 2026, 42 cells)         | each cell is exactly 1 day after the previous          | ✅   |

**Notes**

- Weekday facts verified with `python3` (`datetime.date(...).strftime('%A')`) before writing expectations: 2026-09-01 = Tue, 2026-02-01 = Sun (28-day Feb), 2026-08-01 = Sat.
- Row #43/#46 cover the bug this changeset fixes: the grid used to always pad to 42 cells (6 weeks); now it returns only the weeks the month actually spans (28/35/42).
